#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
WRF Model Setup GUI Tool - Physics Options Module

This module handles the physics scheme selections.

Author: AI Assistant
Date: 2025-03-20
"""

import tkinter as tk
from tkinter import ttk

class PhysicsTab:
    def __init__(self, parent, config, physics_options):
        self.parent = parent
        self.config = config
        self.physics_options = physics_options
        
        self.setup_ui()
    
    def setup_ui(self):
        """Setup the physics options tab UI"""
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
        
        # Microphysics
        mp_frame = ttk.LabelFrame(scrollable_frame, text="Microphysics Scheme")
        mp_frame.pack(fill=tk.X, padx=10, pady=5)
        
        self.mp_physics_var = tk.IntVar()
        self.mp_physics_var.set(self.config["physics"]["mp_physics"])
        
        for key, value in self.physics_options["mp_physics"].items():
            ttk.Radiobutton(mp_frame, text=f"{key}: {value}", variable=self.mp_physics_var, 
                           value=key).pack(anchor=tk.W, padx=20, pady=2)
        
        # Longwave radiation
        ra_lw_frame = ttk.LabelFrame(scrollable_frame, text="Longwave Radiation Scheme")
        ra_lw_frame.pack(fill=tk.X, padx=10, pady=5)
        
        self.ra_lw_physics_var = tk.IntVar()
        self.ra_lw_physics_var.set(self.config["physics"]["ra_lw_physics"])
        
        for key, value in self.physics_options["ra_lw_physics"].items():
            ttk.Radiobutton(ra_lw_frame, text=f"{key}: {value}", variable=self.ra_lw_physics_var, 
                           value=key).pack(anchor=tk.W, padx=20, pady=2)
        
        # Shortwave radiation
        ra_sw_frame = ttk.LabelFrame(scrollable_frame, text="Shortwave Radiation Scheme")
        ra_sw_frame.pack(fill=tk.X, padx=10, pady=5)
        
        self.ra_sw_physics_var = tk.IntVar()
        self.ra_sw_physics_var.set(self.config["physics"]["ra_sw_physics"])
        
        for key, value in self.physics_options["ra_sw_physics"].items():
            ttk.Radiobutton(ra_sw_frame, text=f"{key}: {value}", variable=self.ra_sw_physics_var, 
                           value=key).pack(anchor=tk.W, padx=20, pady=2)
        
        # Surface layer
        sf_frame = ttk.LabelFrame(scrollable_frame, text="Land Surface Scheme")
        sf_frame.pack(fill=tk.X, padx=10, pady=5)
        
        self.sf_surface_physics_var = tk.IntVar()
        self.sf_surface_physics_var.set(self.config["physics"]["sf_surface_physics"])
        
        for key, value in self.physics_options["sf_surface_physics"].items():
            ttk.Radiobutton(sf_frame, text=f"{key}: {value}", variable=self.sf_surface_physics_var, 
                           value=key).pack(anchor=tk.W, padx=20, pady=2)
        
        # Boundary layer
        bl_frame = ttk.LabelFrame(scrollable_frame, text="Planetary Boundary Layer Scheme")
        bl_frame.pack(fill=tk.X, padx=10, pady=5)
        
        self.bl_pbl_physics_var = tk.IntVar()
        self.bl_pbl_physics_var.set(self.config["physics"]["bl_pbl_physics"])
        
        for key, value in self.physics_options["bl_pbl_physics"].items():
            ttk.Radiobutton(bl_frame, text=f"{key}: {value}", variable=self.bl_pbl_physics_var, 
                           value=key).pack(anchor=tk.W, padx=20, pady=2)
        
        # Cumulus
        cu_frame = ttk.LabelFrame(scrollable_frame, text="Cumulus Scheme")
        cu_frame.pack(fill=tk.X, padx=10, pady=5)
        
        self.cu_physics_var = tk.IntVar()
        self.cu_physics_var.set(self.config["physics"]["cu_physics"])
        
        for key, value in self.physics_options["cu_physics"].items():
            ttk.Radiobutton(cu_frame, text=f"{key}: {value}", variable=self.cu_physics_var, 
                           value=key).pack(anchor=tk.W, padx=20, pady=2)
    
    def update_config(self):
        """Update configuration with current values"""
        self.config["physics"]["mp_physics"] = self.mp_physics_var.get()
        self.config["physics"]["ra_lw_physics"] = self.ra_lw_physics_var.get()
        self.config["physics"]["ra_sw_physics"] = self.ra_sw_physics_var.get()
        self.config["physics"]["sf_surface_physics"] = self.sf_surface_physics_var.get()
        self.config["physics"]["bl_pbl_physics"] = self.bl_pbl_physics_var.get()
        self.config["physics"]["cu_physics"] = self.cu_physics_var.get()