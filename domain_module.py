#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
WRF Model Setup GUI Tool - Domain Setup Module

This module handles the domain and map projection settings.

Author: AI Assistant
Date: 2025-03-20
"""

import tkinter as tk
from tkinter import ttk

class DomainTab:
    def __init__(self, parent, config, projections):
        self.parent = parent
        self.config = config
        self.projections = projections
        self.nested_frames = []
        
        self.setup_ui()
    
    def setup_ui(self):
        """Setup the domain configuration tab UI"""
        # Main frame
        main_frame = ttk.Frame(self.parent)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Left frame for domain settings
        left_frame = ttk.LabelFrame(main_frame, text="Domain Settings")
        left_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # Number of domains
        dom_frame = ttk.Frame(left_frame)
        dom_frame.pack(fill=tk.X, padx=10, pady=5)
        
        ttk.Label(dom_frame, text="Number of domains:").pack(side=tk.LEFT, padx=5)
        
        self.max_dom_var = tk.IntVar()
        self.max_dom_var.set(self.config["domain"]["max_dom"])
        self.max_dom_combo = ttk.Combobox(dom_frame, width=5, textvariable=self.max_dom_var, 
                                         values=[1, 2, 3])
        self.max_dom_combo.pack(side=tk.LEFT, padx=5)
        self.max_dom_combo.bind("<<ComboboxSelected>>", self.on_max_dom_changed)
        
        # Reference point
        ref_frame = ttk.Frame(left_frame)
        ref_frame.pack(fill=tk.X, padx=10, pady=5)
        
        ttk.Label(ref_frame, text="Reference Latitude:").pack(side=tk.LEFT, padx=5)
        
        self.ref_lat_var = tk.DoubleVar()
        self.ref_lat_var.set(self.config["domain"]["ref_lat"])
        ttk.Entry(ref_frame, width=10, textvariable=self.ref_lat_var).pack(side=tk.LEFT, padx=5)
        
        ttk.Label(ref_frame, text="Reference Longitude:").pack(side=tk.LEFT, padx=5)
        
        self.ref_lon_var = tk.DoubleVar()
        self.ref_lon_var.set(self.config["domain"]["ref_lon"])
        ttk.Entry(ref_frame, width=10, textvariable=self.ref_lon_var).pack(side=tk.LEFT, padx=5)
        
        # Domain 1 settings
        self.d1_frame = ttk.LabelFrame(left_frame, text="Domain 1 (Parent)")
        self.d1_frame.pack(fill=tk.X, padx=10, pady=5)
        
        # Grid resolution
        res_frame = ttk.Frame(self.d1_frame)
        res_frame.pack(fill=tk.X, padx=5, pady=5)
        
        ttk.Label(res_frame, text="Grid resolution dx (km):").pack(side=tk.LEFT, padx=5)
        
        self.dx_var = tk.DoubleVar()
        self.dx_var.set(self.config["domain"]["dx"])
        ttk.Entry(res_frame, width=10, textvariable=self.dx_var).pack(side=tk.LEFT, padx=5)
        
        ttk.Label(res_frame, text="Grid resolution dy (km):").pack(side=tk.LEFT, padx=5)
        
        self.dy_var = tk.DoubleVar()
        self.dy_var.set(self.config["domain"]["dy"])
        ttk.Entry(res_frame, width=10, textvariable=self.dy_var).pack(side=tk.LEFT, padx=5)
        
        # Grid size
        size_frame = ttk.Frame(self.d1_frame)
        size_frame.pack(fill=tk.X, padx=5, pady=5)
        
        ttk.Label(size_frame, text="Grid points west-east:").pack(side=tk.LEFT, padx=5)
        
        self.e_we_var = tk.IntVar()
        self.e_we_var.set(self.config["domain"]["e_we"])
        ttk.Entry(size_frame, width=10, textvariable=self.e_we_var).pack(side=tk.LEFT, padx=5)
        
        ttk.Label(size_frame, text="Grid points south-north:").pack(side=tk.LEFT, padx=5)
        
        self.e_sn_var = tk.IntVar()
        self.e_sn_var.set(self.config["domain"]["e_sn"])
        ttk.Entry(size_frame, width=10, textvariable=self.e_sn_var).pack(side=tk.LEFT, padx=5)
        
        # Create nested domain frames
        self.nested_frames_container = ttk.Frame(left_frame)
        self.nested_frames_container.pack(fill=tk.BOTH, expand=True)
        self.create_nested_domain_frames()
        
        # Right frame for projection settings
        right_frame = ttk.LabelFrame(main_frame, text="Map Projection")
        right_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # Projection selection
        proj_frame = ttk.Frame(right_frame)
        proj_frame.pack(fill=tk.X, padx=10, pady=10)
        
        ttk.Label(proj_frame, text="Select Projection:").pack(side=tk.LEFT, padx=5)
        
        self.projection_var = tk.IntVar()
        self.projection_var.set(self.config["projection"])
        
        proj_options_frame = ttk.Frame(right_frame)
        proj_options_frame.pack(fill=tk.X, padx=10, pady=5)
        
        for key, value in self.projections.items():
            ttk.Radiobutton(proj_options_frame, text=value, variable=self.projection_var, 
                           value=key, command=self.on_projection_changed).pack(anchor=tk.W, padx=20, pady=2)
        
        # Projection specific parameters
        self.proj_params_frame = ttk.LabelFrame(right_frame, text="Projection Parameters")
        self.proj_params_frame.pack(fill=tk.X, padx=10, pady=10)
        
        # Lambert parameters (default)
        self.lambert_frame = ttk.Frame(self.proj_params_frame)
        
        ttk.Label(self.lambert_frame, text="True Latitude 1:").grid(row=0, column=0, padx=5, pady=5, sticky=tk.W)
        self.truelat1_var = tk.DoubleVar()
        self.truelat1_var.set(self.config["domain"]["truelat1"])
        ttk.Entry(self.lambert_frame, width=10, textvariable=self.truelat1_var).grid(row=0, column=1, padx=5, pady=5)
        
        ttk.Label(self.lambert_frame, text="True Latitude 2:").grid(row=1, column=0, padx=5, pady=5, sticky=tk.W)
        self.truelat2_var = tk.DoubleVar()
        self.truelat2_var.set(self.config["domain"]["truelat2"])
        ttk.Entry(self.lambert_frame, width=10, textvariable=self.truelat2_var).grid(row=1, column=1, padx=5, pady=5)
        
        ttk.Label(self.lambert_frame, text="Standard Longitude:").grid(row=2, column=0, padx=5, pady=5, sticky=tk.W)
        self.stand_lon_var = tk.DoubleVar()
        self.stand_lon_var.set(self.config["domain"]["stand_lon"])
        ttk.Entry(self.lambert_frame, width=10, textvariable=self.stand_lon_var).grid(row=2, column=1, padx=5, pady=5)
        
        # Polar parameters
        self.polar_frame = ttk.Frame(self.proj_params_frame)
        
        ttk.Label(self.polar_frame, text="True Latitude:").grid(row=0, column=0, padx=5, pady=5, sticky=tk.W)
        # Reuse truelat1_var
        ttk.Entry(self.polar_frame, width=10, textvariable=self.truelat1_var).grid(row=0, column=1, padx=5, pady=5)
        
        ttk.Label(self.polar_frame, text="Standard Longitude:").grid(row=1, column=0, padx=5, pady=5, sticky=tk.W)
        # Reuse stand_lon_var
        ttk.Entry(self.polar_frame, width=10, textvariable=self.stand_lon_var).grid(row=1, column=1, padx=5, pady=5)
        
        # Mercator parameters
        self.mercator_frame = ttk.Frame(self.proj_params_frame)
        
        ttk.Label(self.mercator_frame, text="True Latitude:").grid(row=0, column=0, padx=5, pady=5, sticky=tk.W)
        # Reuse truelat1_var
        ttk.Entry(self.mercator_frame, width=10, textvariable=self.truelat1_var).grid(row=0, column=1, padx=5, pady=5)
        
        # Lat-Lon parameters
        self.latlon_frame = ttk.Frame(self.proj_params_frame)
        ttk.Label(self.latlon_frame, text="No additional parameters needed").pack(padx=5, pady=5)
        
        # Show initial projection frame
        self.on_projection_changed()

    def create_nested_domain_frames(self):
        """Create frames for nested domains"""
        # Clear existing frames
        for frame in self.nested_frames:
            frame.destroy()
        self.nested_frames = []
        
        # Create frames for each nested domain
        for i in range(1, self.max_dom_var.get()):
            domain_num = i + 1
            frame = ttk.LabelFrame(self.nested_frames_container, text=f"Domain {domain_num} (Nested)")
            frame.pack(fill=tk.X, padx=10, pady=5)
            
            # Grid ratio
            ratio_frame = ttk.Frame(frame)
            ratio_frame.pack(fill=tk.X, padx=5, pady=5)
            
            ttk.Label(ratio_frame, text=f"Grid ratio (relative to parent):").pack(side=tk.LEFT, padx=5)
            
            ratio_var = tk.IntVar()
            ratio_var.set(self.config["domain"]["parent_grid_ratio"][i])
            ratio_combo = ttk.Combobox(ratio_frame, width=5, textvariable=ratio_var, values=[3, 5, 7])
            ratio_combo.pack(side=tk.LEFT, padx=5)
            
            # I/J start
            start_frame = ttk.Frame(frame)
            start_frame.pack(fill=tk.X, padx=5, pady=5)
            
            ttk.Label(start_frame, text=f"I-offset from parent:").pack(side=tk.LEFT, padx=5)
            
            i_start_var = tk.IntVar()
            i_start_var.set(self.config["domain"]["i_parent_start"][i])
            ttk.Entry(start_frame, width=10, textvariable=i_start_var).pack(side=tk.LEFT, padx=5)
            
            ttk.Label(start_frame, text=f"J-offset from parent:").pack(side=tk.LEFT, padx=5)
            
            j_start_var = tk.IntVar()
            j_start_var.set(self.config["domain"]["j_parent_start"][i])
            ttk.Entry(start_frame, width=10, textvariable=j_start_var).pack(side=tk.LEFT, padx=5)
            
            # Time step ratio
            time_frame = ttk.Frame(frame)
            time_frame.pack(fill=tk.X, padx=5, pady=5)
            
            ttk.Label(time_frame, text=f"Time step ratio:").pack(side=tk.LEFT, padx=5)
            
            time_ratio_var = tk.IntVar()
            time_ratio_var.set(self.config["domain"]["parent_time_step_ratio"][i])
            time_combo = ttk.Combobox(time_frame, width=5, textvariable=time_ratio_var, values=[3, 5, 7])
            time_combo.pack(side=tk.LEFT, padx=5)
            
            # Store variables for later access
            frame.ratio_var = ratio_var
            frame.i_start_var = i_start_var
            frame.j_start_var = j_start_var
            frame.time_ratio_var = time_ratio_var
            frame.domain_num = domain_num
            
            self.nested_frames.append(frame)

    def on_max_dom_changed(self, event=None):
        """Handle change in number of domains"""
        # Update config
        self.config["domain"]["max_dom"] = self.max_dom_var.get()
        
        # Recreate nested domain frames
        self.create_nested_domain_frames()

    def on_projection_changed(self):
        """Handle change in projection"""
        # Clear current frame
        for widget in self.proj_params_frame.winfo_children():
            widget.pack_forget()
        
        # Show appropriate frame based on projection
        proj = self.projection_var.get()
        if proj == 1:  # Lambert
            self.lambert_frame.pack(fill=tk.BOTH, expand=True)
        elif proj == 2:  # Polar
            self.polar_frame.pack(fill=tk.BOTH, expand=True)
        elif proj == 3:  # Mercator
            self.mercator_frame.pack(fill=tk.BOTH, expand=True)
        elif proj == 6:  # Lat-Lon
            self.latlon_frame.pack(fill=tk.BOTH, expand=True)
        
        # Update config
        self.config["projection"] = proj
    
    def update_config(self):
        """Update configuration with current values"""
        # Update domain settings
        self.config["domain"]["max_dom"] = self.max_dom_var.get()
        self.config["domain"]["ref_lat"] = self.ref_lat_var.get()
        self.config["domain"]["ref_lon"] = self.ref_lon_var.get()
        self.config["domain"]["dx"] = self.dx_var.get()
        self.config["domain"]["dy"] = self.dy_var.get()
        self.config["domain"]["e_we"] = self.e_we_var.get()
        self.config["domain"]["e_sn"] = self.e_sn_var.get()
        
        # Update projection settings
        self.config["projection"] = self.projection_var.get()
        self.config["domain"]["truelat1"] = self.truelat1_var.get()
        self.config["domain"]["truelat2"] = self.truelat2_var.get()
        self.config["domain"]["stand_lon"] = self.stand_lon_var.get()
        
        # Update nested domain settings
        for i, frame in enumerate(self.nested_frames, 1):
            self.config["domain"]["parent_grid_ratio"][i] = frame.ratio_var.get()
            self.config["domain"]["i_parent_start"][i] = frame.i_start_var.get()
            self.config["domain"]["j_parent_start"][i] = frame.j_start_var.get()
            self.config["domain"]["parent_time_step_ratio"][i] = frame.time_ratio_var.get()