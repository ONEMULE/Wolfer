#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
WRF Model Setup GUI Tool - Settings Module

This module handles user settings such as paths and API keys.

Author: AI Assistant
Date: 2025-03-20
"""

import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import webbrowser
import os
import subprocess
import platform
import sys  # 添加缺失的导入

class SettingsTab:
    def __init__(self, parent, config):
        self.parent = parent
        self.config = config
        
        self.setup_ui()
    
    def setup_ui(self):
        """Setup the settings tab UI"""
        # Create scrollable frame
        canvas = tk.Canvas(self.parent)
        scrollbar = ttk.Scrollbar(self.parent, orient="vertical", command=canvas.yview)
        scrollable_frame = ttk.Frame(canvas)
        
        scrollable_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(
                scrollregion=canvas.bbox("all")
            )
        )
        
        canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)
        
        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")
        
        # WRF and WPS paths
        paths_frame = ttk.LabelFrame(scrollable_frame, text="WRF and WPS Paths")
        paths_frame.pack(fill=tk.X, padx=10, pady=5)
        
        # WPS path
        wps_frame = ttk.Frame(paths_frame)
        wps_frame.pack(fill=tk.X, padx=5, pady=5)
        
        ttk.Label(wps_frame, text="WPS Directory:").pack(side=tk.LEFT, padx=5)
        
        self.wps_path_var = tk.StringVar()
        self.wps_path_var.set(self.config["user_settings"].get("wps_path", ""))
        ttk.Entry(wps_frame, width=50, textvariable=self.wps_path_var).pack(side=tk.LEFT, padx=5, fill=tk.X, expand=True)
        
        ttk.Button(wps_frame, text="Browse...", command=self.browse_wps_path).pack(side=tk.LEFT, padx=5)
        
        # WRF path
        wrf_frame = ttk.Frame(paths_frame)
        wrf_frame.pack(fill=tk.X, padx=5, pady=5)
        
        ttk.Label(wrf_frame, text="WRF Directory:").pack(side=tk.LEFT, padx=5)
        
        self.wrf_path_var = tk.StringVar()
        self.wrf_path_var.set(self.config["user_settings"].get("wrf_path", ""))
        ttk.Entry(wrf_frame, width=50, textvariable=self.wrf_path_var).pack(side=tk.LEFT, padx=5, fill=tk.X, expand=True)
        
        ttk.Button(wrf_frame, text="Browse...", command=self.browse_wrf_path).pack(side=tk.LEFT, padx=5)
        
        # Geog data path
        geog_frame = ttk.LabelFrame(scrollable_frame, text="Geographical Data Path")
        geog_frame.pack(fill=tk.X, padx=10, pady=5)
        
        geog_path_frame = ttk.Frame(geog_frame)
        geog_path_frame.pack(fill=tk.X, padx=5, pady=5)
        
        ttk.Label(geog_path_frame, text="WPS_GEOG Directory:").pack(side=tk.LEFT, padx=5)
        
        self.geog_data_path_var = tk.StringVar()
        self.geog_data_path_var.set(self.config["user_settings"].get("geog_data_path", ""))
        ttk.Entry(geog_path_frame, width=50, textvariable=self.geog_data_path_var).pack(side=tk.LEFT, padx=5, fill=tk.X, expand=True)
        
        ttk.Button(geog_path_frame, text="Browse...", command=self.browse_geog_path).pack(side=tk.LEFT, padx=5)
        
        ttk.Label(geog_frame, text="If you don't have the geographical static data, you can download it from:").pack(anchor=tk.W, padx=10, pady=5)
        
        link_frame = ttk.Frame(geog_frame)
        link_frame.pack(anchor=tk.W, padx=10, pady=2)
        link_label = ttk.Label(link_frame, text="https://www2.mmm.ucar.edu/wrf/users/download/get_sources_wps_geog.html", 
                              foreground="blue", cursor="hand2")
        link_label.pack(side=tk.LEFT)
        link_label.bind("<Button-1>", lambda e: webbrowser.open_new("https://www2.mmm.ucar.edu/wrf/users/download/get_sources_wps_geog.html"))
        
        # CDS API settings
        cds_frame = ttk.LabelFrame(scrollable_frame, text="CDS API Settings (for ERA5)")
        cds_frame.pack(fill=tk.X, padx=10, pady=5)
        
        ttk.Label(cds_frame, text="These settings are required only if you use ERA5 data").pack(anchor=tk.W, padx=10, pady=5)
        
        # CDS API key
        key_frame = ttk.Frame(cds_frame)
        key_frame.pack(fill=tk.X, padx=5, pady=5)
        
        ttk.Label(key_frame, text="CDS API Key:").pack(side=tk.LEFT, padx=5)
        
        self.cds_api_key_var = tk.StringVar()
        self.cds_api_key_var.set(self.config["user_settings"].get("cds_api_key", ""))
        ttk.Entry(key_frame, width=50, textvariable=self.cds_api_key_var, show="*").pack(side=tk.LEFT, padx=5, fill=tk.X, expand=True)
        
        # CDS API URL
        url_frame = ttk.Frame(cds_frame)
        url_frame.pack(fill=tk.X, padx=5, pady=5)
        
        ttk.Label(url_frame, text="CDS API URL:").pack(side=tk.LEFT, padx=5)
        
        self.cds_api_url_var = tk.StringVar()
        self.cds_api_url_var.set(self.config["user_settings"].get("cds_api_url", "https://cds.climate.copernicus.eu/api/v2"))
        ttk.Entry(url_frame, width=50, textvariable=self.cds_api_url_var).pack(side=tk.LEFT, padx=5, fill=tk.X, expand=True)
        
        ttk.Label(cds_frame, text="To get your CDS API key, register at:").pack(anchor=tk.W, padx=10, pady=5)
        
        link_frame = ttk.Frame(cds_frame)
        link_frame.pack(anchor=tk.W, padx=10, pady=2)
        link_label = ttk.Label(link_frame, text="https://cds.climate.copernicus.eu/", 
                              foreground="blue", cursor="hand2")
        link_label.pack(side=tk.LEFT)
        link_label.bind("<Button-1>", lambda e: webbrowser.open_new("https://cds.climate.copernicus.eu/"))
        
        # Test CDS API button
        ttk.Button(cds_frame, text="Test CDS API Connection", command=self.test_cds_api).pack(anchor=tk.W, padx=10, pady=10)
        
        # System environment
        env_frame = ttk.LabelFrame(scrollable_frame, text="System Environment")
        env_frame.pack(fill=tk.X, padx=10, pady=5)
        
        # System info
        sys_frame = ttk.Frame(env_frame)
        sys_frame.pack(fill=tk.X, padx=5, pady=5)
        
        ttk.Label(sys_frame, text=f"Operating System: {platform.system()} {platform.release()}").pack(anchor=tk.W, padx=10, pady=2)
        ttk.Label(sys_frame, text=f"Python Version: {platform.python_version()}").pack(anchor=tk.W, padx=10, pady=2)
        
        # Check required packages
        ttk.Button(env_frame, text="Check Required Packages", command=self.check_packages).pack(anchor=tk.W, padx=10, pady=10)
    
    def browse_wps_path(self):
        """Browse for WPS directory"""
        directory = filedialog.askdirectory(initialdir=self.wps_path_var.get() or os.path.expanduser("~"))
        if directory:
            self.wps_path_var.set(directory)
            self.config["user_settings"]["wps_path"] = directory
    
    def browse_wrf_path(self):
        """Browse for WRF directory"""
        directory = filedialog.askdirectory(initialdir=self.wrf_path_var.get() or os.path.expanduser("~"))
        if directory:
            self.wrf_path_var.set(directory)
            self.config["user_settings"]["wrf_path"] = directory
    
    def browse_geog_path(self):
        """Browse for WPS_GEOG directory"""
        directory = filedialog.askdirectory(initialdir=self.geog_data_path_var.get() or os.path.expanduser("~"))
        if directory:
            self.geog_data_path_var.set(directory)
            self.config["user_settings"]["geog_data_path"] = directory
    
    def test_cds_api(self):
        """Test CDS API connection"""
        api_key = self.cds_api_key_var.get()
        api_url = self.cds_api_url_var.get()
        
        if not api_key:
            messagebox.showerror("Error", "Please enter your CDS API key")
            return
        
        try:
            # Create temporary .cdsapirc file
            home_dir = os.path.expanduser("~")
            cdsapirc_path = os.path.join(home_dir, ".cdsapirc")
            
            # Backup existing file if any
            backup_path = None
            if os.path.exists(cdsapirc_path):
                backup_path = cdsapirc_path + ".backup"
                os.rename(cdsapirc_path, backup_path)
            
            # Create new file
            with open(cdsapirc_path, "w") as f:
                f.write(f"url: {api_url}\n")
                f.write(f"key: {api_key}\n")
            
            # Test connection with Python
            try:
                import cdsapi
                client = cdsapi.Client()
                client.retrieve(
                    'reanalysis-era5-pressure-levels',
                    {
                        'product_type': 'reanalysis',
                        'format': 'grib',
                        'variable': 'temperature',
                        'pressure_level': '1000',
                        'year': '2020',
                        'month': '01',
                        'day': '01',
                        'time': '12:00',
                        'area': [90, -180, -90, 180],
                    },
                    os.path.join(home_dir, 'test.grib'),
                    request_kwargs={'verify': True}
                )
                os.remove(os.path.join(home_dir, 'test.grib'))
                messagebox.showinfo("Success", "CDS API connection test successful!")
            except Exception as e:
                messagebox.showerror("Error", f"CDS API test failed: {str(e)}")
            
            # Restore backup if any
            if backup_path:
                os.remove(cdsapirc_path)
                os.rename(backup_path, cdsapirc_path)
            
        except Exception as e:
            messagebox.showerror("Error", f"Failed to test CDS API: {str(e)}")
            if backup_path and os.path.exists(backup_path):
                os.rename(backup_path, cdsapirc_path)
    
    def check_packages(self):
        """Check required packages"""
        required_packages = ["numpy", "matplotlib", "netCDF4", "cdsapi", "xarray", "wrf-python"]
        
        missing_packages = []
        for package in required_packages:
            try:
                __import__(package)
            except ImportError:
                missing_packages.append(package)
        
        if missing_packages:
            msg = "The following required packages are missing:\n\n"
            msg += "\n".join(missing_packages)
            msg += "\n\nWould you like to install them now?"
            
            if messagebox.askyesno("Missing Packages", msg):
                try:
                    for package in missing_packages:
                        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
                    messagebox.showinfo("Success", "All required packages have been installed.")
                except Exception as e:
                    messagebox.showerror("Error", f"Failed to install packages: {str(e)}")
        else:
            messagebox.showinfo("Success", "All required packages are installed.")
    
    def update_config(self):
        """Update configuration with current values"""
        self.config["user_settings"]["wps_path"] = self.wps_path_var.get()
        self.config["user_settings"]["wrf_path"] = self.wrf_path_var.get()
        self.config["user_settings"]["geog_data_path"] = self.geog_data_path_var.get()
        self.config["user_settings"]["cds_api_key"] = self.cds_api_key_var.get()
        self.config["user_settings"]["cds_api_url"] = self.cds_api_url_var.get()