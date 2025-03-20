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
        start_date_str = start_date.strftime("%Y-%m-%d_%H:%M:%S")
        end_date_str = end_date.strftime("%Y-%m-%d_%H:%M:%S")
        
        # Create namelist.wps content
        content = "&share\n"
        content += " wrf_core = 'ARW',\n"
        content += f" max_dom = {self.config['domain']['max_dom']},\n"
        content += f" start_date = {', '.join([f\"'{start_date_str}'\" for _ in range(self.config['domain']['max_dom'])])},\n"
        content += f" end_date = {', '.join([f\"'{end_date_str}'\" for _ in range(self.config['domain']['max_dom'])])},\n"
        content += f" interval_seconds = {3600 if self.config['data_source'] == 'ERA5' else 21600},\n"
        content += " io_form_geogrid = 2,\n"
        content += "/\n\n"
        
        content += "&geogrid\n"
        content += f" parent_id = {', '.join(['1'] + [str(i) for i in range(1, self.config['domain']['max_dom'])])},\n"
        content += f" parent_grid_ratio = {', '.join([str(r) for r in self.config['domain']['parent_grid_ratio'][:self.config['domain']['max_dom']])},\n"
        content += f" i_parent_start = {', '.join([str(i) for i in self.config['domain']['i_parent_start'][:self.config['domain']['max_dom']])},\n"
        content += f" j_parent_start = {', '.join([str(j) for j in self.config['domain']['j_parent_start'][:self.config['domain']['max_dom']])},\n"
        content += f" e_we = {', '.join([str(self.config['domain']['e_we'])] + [str(int(self.config['domain']['e_we']/3*r)) for r in self.config['domain']['parent_grid_ratio'][1:self.config['domain']['max_dom']]])},\n"
        content += f" e_sn = {', '.join([str(self.config['domain']['e_sn'])] + [str(int(self.config['domain']['e_sn']/3*r)) for r in self.config['domain']['parent_grid_ratio'][1:self.config['domain']['max_dom']]])},\n"
        content += f" geog_data_res = {', '.join(['\"default\"' for _ in range(self.config['domain']['max_dom'])])},\n"
        content += f" dx = {self.config['domain']['dx'] * 1000},\n"  # Convert km to m
        content += f" dy = {self.config['domain']['dy'] * 1000},\n"  # Convert km to m
        content += f" map_proj = '{self.get_map_proj_name()}',\n"
        content += f" ref_lat = {self.config['domain']['ref_lat']},\n"
        content += f" ref_lon = {self.config['domain']['ref_lon']},\n"
        content += f" truelat1 = {self.config['domain']['truelat1']},\n"
        content += f" truelat2 = {self.config['domain']['truelat2']},\n"
        content += f" stand_lon = {self.config['domain']['stand_lon']},\n"
        content += f" geog_data_path = '{self.config['user_settings'].get('geog_data_path', '')}',\n"
        content += "/\n\n"
        
        content += "&ungrib\n"
        content += " out_format = 'WPS',\n"
        content += " prefix = 'FILE',\n"
        content += "/\n\n"
        
        content += "&metgrid\n"
        content += " fg_name = 'FILE',\n"
        content += " io_form_metgrid = 2,\n"
        content += "/\n"
        
        # Write to file
        output_file = os.path.join(self.config["output_dir"], "namelist.wps")
        with open(output_file, "w") as f:
            f.write(content)
    
    def generate_namelist_input(self):
        """Generate namelist.input file"""
        start_date = datetime.datetime.strptime(self.config["start_date"], "%Y-%m-%d_%H:%M:%S")
        end_date = datetime.datetime.strptime(self.config["end_date"], "%Y-%m-%d_%H:%M:%S")
        
        # Calculate run duration in hours
        duration_hours = int((end_date - start_date).total_seconds() / 3600)
        
        # Format dates for namelist
        start_year = start_date.year
        start_month = start_date.month
        start_day = start_date.day
        start_hour = start_date.hour
        start_minute = start_date.minute
        start_second = start_date.second
        
        end_year = end_date.year
        end_month = end_date.month
        end_day = end_date.day
        end_hour = end_date.hour
        end_minute = end_date.minute
        end_second = end_date.second
        
        # Create namelist.input content
        content = "&time_control\n"
        content += f" run_days = {duration_hours // 24},\n"
        content += f" run_hours = {duration_hours % 24},\n"
        content += " run_minutes = 0,\n"
        content += " run_seconds = 0,\n"
        content += f" start_year = {', '.join([str(start_year) for _ in range(self.config['domain']['max_dom'])])},\n"
        content += f" start_month = {', '.join([str(start_month) for _ in range(self.config['domain']['max_dom'])])},\n"
        content += f" start_day = {', '.join([str(start_day) for _ in range(self.config['domain']['max_dom'])])},\n"
        content += f" start_hour = {', '.join([str(start_hour) for _ in range(self.config['domain']['max_dom'])])},\n"
        content += f" start_minute = {', '.join([str(start_minute) for _ in range(self.config['domain']['max_dom'])])},\n"
        content += f" start_second = {', '.join([str(start_second) for _ in range(self.config['domain']['max_dom'])])},\n"
        content += f" end_year = {', '.join([str(end_year) for _ in range(self.config['domain']['max_dom'])])},\n"
        content += f" end_month = {', '.join([str(end_month) for _ in range(self.config['domain']['max_dom'])])},\n"
        content += f" end_day = {', '.join([str(end_day) for _ in range(self.config['domain']['max_dom'])])},\n"
        content += f" end_hour = {', '.join([str(end_hour) for _ in range(self.config['domain']['max_dom'])])},\n"
        content += f" end_minute = {', '.join([str(end_minute) for _ in range(self.config['domain']['max_dom'])])},\n"
        content += f" end_second = {', '.join([str(end_second) for _ in range(self.config['domain']['max_dom'])])},\n"
        content += f" interval_seconds = {3600 if self.config['data_source'] == 'ERA5' else 21600},\n"
        content += " input_from_file = .true., .true., .true.,\n"
        content += " history_interval = 60, 60, 60,\n"
        content += " frames_per_outfile = 1, 1, 1,\n"
        content += " restart = .false.,\n"
        content += " restart_interval = 7200,\n"
        content += " io_form_history = 2,\n"  # 修复：添加逗号
        content += " io_form_restart = 2,\n"  # 修复：添加逗号
        content += " io_form_input = 2,\n"    # 修复：添加逗号
        content += " io_form_boundary = 2,\n" # 修复：添加逗号
        content += " debug_level = 0\n"
        content += "/\n\n"
        
        content += "&domains\n"
        content += f" time_step = {int(self.config['domain']['dx'] * 6)},\n"  # Estimate time step as 6*dx
        content += f" time_step_fract_num = 0,\n"
        content += f" time_step_fract_den = 1,\n"
        content += f" max_dom = {self.config['domain']['max_dom']},\n"
        content += f" e_we = {', '.join([str(self.config['domain']['e_we'])] + [str(int(self.config['domain']['e_we']/3*r)) for r in self.config['domain']['parent_grid_ratio'][1:self.config['domain']['max_dom']]])},\n"
        content += f" e_sn = {', '.join([str(self.config['domain']['e_sn'])] + [str(int(self.config['domain']['e_sn']/3*r)) for r in self.config['domain']['parent_grid_ratio'][1:self.config['domain']['max_dom']]])},\n"

        # 修复：确保 e_vert 数组长度与 max_dom 一致
        e_vert_values = ["33"] * self.config['domain']['max_dom']
        content += f" e_vert = {', '.join(e_vert_values)},\n"

        content += f" p_top_requested = 5000,\n"
        content += f" num_metgrid_levels = {27 if self.config['data_source'] == 'ERA5' else 32},\n"
        content += f" num_metgrid_soil_levels = 4,\n"
        content += f" dx = {self.config['domain']['dx'] * 1000},\n"  # Convert km to m
        content += f" dy = {self.config['domain']['dy'] * 1000},\n"  # Convert km to m
        content += f" grid_id = {', '.join([str(i+1) for i in range(self.config['domain']['max_dom'])])},\n"
        content += f" parent_id = {', '.join(['1'] + [str(i) for i in range(1, self.config['domain']['max_dom'])])},\n"
        content += f" i_parent_start = {', '.join([str(i) for i in self.config['domain']['i_parent_start'][:self.config['domain']['max_dom']])},\n"
        content += f" j_parent_start = {', '.join([str(j) for j in self.config['domain']['j_parent_start'][:self.config['domain']['max_dom']])},\n"
        content += f" parent_grid_ratio = {', '.join([str(r) for r in self.config['domain']['parent_grid_ratio'][:self.config['domain']['max_dom']])},\n"
        content += f" parent_time_step_ratio = {', '.join([str(r) for r in self.config['domain']['parent_time_step_ratio'][:self.config['domain']['max_dom']])},\n"
        content += f" feedback = 1,\n"
        content += f" smooth_option = 0\n"
        content += "/\n\n"

        content += "&physics\n"
        # 修复：确保所有物理参数化选项数组长度与 max_dom 一致
        mp_physics_values = [str(self.config['physics']['mp_physics'])] * self.config['domain']['max_dom']
        ra_lw_physics_values = [str(self.config['physics']['ra_lw_physics'])] * self.config['domain']['max_dom']
        ra_sw_physics_values = [str(self.config['physics']['ra_sw_physics'])] * self.config['domain']['max_dom']
        sf_sfclay_physics_values = ["1"] * self.config['domain']['max_dom']
        sf_surface_physics_values = [str(self.config['physics']['sf_surface_physics'])] * self.config['domain']['max_dom']
        bl_pbl_physics_values = [str(self.config['physics']['bl_pbl_physics'])] * self.config['domain']['max_dom']
        cu_physics_values = [str(self.config['physics']['cu_physics'])] * self.config['domain']['max_dom']

        content += f" mp_physics = {', '.join(mp_physics_values)},\n"
        content += f" ra_lw_physics = {', '.join(ra_lw_physics_values)},\n"
        content += f" ra_sw_physics = {', '.join(ra_sw_physics_values)},\n"
        content += f" sf_sfclay_physics = {', '.join(sf_sfclay_physics_values)},\n"
        content += f" sf_surface_physics = {', '.join(sf_surface_physics_values)},\n"
        content += f" bl_pbl_physics = {', '.join(bl_pbl_physics_values)},\n"
        content += f" cu_physics = {', '.join(cu_physics_values)},\n"
        content += " cudt = 5,\n"
        content += " isfflx = 1,\n"
        content += " ifsnow = 1,\n"
        content += " icloud = 1,\n"
        content += " surface_input_source = 1,\n"
        content += " num_soil_layers = 4,\n"
        content += " num_land_cat = 21,\n"
        content += "/\n\n"

        content += "&fdda\n"
        content += "/\n\n"

        content += "&dynamics\n"
        content += " w_damping = 0,\n"
        content += " diff_opt = 1,\n"
        content += " km_opt = 4,\n"

        # 修复：确保 diff_6th_opt 和 diff_6th_factor 数组长度与 max_dom 一致
        diff_6th_opt_values = ["0"] * self.config['domain']['max_dom']
        diff_6th_factor_values = ["0.12"] * self.config['domain']['max_dom']
        content += f" diff_6th_opt = {', '.join(diff_6th_opt_values)},\n"
        content += f" diff_6th_factor = {', '.join(diff_6th_factor_values)},\n"

        content += " base_temp = 290.,\n"  # 修复：添加逗号
        content += " damp_opt = 0,\n"

        # 修复：确保 zdamp, dampcoef, khdif, kvdif 数组长度与 max_dom 一致
        zdamp_values = ["5000."] * self.config['domain']['max_dom']
        dampcoef_values = ["0.2"] * self.config['domain']['max_dom']
        khdif_values = ["0"] * self.config['domain']['max_dom']
        kvdif_values = ["0"] * self.config['domain']['max_dom']
        non_hydrostatic_values = [".true."] * self.config['domain']['max_dom']
        moist_adv_opt_values = ["1"] * self.config['domain']['max_dom']
        scalar_adv_opt_values = ["1"] * self.config['domain']['max_dom']

        content += f" zdamp = {', '.join(zdamp_values)},\n"
        content += f" dampcoef = {', '.join(dampcoef_values)},\n"
        content += f" khdif = {', '.join(khdif_values)},\n"
        content += f" kvdif = {', '.join(kvdif_values)},\n"
        content += f" non_hydrostatic = {', '.join(non_hydrostatic_values)},\n"
        content += f" moist_adv_opt = {', '.join(moist_adv_opt_values)},\n"
        content += f" scalar_adv_opt = {', '.join(scalar_adv_opt_values)},\n"
        content += "/\n\n"

        content += "&bdy_control\n"
        content += " spec_bdy_width = 5,\n"
        content += " spec_zone = 1,\n"
        content += " relax_zone = 4,\n"

        # 修复：确保 specified 和 nested 数组长度与 max_dom 一致
        specified_values = [".true."] + [".false."] * (self.config['domain']['max_dom'] - 1)
        nested_values = [".false."] + [".true."] * (self.config['domain']['max_dom'] - 1)
        content += f" specified = {', '.join(specified_values)},\n"
        content += f" nested = {', '.join(nested_values)},\n"
        content += "/\n\n"

        content += "&grib2\n"
        content += "/\n\n"

        content += "&namelist_quilt\n"
        content += " nio_tasks_per_group = 0,\n"
        content += " nio_groups = 1,\n"
        content += "/\n"

        # Write to file
        output_file = os.path.join(self.config["output_dir"], "namelist.input")
        with open(output_file, "w") as f:
            f.write(content)
        
    def generate_download_script(self):
        """Generate script to download meteorological data"""
        start_date = datetime.datetime.strptime(self.config["start_date"], "%Y-%m-%d_%H:%M:%S")
        end_date = datetime.datetime.strptime(self.config["end_date"], "%Y-%m-%d_%H:%M:%S")

        # Determine script extension based on platform
        is_windows = platform.system().lower() == "windows"
        script_ext = ".bat" if is_windows else ".sh"

        data_source = self.config["data_source"]
        output_file = os.path.join(self.config["output_dir"], f"download_data{script_ext}")

        # Create script content based on data source
        if data_source == "GFS":
            if is_windows:
                content = "@echo off\n\n"
                content += ":: Script to download GFS data for WRF\n"
                content += ":: Created by WRF Setup GUI\n\n"

                content += f"set OUTDIR={os.path.join(self.config['output_dir'], 'gfs_data')}\n"
                content += "if not exist %OUTDIR% mkdir %OUTDIR%\n\n"

                content += ":: Download GFS data\n"

                current_date = start_date
                while current_date <= end_date:
                    date_str = current_date.strftime("%Y%m%d")

                    for hour in range(0, 24, 6):  # GFS data available at 00, 06, 12, 18 UTC
                        if current_date.replace(hour=hour) >= start_date and current_date.replace(hour=hour) <= end_date:
                            hour_str = f"{hour:02d}"
                            content += f"echo Downloading GFS data for {date_str} {hour_str}Z\n"
                            content += f"curl -o \"%OUTDIR%\\gfs.t{hour_str}z.pgrb2.0p25.f000\" \"https://nomads.ncep.noaa.gov/pub/data/nccf/com/gfs/prod/gfs.{date_str}/{hour_str}/atmos/gfs.t{hour_str}z.pgrb2.0p25.f000\"\n"

                    current_date += datetime.timedelta(days=1)
            else:
                content = "#!/bin/bash\n\n"
                content += "# Script to download GFS data for WRF\n"
                content += "# Created by WRF Setup GUI\n\n"

                content += f"OUTDIR=\"{os.path.join(self.config['output_dir'], 'gfs_data')}\"\n"
                content += "mkdir -p $OUTDIR\n\n"

                content += "# Download GFS data\n"

                current_date = start_date
                while current_date <= end_date:
                    date_str = current_date.strftime("%Y%m%d")

                    for hour in range(0, 24, 6):  # GFS data available at 00, 06, 12, 18 UTC
                        if current_date.replace(hour=hour) >= start_date and current_date.replace(hour=hour) <= end_date:
                            hour_str = f"{hour:02d}"
                            content += f"echo \"Downloading GFS data for {date_str} {hour_str}Z\"\n"
                            content += f"wget -c -P $OUTDIR \"https://nomads.ncep.noaa.gov/pub/data/nccf/com/gfs/prod/gfs.{date_str}/{hour_str}/atmos/gfs.t{hour_str}z.pgrb2.0p25.f000\"\n"

                    current_date += datetime.timedelta(days=1)

        elif data_source == "ERA5":
            # For ERA5, create a Python script using CDS API
            output_file = os.path.join(self.config["output_dir"], "download_era5.py")

            content = "#!/usr/bin/env python3\n\n"
            content += "# Script to download ERA5 data for WRF\n"
            content += "# Created by WRF Setup GUI\n\n"

            content += "import cdsapi\n"
            content += "import os\n"
            content += "import sys\n"
            content += "from datetime import datetime, timedelta\n\n"

            content += f"# Output directory\n"
            content += f"outdir = '{os.path.join(self.config['output_dir'], 'era5_data')}'\n"
            content += "os.makedirs(outdir, exist_ok=True)\n\n"

            content += "# Initialize CDS client\n"
            content += "c = cdsapi.Client()\n\n"

            content += "# Date range\n"
            content += f"start_date = datetime.strptime('{self.config['start_date']}', '%Y-%m-%d_%H:%M:%S')\n"
            content += f"end_date = datetime.strptime('{self.config['end_date']}', '%Y-%m-%d_%H:%M:%S')\n\n"

            content += "# Download ERA5 data day by day\n"
            content += "current_date = start_date\n"
            content += "while current_date <= end_date:\n"
            content += "    date_str = current_date.strftime('%Y-%m-%d')\n"
            content += "    year_str = current_date.strftime('%Y')\n"
            content += "    month_str = current_date.strftime('%m')\n"
            content += "    day_str = current_date.strftime('%d')\n\n"

            content += "    print(f'Downloading ERA5 data for {date_str}')\n\n"

            content += "    # Pressure level data\n"
            content += "    c.retrieve(\n"
            content += "        'reanalysis-era5-pressure-levels',\n"
            content += "        {\n"
            content += "            'product_type': 'reanalysis',\n"
            content += "            'format': 'grib',\n"
            content += "            'variable': [\n"
            content += "                'geopotential', 'relative_humidity', 'specific_humidity',\n"
            content += "                'temperature', 'u_component_of_wind', 'v_component_of_wind',\n"
            content += "            ],\n"
            content += "            'pressure_level': [\n"
            content += "                '1', '2', '3', '5', '7', '10', '20', '30', '50',\n"
            content += "                '70', '100', '125', '150', '175', '200', '225',\n"
            content += "                '250', '300', '350', '400', '450', '500', '550',\n"
            content += "                '600', '650', '700', '750', '775', '800', '825',\n"
            content += "                '850', '875', '900', '925', '950', '975', '1000',\n"
            content += "            ],\n"
            content += "            'year': year_str,\n"
            content += "            'month': month_str,\n"
            content += "            'day': day_str,\n"
            content += "            'time': [\n"
            content += "                '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',\n"
            content += "                '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',\n"
            content += "                '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',\n"
            content += "                '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',\n"
            content += "            ],\n"
            content += "            'area': [90, -180, -90, 180],  # North, West, South, East\n"
            content += "        },\n"
            content += "        os.path.join(outdir, f'era5_pl_{date_str}.grib')\n"
            content += "    )\n\n"

            content += "    # Surface data\n"
            content += "    c.retrieve(\n"
            content += "        'reanalysis-era5-single-levels',\n"
            content += "        {\n"
            content += "            'product_type': 'reanalysis',\n"
            content += "            'format': 'grib',\n"
            content += "            'variable': [\n"
            content += "                '10m_u_component_of_wind', '10m_v_component_of_wind', '2m_dewpoint_temperature',\n"
            content += "                '2m_temperature', 'land_sea_mask', 'mean_sea_level_pressure',\n"
            content += "                'sea_ice_cover', 'sea_surface_temperature', 'skin_temperature',\n"
            content += "                'snow_depth', 'soil_temperature_level_1', 'soil_temperature_level_2',\n"
            content += "                'soil_temperature_level_3', 'soil_temperature_level_4', 'surface_pressure',\n"
            content += "                'volumetric_soil_water_layer_1', 'volumetric_soil_water_layer_2',\n"
            content += "                'volumetric_soil_water_layer_3', 'volumetric_soil_water_layer_4',\n"
            content += "            ],\n"
            content += "            'year': year_str,\n"
            content += "            'month': month_str,\n"
            content += "            'day': day_str,\n"
            content += "            'time': [\n"
            content += "                '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',\n"
            content += "                '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',\n"
            content += "                '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',\n"
            content += "                '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',\n"
            content += "            ],\n"
            content += "            'area': [90, -180, -90, 180],  # North, West, South, East\n"
            content += "        },\n"
            content += "        os.path.join(outdir, f'era5_sfc_{date_str}.grib')\n"
            content += "    )\n\n"

            content += "    # Move to next day\n"
            content += "    current_date += timedelta(days=1)\n\n"

            content += "print('ERA5 download complete!')\n"

            # Also create a shell/batch script to run the Python script
            if is_windows:
                wrapper_content = "@echo off\n\n"
                wrapper_content += ":: Script to download ERA5 data for WRF\n"
                wrapper_content += ":: Created by WRF Setup GUI\n\n"
                wrapper_content += "python download_era5.py\n"
                wrapper_content += "pause\n"
            else:
                wrapper_content = "#!/bin/bash\n\n"
                wrapper_content += "# Script to download ERA5 data for WRF\n"
                wrapper_content += "# Created by WRF Setup GUI\n\n"
                wrapper_content += "python3 download_era5.py\n"

            with open(os.path.join(self.config["output_dir"], f"download_data{script_ext}"), "w") as f:
                f.write(wrapper_content)

        elif data_source == "FNL":
            if is_windows:
                content = "@echo off\n\n"
                content += ":: Script to download FNL data for WRF\n"
                content += ":: Created by WRF Setup GUI\n\n"

                content += f"set OUTDIR={os.path.join(self.config['output_dir'], 'fnl_data')}\n"
                content += "if not exist %OUTDIR% mkdir %OUTDIR%\n\n"

                content += ":: FNL data requires registration at UCAR RDA\n"
                content += ":: Please download manually from https://rda.ucar.edu/datasets/ds083.2/\n"
                content += "echo Please download FNL data manually from https://rda.ucar.edu/datasets/ds083.2/\n"
                content += "echo After registration, you can use the following date range:\n"
                content += f"echo Start date: {start_date.strftime('%Y-%m-%d %H:%M')}\n"
                content += f"echo End date: {end_date.strftime('%Y-%m-%d %H:%M')}\n"
                content += "pause\n"
            else:
                content = "#!/bin/bash\n\n"
                content += "# Script to download FNL data for WRF\n"
                content += "# Created by WRF Setup GUI\n\n"

                content += f"OUTDIR=\"{os.path.join(self.config['output_dir'], 'fnl_data')}\"\n"
                content += "mkdir -p $OUTDIR\n\n"

                content += "# FNL data requires registration at UCAR RDA\n"
                content += "# Please download manually from https://rda.ucar.edu/datasets/ds083.2/\n"
                content += "echo \"Please download FNL data manually from https://rda.ucar.edu/datasets/ds083.2/\"\n"
                content += "echo \"After registration, you can use the following date range:\"\n"
                content += f"echo \"Start date: {start_date.strftime('%Y-%m-%d %H:%M')}\"\n"
                content += f"echo \"End date: {end_date.strftime('%Y-%m-%d %H:%M')}\"\n"

        elif data_source == "NARR":
            if is_windows:
                content = "@echo off\n\n"
                content += ":: Script to download NARR data for WRF\n"
                content += ":: Created by WRF Setup GUI\n\n"

                content += f"set OUTDIR={os.path.join(self.config['output_dir'], 'narr_data')}\n"
                content += "if not exist %OUTDIR% mkdir %OUTDIR%\n\n"

                content += ":: Download NARR data\n"
                content += "echo NARR data download is not automated in this script.\n"
                content += "echo Please download from https://www.ncei.noaa.gov/thredds/catalog/model-narr-a-files/catalog.html\n"
                content += f"echo Start date: {start_date.strftime('%Y-%m-%d %H:%M')}\n"
                content += f"echo End date: {end_date.strftime('%Y-%m-%d %H:%M')}\n"
                content += "pause\n"
            else:
                content = "#!/bin/bash\n\n"
                content += "# Script to download NARR data for WRF\n"
                content += "# Created by WRF Setup GUI\n\n"

                content += f"OUTDIR=\"{os.path.join(self.config['output_dir'], 'narr_data')}\"\n"
                content += "mkdir -p $OUTDIR\n\n"

                content += "# Download NARR data\n"
                content += "echo \"NARR data download is not automated in this script.\"\n"
                content += "echo \"Please download from https://www.ncei.noaa.gov/thredds/catalog/model-narr-a-files/catalog.html\"\n"
                content += f"echo \"Start date: {start_date.strftime('%Y-%m-%d %H:%M')}\"\n"
                content += f"echo \"End date: {end_date.strftime('%Y-%m-%d %H:%M')}\"\n"

        # Write to file
        with open(output_file, "w") as f:
            f.write(content)

        # Make script executable on Unix-like systems
        if not is_windows:
            os.chmod(output_file, 0o755)
    
    def generate_run_script(self):
        """Generate script to run WRF preprocessing and simulation"""
        # Determine script extension based on platform
        is_windows = platform.system().lower() == "windows"
        script_ext = ".bat" if is_windows else ".sh"

        output_file = os.path.join(self.config["output_dir"], f"run_wrf{script_ext}")

        # Get WPS and WRF paths
        wps_path = self.config["user_settings"].get("wps_path", "")
        wrf_path = self.config["user_settings"].get("wrf_path", "")

        if is_windows:
            content = "@echo off\n\n"
            content += ":: Script to run WRF preprocessing and simulation\n"
            content += ":: Created by WRF Setup GUI\n\n"

            content += ":: Copy namelist files\n"
            content += f"copy /Y namelist.wps \"{wps_path}\\namelist.wps\"\n"
            content += f"copy /Y namelist.input \"{wrf_path}\\run\\namelist.input\"\n\n"

            content += ":: Change to WPS directory\n"
            content += f"cd /D \"{wps_path}\"\n\n"

            content += ":: Run WPS programs\n"
            content += "echo Running geogrid.exe...\n"
            content += "geogrid.exe\n"
            content += "if %ERRORLEVEL% neq 0 (\n"
            content += "    echo Error running geogrid.exe\n"
            content += "    pause\n"
            content += "    exit /b 1\n"
            content += ")\n\n"

            content += "echo Running ungrib.exe...\n"
            content += ":: Link to the appropriate Vtable based on data source\n"
            if self.config["data_source"] == "GFS":
                content += "link_grib.exe gfs_data\\*.grib\n"
                content += "copy /Y ungrib\\Variable_Tables\\Vtable.GFS Vtable\n"
            elif self.config["data_source"] == "ERA5":
                content += "link_grib.exe era5_data\\*.grib\n"
                content += "copy /Y ungrib\\Variable_Tables\\Vtable.ERA-interim.pl Vtable\n"
            elif self.config["data_source"] == "FNL":
                content += "link_grib.exe fnl_data\\*.grib\n"
                content += "copy /Y ungrib\\Variable_Tables\\Vtable.GFS Vtable\n"
            elif self.config["data_source"] == "NARR":
                content += "link_grib.exe narr_data\\*.grib\n"
                content += "copy /Y ungrib\\Variable_Tables\\Vtable.NARR Vtable\n"

            content += "ungrib.exe\n"
            content += "if %ERRORLEVEL% neq 0 (\n"
            content += "    echo Error running ungrib.exe\n"
            content += "    pause\n"
            content += "    exit /b 1\n"
            content += ")\n\n"

            content += "echo Running metgrid.exe...\n"
            content += "metgrid.exe\n"
            content += "if %ERRORLEVEL% neq 0 (\n"
            content += "    echo Error running metgrid.exe\n"
            content += "    pause\n"
            content += "    exit /b 1\n"
            content += ")\n\n"

            content += ":: Change to WRF run directory\n"
            content += f"cd /D \"{wrf_path}\\run\"\n\n"

            # 修复 Windows 批处理脚本中的文件链接问题
            content += ":: Link met_em files\n"
            content += "del met_em.* 2>nul\n"
            content += f"for %%f in (\"{wps_path}\\met_em.*\") do (\n"
            content += "    echo Linking %%~nxf\n"
            content += "    mklink /H \"%%~nxf\" \"%%f\"\n"
            content += ")\n\n"

            content += ":: Run real.exe\n"
            content += "echo Running real.exe...\n"
            content += "real.exe\n"
            content += "if %ERRORLEVEL% neq 0 (\n"
            content += "    echo Error running real.exe\n"
            content += "    pause\n"
            content += "    exit /b 1\n"
            content += ")\n\n"

            content += ":: Run wrf.exe\n"
            content += "echo Running wrf.exe...\n"
            content += "wrf.exe\n"
            content += "if %ERRORLEVEL% neq 0 (\n"
            content += "    echo Error running wrf.exe\n"
            content += "    pause\n"
            content += "    exit /b 1\n"
            content += ")\n\n"

            content += "echo WRF run completed successfully!\n"
            content += "pause\n"
        else:
            content = "#!/bin/bash\n\n"
            content += "# Script to run WRF preprocessing and simulation\n"
            content += "# Created by WRF Setup GUI\n\n"

            content += "# Copy namelist files\n"
            content += f"cp -f namelist.wps \"{wps_path}/namelist.wps\"\n"
            content += f"cp -f namelist.input \"{wrf_path}/run/namelist.input\"\n\n"

            content += "# Change to WPS directory\n"
            content += f"cd \"{wps_path}\"\n\n"

            content += "# Run WPS programs\n"
            content += "echo \"Running geogrid.exe...\"\n"
            content += "./geogrid.exe\n"
            content += "if [ $? -ne 0 ]; then\n"
            content += "    echo \"Error running geogrid.exe\"\n"
            content += "    exit 1\n"
            content += "fi\n\n"

            content += "echo \"Running ungrib.exe...\"\n"
            content += "# Link to the appropriate Vtable based on data source\n"
            if self.config["data_source"] == "GFS":
                content += "./link_grib.csh gfs_data/*.grib\n"
                content += "cp -f ungrib/Variable_Tables/Vtable.GFS Vtable\n"
            elif self.config["data_source"] == "ERA5":
                content += "./link_grib.csh era5_data/*.grib\n"
                content += "cp -f ungrib/Variable_Tables/Vtable.ERA-interim.pl Vtable\n"
            elif self.config["data_source"] == "FNL":
                content += "./link_grib.csh fnl_data/*.grib\n"
                content += "cp -f ungrib/Variable_Tables/Vtable.GFS Vtable\n"
            elif self.config["data_source"] == "NARR":
                content += "./link_grib.csh narr_data/*.grib\n"
                content += "cp -f ungrib/Variable_Tables/Vtable.NARR Vtable\n"

            content += "./ungrib.exe\n"
            content += "if [ $? -ne 0 ]; then\n"
            content += "    echo \"Error running ungrib.exe\"\n"
            content += "    exit 1\n"
            content += "fi\n\n"

            content += "echo \"Running metgrid.exe...\"\n"
            content += "./metgrid.exe\n"
            content += "if [ $? -ne 0 ]; then\n"
            content += "    echo \"Error running metgrid.exe\"\n"
            content += "    exit 1\n"
            content += "fi\n\n"

            content += "# Change to WRF run directory\n"
            content += f"cd \"{wrf_path}/run\"\n\n"

            content += "# Link met_em files\n"
            content += "rm -f met_em.*\n"
            content += f"ln -sf {wps_path}/met_em.* .\n\n"

            content += "# Run real.exe\n"
            content += "echo \"Running real.exe...\"\n"
            content += "./real.exe\n"
            content += "if [ $? -ne 0 ]; then\n"
            content += "    echo \"Error running real.exe\"\n"
            content += "    exit 1\n"
            content += "fi\n\n"

            content += "# Run wrf.exe\n"
            content += "echo \"Running wrf.exe...\"\n"
            content += "./wrf.exe\n"
            content += "if [ $? -ne 0 ]; then\n"
            content += "    echo \"Error running wrf.exe\"\n"
            content += "    exit 1\n"
            content += "fi\n\n"

            content += "echo \"WRF run completed successfully!\"\n"

        # Write to file
        with open(output_file, "w") as f:
            f.write(content)

        # Make script executable on Unix-like systems
        if not is_windows:
            os.chmod(output_file, 0o755)

    def get_map_proj_name(self):
        """Get the map projection name for namelist.wps"""
        proj_map = {
            1: "lambert",
            2: "polar",
            3: "mercator",
            6: "lat-lon"
        }
        return proj_map.get(self.config["projection"], "lambert")