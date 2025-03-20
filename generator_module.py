#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
WRF Model Setup GUI Tool - Generator Module

This module generates namelist files and download scripts.

Author: AI Assistant
Date: 2025-03-20
"""

import os
import datetime
import queue
import time
import sys
import platform


class WRFGenerator:
    def __init__(self, config, message_queue):
        self.config = config
        self.queue = message_queue

    def generate_all(self):
        """Generate all required files"""
        try:
            # Create output directory if it doesn't exist
            if not os.path.exists(self.config["output_dir"]):
                os.makedirs(self.config["output_dir"])

            self.queue.put("Generating namelist.wps...")
            self.generate_namelist_wps()
            time.sleep(0.5)  # Small delay for UI responsiveness

            self.queue.put("Generating namelist.input...")
            self.generate_namelist_input()
            time.sleep(0.5)

            self.queue.put("Generating download script...")
            self.generate_download_script()
            time.sleep(0.5)

            self.queue.put("Generating run script...")
            self.generate_run_script()
            time.sleep(0.5)

            self.queue.put("File generation complete!")
        except Exception as e:
            self.queue.put(f"Error: {str(e)}")

    def generate_namelist_wps(self):
        """Generate namelist.wps file"""
        start_date = datetime.datetime.strptime(self.config["start_date"], "%Y-%m-%d_%H:%M:%S")
        end_date = datetime.datetime.strptime(self.config["end_date"], "%Y-%m-%d_%H:%M:%S")

        # Format dates for namelist
        start_date