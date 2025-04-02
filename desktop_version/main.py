#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
WRF Model Setup GUI Tool - Main Program

This is the main program for the WRF Model Setup GUI Tool.
It initializes the application and loads other modules.

Author: AI Assistant
Date: 2025-03-20
"""

import os
import sys
import json
import tkinter as tk
from tkinter import ttk, messagebox
import datetime
import queue
import threading

# Import modules
from simulation_module import SimulationTab
from domain_module import DomainTab
from physics_module import PhysicsTab
from data_module import DataTab
from settings_module import SettingsTab
from summary_module import SummaryTab
from generator_module import WRFGenerator

class WRFSetupApp:
    def __init__(self, root):
        self.root = root
        self.root.title("WRF Model Setup Tool")
        self.root.geometry("900x700")
        self.root.minsize(900, 700)
        
        # Try to set icon if available
        try:
            self.root.iconbitmap("wrf_icon.ico")
        except:
            pass
        
        # Initialize configuration with default values
        self.config = {
            "start_date": datetime.datetime.now().strftime("%Y-%m-%d_%H:%M:%S"),
            "end_date": (datetime.datetime.now() + datetime.timedelta(days=3)).strftime("%Y-%m-%d_%H:%M:%S"),
            "domain": {
                "e_we": 100,
                "e_sn": 100,
                "dx": 30.0,
                "dy": 30.0,
                "ref_lat": 40.0,
                "ref_lon": 116.0,
                "truelat1": 30.0,
                "truelat2": 60.0,
                "stand_lon": 116.0,
                "max_dom": 1,
                "parent_grid_ratio": [1, 3, 3],
                "i_parent_start": [1, 31, 31],
                "j_parent_start": [1, 17, 33],
                "parent_time_step_ratio": [1, 3, 3]
            },
            "projection": 1,
            "physics": {
                "mp_physics": 6,
                "ra_lw_physics": 1,
                "ra_sw_physics": 1,
                "sf_surface_physics": 2,
                "bl_pbl_physics": 1,
                "cu_physics": 1
            },
            "data_source": "GFS",
            "output_dir": os.path.join(os.path.expanduser("~"), "wrf_run"),
            "user_settings": {
                "geog_data_path": "",
                "cds_api_key": "",
                "cds_api_url": "https://cds.climate.copernicus.eu/api/v2",
                "wps_path": "",
                "wrf_path": ""
            }
        }
        
        # Available options for physics schemes
        self.physics_options = {
            "mp_physics": {
                1: "Kessler scheme",
                2: "Lin et al. scheme",
                3: "WSM3 scheme",
                4: "WSM5 scheme",
                6: "WSM6 scheme",
                8: "Thompson scheme",
                10: "Morrison 2-moment scheme"
            },
            "ra_lw_physics": {
                1: "RRTM scheme",
                3: "CAM scheme",
                4: "RRTMG scheme"
            },
            "ra_sw_physics": {
                1: "Dudhia scheme",
                2: "Goddard shortwave",
                3: "CAM scheme",
                4: "RRTMG scheme"
            },
            "sf_surface_physics": {
                1: "Thermal diffusion scheme",
                2: "Noah Land Surface Model",
                3: "RUC Land Surface Model",
                4: "Noah-MP Land Surface Model"
            },
            "bl_pbl_physics": {
                1: "YSU scheme",
                2: "Mellor-Yamada-Janjic scheme",
                4: "QNSE scheme",
                5: "MYNN2 scheme",
                6: "MYNN3 scheme"
            },
            "cu_physics": {
                0: "No cumulus",
                1: "Kain-Fritsch scheme",
                2: "Betts-Miller-Janjic scheme",
                3: "Grell-Freitas scheme",
                5: "Grell-3D scheme"
            }
        }
        
        # Available map projections
        self.projections = {
            1: "Lambert Conformal",
            2: "Polar Stereographic",
            3: "Mercator",
            6: "Lat-Lon (including global)"
        }
        
        # Available data sources
        self.data_sources = {
            "GFS": "NCEP Global Forecast System",
            "ERA5": "ECMWF ERA5 Reanalysis",
            "FNL": "NCEP Final Analysis",
            "NARR": "North American Regional Reanalysis"
        }
        
        # Load saved configuration if exists
        self.config_file = os.path.join(os.path.expanduser("~"), ".wrf_setup_config.json")
        self.load_config()
        
        # Create notebook (tabs)
        self.notebook = ttk.Notebook(self.root)
        self.notebook.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Create tabs
        self.tab_simulation = ttk.Frame(self.notebook)
        self.tab_domain = ttk.Frame(self.notebook)
        self.tab_physics = ttk.Frame(self.notebook)
        self.tab_data = ttk.Frame(self.notebook)
        self.tab_settings = ttk.Frame(self.notebook)
        self.tab_summary = ttk.Frame(self.notebook)
        
        self.notebook.add(self.tab_simulation, text="Simulation Period")
        self.notebook.add(self.tab_domain, text="Domain Setup")
        self.notebook.add(self.tab_physics, text="Physics Options")
        self.notebook.add(self.tab_data, text="Data Source")
        self.notebook.add(self.tab_settings, text="Settings")
        self.notebook.add(self.tab_summary, text="Summary")
        
        # Initialize tab modules
        self.simulation_tab = SimulationTab(self.tab_simulation, self.config)
        self.domain_tab = DomainTab(self.tab_domain, self.config, self.projections)
        self.physics_tab = PhysicsTab(self.tab_physics, self.config, self.physics_options)
        self.data_tab = DataTab(self.tab_data, self.config, self.data_sources)
        self.settings_tab = SettingsTab(self.tab_settings, self.config)
        self.summary_tab = SummaryTab(self.tab_summary, self.config, self.physics_options, self.projections, self.data_sources)
        
        # Create bottom buttons
        self.button_frame = ttk.Frame(self.root)
        self.button_frame.pack(fill=tk.X, padx=10, pady=10)
        
        self.btn_prev = ttk.Button(self.button_frame, text="Previous", command=self.go_to_prev_tab)
        self.btn_prev.pack(side=tk.LEFT, padx=5)
        
        self.btn_next = ttk.Button(self.button_frame, text="Next", command=self.go_to_next_tab)
        self.btn_next.pack(side=tk.LEFT, padx=5)
        
        self.btn_save = ttk.Button(self.button_frame, text="Save Configuration", command=self.save_config)
        self.btn_save.pack(side=tk.RIGHT, padx=5)
        
        self.btn_generate = ttk.Button(self.button_frame, text="Generate Files", command=self.generate_files)
        self.btn_generate.pack(side=tk.RIGHT, padx=5)
        
        # Status bar
        self.status_var = tk.StringVar()
        self.status_var.set("Ready")
        self.status_bar = ttk.Label(self.root, textvariable=self.status_var, relief=tk.SUNKEN, anchor=tk.W)
        self.status_bar.pack(side=tk.BOTTOM, fill=tk.X)
        
        # Set style
        self.style = ttk.Style()
        self.style.configure("TLabel", font=("Arial", 10))
        self.style.configure("TButton", font=("Arial", 10))
        self.style.configure("TCheckbutton", font=("Arial", 10))
        self.style.configure("TRadiobutton", font=("Arial", 10))
        
        # Bind events
        self.notebook.bind("<<NotebookTabChanged>>", self.on_tab_changed)
        
        # Queue for thread communication
        self.queue = queue.Queue()
        
    def process_queue(self):
        """Process messages from worker threads"""
        try:
            msg = self.queue.get(0)
            self.status_var.set(msg)
            self.root.after(100, self.process_queue)
        except queue.Empty:
            self.root.after(100, self.process_queue)
    
    def on_tab_changed(self, event):
        """Update data when tab is changed"""
        # Get current tab index
        current_tab = self.notebook.index(self.notebook.select())
        
        # Update config from tab data
        if current_tab == 0:
            self.simulation_tab.update_config(self.config)
        elif current_tab == 1:
            self.domain_tab.update_config(self.config)
        elif current_tab == 2:
            self.physics_tab.update_config(self.config)
        elif current_tab == 3:
            self.data_tab.update_config(self.config)
        elif current_tab == 4:
            self.settings_tab.update_config(self.config)
        elif current_tab == 5:
            self.summary_tab.update_view(self.config)
    
    def go_to_prev_tab(self):
        """Navigate to previous tab"""
        current_tab = self.notebook.index(self.notebook.select())
        if current_tab > 0:
            self.notebook.select(current_tab - 1)
    
    def go_to_next_tab(self):
        """Navigate to next tab"""
        current_tab = self.notebook.index(self.notebook.select())
        if current_tab < self.notebook.index("end") - 1:
            self.notebook.select(current_tab + 1)
    
    def load_config(self):
        """Load configuration from file"""
        try:
            if os.path.exists(self.config_file):
                with open(self.config_file, 'r') as f:
                    loaded_config = json.load(f)
                    self.config.update(loaded_config)
                self.status_var.set("Configuration loaded from " + self.config_file)
        except Exception as e:
            messagebox.showerror("Error", f"Failed to load configuration: {str(e)}")
            self.status_var.set("Error loading configuration")
    
    def save_config(self):
        """Save configuration to file"""
        try:
            # Update config from all tabs
            self.simulation_tab.update_config(self.config)
            self.domain_tab.update_config(self.config)
            self.physics_tab.update_config(self.config)
            self.data_tab.update_config(self.config)
            self.settings_tab.update_config(self.config)
            
            # Save to file
            with open(self.config_file, 'w') as f:
                json.dump(self.config, f, indent=4)
            
            self.status_var.set("Configuration saved to " + self.config_file)
            messagebox.showinfo("Success", f"Configuration saved to {self.config_file}")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to save configuration: {str(e)}")
            self.status_var.set("Error saving configuration")
    
    def generate_files(self):
        """Generate WRF input files"""
        try:
            # Update config from all tabs
            self.simulation_tab.update_config(self.config)
            self.domain_tab.update_config(self.config)
            self.physics_tab.update_config(self.config)
            self.data_tab.update_config(self.config)
            self.settings_tab.update_config(self.config)
            
            # Create output directory if it doesn't exist
            os.makedirs(self.config["output_dir"], exist_ok=True)
            
            # Create a generator in a separate thread
            self.status_var.set("Generating files...")
            
            # Start queue processing
            self.root.after(100, self.process_queue)
            
            # Create generator and run in a separate thread
            generator = WRFGenerator(self.config, self.queue)
            thread = threading.Thread(target=generator.generate_all)
            thread.daemon = True
            thread.start()
            
            # Show a message
            messagebox.showinfo("Info", f"Generating files in directory: {self.config['output_dir']}\n\nThis may take a few minutes. Progress will be shown in the status bar.")
            
        except Exception as e:
            messagebox.showerror("Error", f"Failed to generate files: {str(e)}")
            self.status_var.set("Error generating files")

def main():
    root = tk.Tk()
    app = WRFSetupApp(root)
    root.mainloop()

if __name__ == "__main__":
    main()