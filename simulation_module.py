#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
WRF Model Setup GUI Tool - Simulation Period Module

This module handles the simulation period settings.

Author: AI Assistant
Date: 2025-03-20
"""

import tkinter as tk
from tkinter import ttk
import datetime
from tkcalendar import DateEntry

class SimulationTab:
    def __init__(self, parent, config):
        self.parent = parent
        self.config = config
        
        self.setup_ui()
        
    def setup_ui(self):
        """Setup the simulation period tab UI"""
        frame = ttk.LabelFrame(self.parent, text="Simulation Period")
        frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Start date
        start_frame = ttk.Frame(frame)
        start_frame.pack(fill=tk.X, padx=10, pady=5)
        
        ttk.Label(start_frame, text="Start Date:").pack(side=tk.LEFT, padx=5)
        
        self.start_date_var = tk.StringVar()
        self.start_date_var.set(datetime.datetime.now().strftime("%Y-%m-%d"))
        
        self.start_date_picker = DateEntry(start_frame, width=12, background='darkblue',
                                          foreground='white', borderwidth=2, date_pattern='yyyy-mm-dd',
                                          textvariable=self.start_date_var)
        self.start_date_picker.pack(side=tk.LEFT, padx=5)
        
        ttk.Label(start_frame, text="Time:").pack(side=tk.LEFT, padx=5)
        
        self.start_hour_var = tk.StringVar()
        self.start_hour_var.set("00")
        self.start_hour_combo = ttk.Combobox(start_frame, width=2, textvariable=self.start_hour_var, 
                                            values=[f"{i:02d}" for i in range(24)])
        self.start_hour_combo.pack(side=tk.LEFT)
        
        ttk.Label(start_frame, text=":").pack(side=tk.LEFT)
        
        self.start_min_var = tk.StringVar()
        self.start_min_var.set("00")
        self.start_min_combo = ttk.Combobox(start_frame, width=2, textvariable=self.start_min_var, 
                                           values=[f"{i:02d}" for i in range(0, 60, 15)])
        self.start_min_combo.pack(side=tk.LEFT)
        
        ttk.Label(start_frame, text=":").pack(side=tk.LEFT)
        
        self.start_sec_var = tk.StringVar()
        self.start_sec_var.set("00")
        self.start_sec_combo = ttk.Combobox(start_frame, width=2, textvariable=self.start_sec_var, 
                                           values=["00"])
        self.start_sec_combo.pack(side=tk.LEFT)
        
        # End date
        end_frame = ttk.Frame(frame)
        end_frame.pack(fill=tk.X, padx=10, pady=5)
        
        ttk.Label(end_frame, text="End Date:").pack(side=tk.LEFT, padx=5)
        
        self.end_date_var = tk.StringVar()
        self.end_date_var.set((datetime.datetime.now() + datetime.timedelta(days=3)).strftime("%Y-%m-%d"))
        
        self.end_date_picker = DateEntry(end_frame, width=12, background='darkblue',
                                        foreground='white', borderwidth=2, date_pattern='yyyy-mm-dd',
                                        textvariable=self.end_date_var)
        self.end_date_picker.pack(side=tk.LEFT, padx=5)
        
        ttk.Label(end_frame, text="Time:").pack(side=tk.LEFT, padx=5)
        
        self.end_hour_var = tk.StringVar()
        self.end_hour_var.set("00")
        self.end_hour_combo = ttk.Combobox(end_frame, width=2, textvariable=self.end_hour_var, 
                                          values=[f"{i:02d}" for i in range(24)])
        self.end_hour_combo.pack(side=tk.LEFT)
        
        ttk.Label(end_frame, text=":").pack(side=tk.LEFT)
        
        self.end_min_var = tk.StringVar()
        self.end_min_var.set("00")
        self.end_min_combo = ttk.Combobox(end_frame, width=2, textvariable=self.end_min_var, 
                                         values=[f"{i:02d}" for i in range(0, 60, 15)])
        self.end_min_combo.pack(side=tk.LEFT)
        
        ttk.Label(end_frame, text=":").pack(side=tk.LEFT)
        
        self.end_sec_var = tk.StringVar()
        self.end_sec_var.set("00")
        self.end_sec_combo = ttk.Combobox(end_frame, width=2, textvariable=self.end_sec_var, 
                                         values=["00"])
        self.end_sec_combo.pack(side=tk.LEFT)
        
        # Duration display
        duration_frame = ttk.Frame(frame)
        duration_frame.pack(fill=tk.X, padx=10, pady=15)
        
        ttk.Label(duration_frame, text="Simulation Duration:").pack(side=tk.LEFT, padx=5)
        
        self.duration_var = tk.StringVar()
        self.duration_var.set("72 hours (3 days)")
        ttk.Label(duration_frame, textvariable=self.duration_var, font=("Arial", 10, "bold")).pack(side=tk.LEFT, padx=5)
        
        # Calculate button
        ttk.Button(duration_frame, text="Calculate Duration", command=self.calculate_duration).pack(side=tk.RIGHT, padx=5)
        
        # Load values from config
        if "start_date" in self.config:
            try:
                dt = datetime.datetime.strptime(self.config["start_date"], "%Y-%m-%d_%H:%M:%S")
                self.start_date_var.set(dt.strftime("%Y-%m-%d"))
                self.start_hour_var.set(dt.strftime("%H"))
                self.start_min_var.set(dt.strftime("%M"))
                self.start_sec_var.set(dt.strftime("%S"))
            except:
                pass
        
        if "end_date" in self.config:
            try:
                dt = datetime.datetime.strptime(self.config["end_date"], "%Y-%m-%d_%H:%M:%S")
                self.end_date_var.set(dt.strftime("%Y-%m-%d"))
                self.end_hour_var.set(dt.strftime("%H"))
                self.end_min_var.set(dt.strftime("%M"))
                self.end_sec_var.set(dt.strftime("%S"))
            except:
                pass
        
        self.calculate_duration()

    def calculate_duration(self):
        """Calculate and display simulation duration"""
        try:
            start_date_str = f"{self.start_date_var.get()}_{self.start_hour_var.get()}:{self.start_min_var.get()}:{self.start_sec_var.get()}"
            end_date_str = f"{self.end_date_var.get()}_{self.end_hour_var.get()}:{self.end_min_var.get()}:{self.end_sec_var.get()}"
            
            start_date = datetime.datetime.strptime(start_date_str, "%Y-%m-%d_%H:%M:%S")
            end_date = datetime.datetime.strptime(end_date_str, "%Y-%m-%d_%H:%M:%S")
            
            duration = end_date - start_date
            hours = duration.total_seconds() / 3600
            days = hours / 24
            
            if hours < 0:
                self.duration_var.set("Error: End date is before start date")
            else:
                self.duration_var.set(f"{hours:.1f} hours ({days:.1f} days)")
                
                # Update config
                self.config["start_date"] = start_date.strftime("%Y-%m-%d_%H:%M:%S")
                self.config["end_date"] = end_date.strftime("%Y-%m-%d_%H:%M:%S")
        except Exception as e:
            self.duration_var.set(f"Error: {str(e)}")
    
    def update_config(self):
        """Update configuration with current values"""
        self.calculate_duration()