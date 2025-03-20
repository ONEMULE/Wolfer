#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
WRF Model Setup GUI Tool - Summary Module

This module displays a summary of all settings.

Author: AI Assistant
Date: 2025-03-20
"""

import tkinter as tk
from tkinter import ttk
import datetime

class SummaryTab:
    def __init__(self, parent, config, physics_options, projections, data_sources):
        self.parent = parent
        self.config = config
        self.physics_options = physics_options
        self.projections = projections
        self.data_sources = data_sources
        
        self.setup_ui()
    
    def setup_ui(self):
        """Setup the summary tab UI"""
        # Create scrollable text widget
        self.summary_text = tk.Text(self.parent, wrap=tk.WORD, width=80, height=30)
        scrollbar = ttk.Scrollbar(self.parent, orient="vertical", command=self.summary_text.yview)
        self.summary_text.configure(yscrollcommand=scrollbar.set)
        
        self.summary_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=10, pady=10)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y, pady=10)
        
        # Make text read-only
        self.summary_text.config(state=tk.DISABLED)
        
        # Initial update
        self.update_summary()
    
    def update_summary(self):
        """Update summary text with current configuration"""
        self.summary_text.config(state=tk.NORMAL)
        self.summary_text.delete(1.0, tk.END)
        
        # Add title
        self.summary_text.insert(tk.END, "WRF Model Configuration Summary\n", "title")
        self.summary_text.insert(tk.END, "=" * 50 + "\n\n")
        
        # Add simulation period
        self.summary_text.insert(tk.END, "Simulation Period\n", "section")
        self.summary_text.insert(tk.END, "-" * 30 + "\n")
        
        try:
            start_date = datetime.datetime.strptime(self.config["start_date"], "%Y-%m-%d_%H:%M:%S")
            end_date = datetime.datetime.strptime(self.config["end_date"], "%Y-%m-%d_%H:%M:%S")
            
            self.summary_text.insert(tk.END, f"Start Date: {start_date.strftime('%Y-%m-%d %H:%M:%S')}\n")
            self.summary_text.insert(tk.END, f"End Date: {end_date.strftime('%Y-%m-%d %H:%M:%S')}\n")
            
            duration = end_date - start_date
            hours = duration.total_seconds() / 3600
            days = hours / 24
            
            self.summary_text.insert(tk.END, f"Duration: {hours:.1f} hours ({days:.1f} days)\n\n")
        except:
            self.summary_text.insert(tk.END, "Error parsing simulation dates\n\n")
        
        # Add domain information
        self.summary_text.insert(tk.END, "Domain Configuration\n", "section")
        self.summary_text.insert(tk.END, "-" * 30 + "\n")
        
        self.summary_text.insert(tk.END, f"Number of Domains: {self.config['domain']['max_dom']}\n")
        self.summary_text.insert(tk.END, f"Map Projection: {self.projections.get(self.config['projection'], 'Unknown')}\n")
        self.summary_text.insert(tk.END, f"Reference Point: ({self.config['domain']['ref_lat']}, {self.config['domain']['ref_lon']})\n\n")
        
        # Domain 1 details
        self.summary_text.insert(tk.END, "Parent Domain (Domain 1):\n")
        self.summary_text.insert(tk.END, f"  Grid Size: {self.config['domain']['e_we']} x {self.config['domain']['e_sn']} points\n")
        self.summary_text.insert(tk.END, f"  Grid Resolution: {self.config['domain']['dx']} km x {self.config['domain']['dy']} km\n")
        
        # Nested domains
        for i in range(1, self.config['domain']['max_dom']):
            self.summary_text.insert(tk.END, f"\nNested Domain {i+1}:\n")
            self.summary_text.insert(tk.END, f"  Parent Grid Ratio: {self.config['domain']['parent_grid_ratio'][i]}\n")
            self.summary_text.insert(tk.END, f"  I-Parent Start: {self.config['domain']['i_parent_start'][i]}\n")
            self.summary_text.insert(tk.END, f"  J-Parent Start: {self.config['domain']['j_parent_start'][i]}\n")
            self.summary_text.insert(tk.END, f"  Parent Time Step Ratio: {self.config['domain']['parent_time_step_ratio'][i]}\n")
            
            # Calculate nested domain resolution
            parent_idx = i - 1  # Parent domain index (0-based)
            parent_ratio = 1
            for j in range(1, i+1):
                parent_ratio *= self.config['domain']['parent_grid_ratio'][j]
            
            nested_dx = self.config['domain']['dx'] / parent_ratio
            nested_dy = self.config['domain']['dy'] / parent_ratio
            
            self.summary_text.insert(tk.END, f"  Grid Resolution: {nested_dx:.3f} km x {nested_dy:.3f} km\n")
        
        self.summary_text.insert(tk.END, "\n")
        
        # Add physics options
        self.summary_text.insert(tk.END, "Physics Options\n", "section")
        self.summary_text.insert(tk.END, "-" * 30 + "\n")
        
        mp_physics = self.config['physics']['mp_physics']
        self.summary_text.insert(tk.END, f"Microphysics: {mp_physics} - {self.physics_options['mp_physics'].get(mp_physics, 'Unknown')}\n")
        
        ra_lw_physics = self.config['physics']['ra_lw_physics']
        self.summary_text.insert(tk.END, f"Longwave Radiation: {ra_lw_physics} - {self.physics_options['ra_lw_physics'].get(ra_lw_physics, 'Unknown')}\n")
        
        ra_sw_physics = self.config['physics']['ra_sw_physics']
        self.summary_text.insert(tk.END, f"Shortwave Radiation: {ra_sw_physics} - {self.physics_options['ra_sw_physics'].get(ra_sw_physics, 'Unknown')}\n")
        
        sf_surface_physics = self.config['physics']['sf_surface_physics']
        self.summary_text.insert(tk.END, f"Land Surface: {sf_surface_physics} - {self.physics_options['sf_surface_physics'].get(sf_surface_physics, 'Unknown')}\n")
        
        bl_pbl_physics = self.config['physics']['bl_pbl_physics']
        self.summary_text.insert(tk.END, f"Planetary Boundary Layer: {bl_pbl_physics} - {self.physics_options['bl_pbl_physics'].get(bl_pbl_physics, 'Unknown')}\n")
        
        cu_physics = self.config['physics']['cu_physics']
        self.summary_text.insert(tk.END, f"Cumulus: {cu_physics} - {self.physics_options['cu_physics'].get(cu_physics, 'Unknown')}\n\n")
        
        # Add data source information
        self.summary_text.insert(tk.END, "Data Source\n", "section")
        self.summary_text.insert(tk.END, "-" * 30 + "\n")
        
        data_source = self.config['data_source']
        self.summary_text.insert(tk.END, f"Meteorological Data: {data_source} - {self.data_sources.get(data_source, 'Unknown')}\n")
        self.summary_text.insert(tk.END, f"Output Directory: {self.config['output_dir']}\n\n")
        
        # Add user settings
        self.summary_text.insert(tk.END, "User Settings\n", "section")
        self.summary_text.insert(tk.END, "-" * 30 + "\n")
        
        geog_data_path = self.config['user_settings'].get('geog_data_path', 'Not set')
        self.summary_text.insert(tk.END, f"WPS_GEOG Directory: {geog_data_path}\n")
        
        wps_path = self.config['user_settings'].get('wps_path', 'Not set')
        self.summary_text.insert(tk.END, f"WPS Directory: {wps_path}\n")
        
        wrf_path = self.config['user_settings'].get('wrf_path', 'Not set')
        self.summary_text.insert(tk.END, f"WRF Directory: {wrf_path}\n")
        
        if data_source == "ERA5":
            self.summary_text.insert(tk.END, f"CDS API Key: {'*' * 10 if self.config['user_settings'].get('cds_api_key') else 'Not set'}\n")
            self.summary_text.insert(tk.END, f"CDS API URL: {self.config['user_settings'].get('cds_api_url', 'Not set')}\n")
        
        # Add text tags
        self.summary_text.tag_configure("title", font=("Arial", 14, "bold"))
        self.summary_text.tag_configure("section", font=("Arial", 12, "bold"))
        
        # Make text read-only again
        self.summary_text.config(state=tk.DISABLED)