#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
WRF Model Setup GUI Tool - Data Source Module

This module handles the meteorological data source settings.

Author: AI Assistant
Date: 2025-03-20
"""

import tkinter as tk
from tkinter import ttk, filedialog
import webbrowser

class DataTab:
    def __init__(self, parent, config, data_sources):
        self.parent = parent
        self.config = config
        self.data_sources = data_sources
        
        self.setup_ui()
    
    def setup_ui(self):
        """Setup the data source tab UI"""
        # Data source selection
        source_frame = ttk.LabelFrame(self.parent, text="Meteorological Data Source")
        source_frame.pack(fill=tk.X, padx=10, pady=10)
        
        self.data_source_var = tk.StringVar()
        self.data_source_var.set(self.config["data_source"])
        
        for key, value in self.data_sources.items():
            ttk.Radiobutton(source_frame, text=f"{key}: {value}", variable=self.data_source_var, 
                           value=key, command=self.on_data_source_changed).pack(anchor=tk.W, padx=20, pady=5)
        
        # Data source info
        self.data_info_frame = ttk.LabelFrame(self.parent, text="Data Source Information")
        self.data_info_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Output directory
        output_frame = ttk.Frame(self.parent)
        output_frame.pack(fill=tk.X, padx=10, pady=10)
        
        ttk.Label(output_frame, text="Output Directory:").pack(side=tk.LEFT, padx=5)
        
        self.output_dir_var = tk.StringVar()
        self.output_dir_var.set(self.config["output_dir"])
        ttk.Entry(output_frame, width=50, textvariable=self.output_dir_var).pack(side=tk.LEFT, padx=5, fill=tk.X, expand=True)
        
        ttk.Button(output_frame, text="Browse...", command=self.browse_output_dir).pack(side=tk.LEFT, padx=5)
        
        # Show initial data source info
        self.on_data_source_changed()

    def on_data_source_changed(self):
        """Handle change in data source"""
        # Clear current frame
        for widget in self.data_info_frame.winfo_children():
            widget.destroy()
        
        # Show information based on data source
        data_source = self.data_source_var.get()
        
        if data_source == "GFS":
            ttk.Label(self.data_info_frame, text="NCEP Global Forecast System (GFS)", 
                     font=("Arial", 10, "bold")).pack(anchor=tk.W, padx=10, pady=5)
            ttk.Label(self.data_info_frame, text="Resolution: 0.25 degrees global").pack(anchor=tk.W, padx=10, pady=2)
            ttk.Label(self.data_info_frame, text="Time interval: 3 hours").pack(anchor=tk.W, padx=10, pady=2)
            ttk.Label(self.data_info_frame, text="Source: NCEP/NOAA").pack(anchor=tk.W, padx=10, pady=2)
            
            link_frame = ttk.Frame(self.data_info_frame)
            link_frame.pack(anchor=tk.W, padx=10, pady=5)
            ttk.Label(link_frame, text="Website: ").pack(side=tk.LEFT)
            link_label = ttk.Label(link_frame, text="https://www.ncei.noaa.gov/products/weather-climate-models/global-forecast", 
                                  foreground="blue", cursor="hand2")
            link_label.pack(side=tk.LEFT)
            link_label.bind("<Button-1>", lambda e: webbrowser.open_new("https://www.ncei.noaa.gov/products/weather-climate-models/global-forecast"))
            
            ttk.Label(self.data_info_frame, text="No authentication required for download.").pack(anchor=tk.W, padx=10, pady=5)
            
        elif data_source == "ERA5":
            ttk.Label(self.data_info_frame, text="ECMWF ERA5 Reanalysis", 
                     font=("Arial", 10, "bold")).pack(anchor=tk.W, padx=10, pady=5)
            ttk.Label(self.data_info_frame, text="Resolution: 0.25 degrees global").pack(anchor=tk.W, padx=10, pady=2)
            ttk.Label(self.data_info_frame, text="Time interval: 1 hour").pack(anchor=tk.W, padx=10, pady=2)
            ttk.Label(self.data_info_frame, text="Source: European Centre for Medium-Range Weather Forecasts").pack(anchor=tk.W, padx=10, pady=2)
            
            link_frame = ttk.Frame(self.data_info_frame)
            link_frame.pack(anchor=tk.W, padx=10, pady=5)
            ttk.Label(link_frame, text="Website: ").pack(side=tk.LEFT)
            link_label = ttk.Label(link_frame, text="https://cds.climate.copernicus.eu/", 
                                  foreground="blue", cursor="hand2")
            link_label.pack(side=tk.LEFT)
            link_label.bind("<Button-1>", lambda e: webbrowser.open_new("https://cds.climate.copernicus.eu/"))
            
            ttk.Label(self.data_info_frame, text="Authentication required. You need to register and set up the CDS API key.").pack(anchor=tk.W, padx=10, pady=5)
            
            ttk.Button(self.data_info_frame, text="How to get CDS API key", 
                      command=lambda: webbrowser.open_new("https://cds.climate.copernicus.eu/api-how-to")).pack(anchor=tk.W, padx=10, pady=5)
            
        elif data_source == "FNL":
            ttk.Label(self.data_info_frame, text="NCEP Final Analysis (FNL)", 
                     font=("Arial", 10, "bold")).pack(anchor=tk.W, padx=10, pady=5)
            ttk.Label(self.data_info_frame, text="Resolution: 0.25 degrees global").pack(anchor=tk.W, padx=10, pady=2)
            ttk.Label(self.data_info_frame, text="Time interval: 6 hours").pack(anchor=tk.W, padx=10, pady=2)
            ttk.Label(self.data_info_frame, text="Source: NCEP/NOAA").pack(anchor=tk.W, padx=10, pady=2)
            
            link_frame = ttk.Frame(self.data_info_frame)
            link_frame.pack(anchor=tk.W, padx=10, pady=5)
            ttk.Label(link_frame, text="Website: ").pack(side=tk.LEFT)
            link_label = ttk.Label(link_frame, text="https://rda.ucar.edu/datasets/ds083.2/", 
                                  foreground="blue", cursor="hand2")
            link_label.pack(side=tk.LEFT)
            link_label.bind("<Button-1>", lambda e: webbrowser.open_new("https://rda.ucar.edu/datasets/ds083.2/"))
            
            ttk.Label(self.data_info_frame, text="Registration at UCAR RDA required for download.").pack(anchor=tk.W, padx=10, pady=5)
            
        elif data_source == "NARR":
            ttk.Label(self.data_info_frame, text="North American Regional Reanalysis (NARR)", 
                     font=("Arial", 10, "bold")).pack(anchor=tk.W, padx=10, pady=5)
            ttk.Label(self.data_info_frame, text="Resolution: 32 km over North America").pack(anchor=tk.W, padx=10, pady=2)
            ttk.Label(self.data_info_frame, text="Time interval: 3 hours").pack(anchor=tk.W, padx=10, pady=2)
            ttk.Label(self.data_info_frame, text="Source: NCEP/NOAA").pack(anchor=tk.W, padx=10, pady=2)
            
            link_frame = ttk.Frame(self.data_info_frame)
            link_frame.pack(anchor=tk.W, padx=10, pady=5)
            ttk.Label(link_frame, text="Website: ").pack(side=tk.LEFT)
            link_label = ttk.Label(link_frame, text="https://www.ncei.noaa.gov/products/weather-climate-models/north-american-regional", 
                                  foreground="blue", cursor="hand2")
            link_label.pack(side=tk.LEFT)
            link_label.bind("<Button-1>", lambda e: webbrowser.open_new("https://www.ncei.noaa.gov/products/weather-climate-models/north-american-regional"))
            
            ttk.Label(self.data_info_frame, text="No authentication required for download.").pack(anchor=tk.W, padx=10, pady=5)
        
        # Update config
        self.config["data_source"] = data_source

    def browse_output_dir(self):
        """Browse for output directory"""
        directory = filedialog.askdirectory(initialdir=self.output_dir_var.get())
        if directory:
            self.output_dir_var.set(directory)
            self.config["output_dir"] = directory
    
    def update_config(self):
        """Update configuration with current values"""
        self.config["data_source"] = self.data_source_var.get()
        self.config["output_dir"] = self.output_dir_var.get()