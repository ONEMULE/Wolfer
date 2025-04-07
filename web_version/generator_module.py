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
        
        # 检查message_queue的类型，确定如何发送消息
        if hasattr(message_queue, 'queue_put'):
            # 如果是WRFRequestHandler对象
            self.queue_put = message_queue.queue_put
        elif hasattr(message_queue, 'put'):
            # 如果是普通Queue对象
            self.queue_put = message_queue.put
        else:
            # 兜底方案，创建一个空函数
            self.queue_put = lambda msg: print(f"消息: {msg}")
        
        # 确保output_dir是绝对路径且存在
        if not self.config.get("output_dir") or self.config["output_dir"].strip() == "":
            self.config["output_dir"] = os.path.join(os.path.expanduser("~"), "wrf_run")
            self.queue_put(f"使用默认输出目录: {self.config['output_dir']}")
        elif not os.path.isabs(self.config["output_dir"]):
            # 转换为绝对路径
            self.config["output_dir"] = os.path.abspath(self.config["output_dir"])
            self.queue_put(f"输出目录已转换为绝对路径: {self.config['output_dir']}")
        
        # 确保输出目录存在
        if not os.path.exists(self.config["output_dir"]):
            try:
                os.makedirs(self.config["output_dir"])
                self.queue_put(f"创建输出目录: {self.config['output_dir']}")
            except Exception as e:
                self.queue_put(f"错误: 无法创建输出目录 {self.config['output_dir']}: {str(e)}")

    def generate_all(self):
        """Generate all required files"""
        try:
            # Create output directory if it doesn't exist
            if not os.path.exists(self.config["output_dir"]):
                os.makedirs(self.config["output_dir"])

            self.queue_put("Generating namelist.wps...")
            self.generate_namelist_wps()
            time.sleep(0.5)  # Small delay for UI responsiveness

            self.queue_put("Generating namelist.input...")
            self.generate_namelist_input()
            time.sleep(0.5)

            self.queue_put("Generating download script...")
            self.generate_download_script()
            time.sleep(0.5)

            self.queue_put("Generating run script...")
            self.generate_run_script()
            time.sleep(0.5)

            self.queue_put("File generation complete!")
        except Exception as e:
            self.queue_put(f"Error: {str(e)}")

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

        # Create start_date and end_date strings for each domain
        if self.config['domain']['max_dom'] > 1:
            start_dates = ", ".join([f"'{start_date_str}'" for _ in range(self.config['domain']['max_dom'])])
            end_dates = ", ".join([f"'{end_date_str}'" for _ in range(self.config['domain']['max_dom'])])
        else:
            start_dates = f"'{start_date_str}'"
            end_dates = f"'{end_date_str}'"

        content += f" start_date = {start_dates},\n"
        content += f" end_date = {end_dates},\n"
        content += f" interval_seconds = {3600 if self.config['data_source'] == 'ERA5' else 10800},\n"
        content += " io_form_geogrid = 102,\n"
        content += "/\n\n"

        content += "&geogrid\n"

        # Format arrays differently depending on whether it's a single or multi-domain setup
        if self.config['domain']['max_dom'] > 1:
            # Create parent_id string
            parent_ids = ", ".join(['1'] + [str(i) for i in range(1, self.config['domain']['max_dom'])])
            content += f" parent_id = {parent_ids},\n"

            # Create parent_grid_ratio string
            grid_ratios = ", ".join([str(r) for r in self.config['domain']['parent_grid_ratio'][:self.config['domain']['max_dom']]])
            content += f" parent_grid_ratio = {grid_ratios},\n"

            # Create i_parent_start string
            i_starts = ", ".join([str(i) for i in self.config['domain']['i_parent_start'][:self.config['domain']['max_dom']]])
            content += f" i_parent_start = {i_starts},\n"

            # Create j_parent_start string
            j_starts = ", ".join([str(j) for j in self.config['domain']['j_parent_start'][:self.config['domain']['max_dom']]])
            content += f" j_parent_start = {j_starts},\n"

            # Calculate e_we and e_sn for each domain
            e_we_values = [str(self.config['domain']['e_we'])]
            e_sn_values = [str(self.config['domain']['e_sn'])]

            for r in self.config['domain']['parent_grid_ratio'][1:self.config['domain']['max_dom']]:
                e_we_values.append(str(int(self.config['domain']['e_we']/3*r)))
                e_sn_values.append(str(int(self.config['domain']['e_sn']/3*r)))

            content += f" e_we = {', '.join(e_we_values)},\n"
            content += f" e_sn = {', '.join(e_sn_values)},\n"

            # Create geog_data_res string
            geog_data_res = ", ".join(['"default"' for _ in range(self.config['domain']['max_dom'])])
            content += f" geog_data_res = {geog_data_res},\n"
        else:
            # For single domain, use simpler format like in the example
            content += f" parent_id = 1,\n"
            content += f" parent_grid_ratio = 1,\n" 
            content += f" i_parent_start = 1,\n" 
            content += f" j_parent_start = 1,\n"
            content += f" e_we = {self.config['domain']['e_we']},\n"
            content += f" e_sn = {self.config['domain']['e_sn']},\n"
            content += f" geog_data_res = 'default',\n"

        content += f" dx = {self.config['domain']['dx'] * 1000},\n"  # Convert km to m
        content += f" dy = {self.config['domain']['dy'] * 1000},\n"  # Convert km to m
        content += f" map_proj = '{self.get_map_proj_name()}',\n"
        content += f" ref_lat = {self.config['domain']['ref_lat']},\n"
        content += f" ref_lon = {self.config['domain']['ref_lon']},\n"
        content += f" truelat1 = {self.config['domain']['truelat1']},\n"
        content += f" truelat2 = {self.config['domain']['truelat2']},\n"
        content += f" stand_lon = {self.config['domain']['stand_lon']},\n"
        content += f" geog_data_path = '{self.config['user_settings'].get('geog_data_path', '/home/onemule/WRF/run/geo_data/geog_high_res_mandatory/WPS_GEOG')}'\n"
        content += "/\n\n"

        content += "&ungrib\n"
        content += " out_format = 'WPS',\n"
        content += " prefix = 'FILE',\n"
        content += "/\n\n"

        content += "&metgrid\n"
        content += " fg_name = 'FILE',\n"
        content += " io_form_metgrid = 102,\n"
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

        # Create date parameter strings for each domain
        max_dom = self.config['domain']['max_dom']

        # Format differs for single vs multi-domain
        if max_dom > 1:
            # Create comma-separated lists for each date parameter
            start_years = ", ".join([str(start_year) for _ in range(max_dom)])
            start_months = ", ".join([str(start_month) for _ in range(max_dom)])
            start_days = ", ".join([str(start_day) for _ in range(max_dom)])
            start_hours = ", ".join([str(start_hour) for _ in range(max_dom)])
            start_minutes = ", ".join([str(start_minute) for _ in range(max_dom)])
            start_seconds = ", ".join([str(start_second) for _ in range(max_dom)])

            end_years = ", ".join([str(end_year) for _ in range(max_dom)])
            end_months = ", ".join([str(end_month) for _ in range(max_dom)])
            end_days = ", ".join([str(end_day) for _ in range(max_dom)])
            end_hours = ", ".join([str(end_hour) for _ in range(max_dom)])
            end_minutes = ", ".join([str(end_minute) for _ in range(max_dom)])
            end_seconds = ", ".join([str(end_second) for _ in range(max_dom)])

            content += f" start_year = {start_years},\n"
            content += f" start_month = {start_months},\n"
            content += f" start_day = {start_days},\n"
            content += f" start_hour = {start_hours},\n"
            content += f" start_minute = {start_minutes},\n"
            content += f" start_second = {start_seconds},\n"
            content += f" end_year = {end_years},\n"
            content += f" end_month = {end_months},\n"
            content += f" end_day = {end_days},\n"
            content += f" end_hour = {end_hours},\n"
            content += f" end_minute = {end_minutes},\n"
            content += f" end_second = {end_seconds},\n"
        else:
            # For single domain use simplified format
            content += f" start_year = {start_year},\n"
            content += f" start_month = {start_month},\n"
            content += f" start_day = {start_day},\n"
            content += f" start_hour = {start_hour},\n"
            content += f" end_year = {end_year},\n"
            content += f" end_month = {end_month},\n"
            content += f" end_day = {end_day},\n"
            content += f" end_hour = {end_hour},\n"

        content += f" interval_seconds = {3600 if self.config['data_source'] == 'ERA5' else 10800}\n"

        # Create arrays for other parameters
        if max_dom > 1:
            input_from_file = ", ".join([".true." for _ in range(max_dom)])
            history_interval = ", ".join(["30" for _ in range(max_dom)])
            frames_per_outfile = ", ".join(["1000" for _ in range(max_dom)])

            content += f" input_from_file = {input_from_file},\n"
            content += f" history_interval = {history_interval},\n"
            content += f" frames_per_outfile = {frames_per_outfile},\n"
        else:
            content += " input_from_file = .true.,\n"
            content += " history_interval = 30,\n"
            content += " frames_per_outfile = 1000,\n"

        content += " restart = .false.,\n"
        content += " restart_interval = 7200,\n"
        content += " io_form_history = 2\n"
        content += " io_form_restart = 2\n"
        content += " io_form_input = 2\n"
        content += " io_form_boundary = 2\n"
        content += "/\n\n"

        content += "&domains\n"
        content += f" time_step = {int(self.config['domain']['dx'] * 6)},\n"  # Estimate time step as 6*dx
        content += " time_step_fract_num = 0,\n"
        content += " time_step_fract_den = 1,\n"
        content += f" max_dom = {max_dom},\n"

        # Calculate e_we and e_sn for each domain
        if max_dom > 1:
            e_we_values = [str(self.config['domain']['e_we'])]
            e_sn_values = [str(self.config['domain']['e_sn'])]

            for r in self.config['domain']['parent_grid_ratio'][1:max_dom]:
                e_we_values.append(str(int(self.config['domain']['e_we']/3*r)))
                e_sn_values.append(str(int(self.config['domain']['e_sn']/3*r)))

            content += f" e_we = {', '.join(e_we_values)},\n"
            content += f" e_sn = {', '.join(e_sn_values)},\n"
        else:
            content += f" e_we = {self.config['domain']['e_we']},\n"
            content += f" e_sn = {self.config['domain']['e_sn']},\n"

        # Create e_vert string
        if max_dom > 1:
            e_vert_values = ", ".join(["45" for _ in range(max_dom)])
            content += f" e_vert = {e_vert_values},\n"
        else:
            content += " e_vert = 45,\n"

        content += " dzstretch_s = 1.1\n"
        content += " p_top_requested = 5000,\n"
        content += f" num_metgrid_levels = {34 if self.config['data_source'] == 'ERA5' else 34},\n"
        content += " num_metgrid_soil_levels = 4,\n"
        content += f" dx = {self.config['domain']['dx'] * 1000},\n"  # Convert km to m
        content += f" dy = {self.config['domain']['dy'] * 1000},\n"  # Convert km to m

        # Create arrays for domain parameters
        if max_dom > 1:
            # Create grid_id string
            grid_ids = ", ".join([str(i+1) for i in range(max_dom)])
            content += f" grid_id = {grid_ids},\n"

            # Create parent_id string
            parent_ids = ", ".join(['1'] + [str(i) for i in range(1, max_dom)])
            content += f" parent_id = {parent_ids},\n"

            # Create i_parent_start string
            i_starts = ", ".join([str(i) for i in self.config['domain']['i_parent_start'][:max_dom]])
            content += f" i_parent_start = {i_starts},\n"

            # Create j_parent_start string
            j_starts = ", ".join([str(j) for j in self.config['domain']['j_parent_start'][:max_dom]])
            content += f" j_parent_start = {j_starts},\n"

            # Create parent_grid_ratio string
            grid_ratios = ", ".join([str(r) for r in self.config['domain']['parent_grid_ratio'][:max_dom]])
            content += f" parent_grid_ratio = {grid_ratios},\n"

            # Create parent_time_step_ratio string
            time_step_ratios = ", ".join([str(r) for r in self.config['domain']['parent_time_step_ratio'][:max_dom]])
            content += f" parent_time_step_ratio = {time_step_ratios},\n"
        else:
            content += " grid_id = 1,\n"
            content += " parent_id = 1,\n"
            content += " i_parent_start = 1,\n"
            content += " j_parent_start = 1,\n"
            content += " parent_grid_ratio = 1,\n"
            content += " parent_time_step_ratio = 1,\n"

        content += " feedback = 1,\n"
        content += " smooth_option = 0\n"
        content += "/\n\n"

        content += "&physics\n"
        content += " physics_suite = 'CONUS'\n"

        # Create physics parameter strings
        if max_dom > 1:
            mp_physics_values = ", ".join([str(self.config['physics']['mp_physics']) for _ in range(max_dom)])
            ra_lw_physics_values = ", ".join([str(self.config['physics']['ra_lw_physics']) for _ in range(max_dom)])
            ra_sw_physics_values = ", ".join([str(self.config['physics']['ra_sw_physics']) for _ in range(max_dom)])
            sf_sfclay_physics_values = ", ".join(["2" for _ in range(max_dom)])
            sf_surface_physics_values = ", ".join([str(self.config['physics']['sf_surface_physics']) for _ in range(max_dom)])
            bl_pbl_physics_values = ", ".join([str(self.config['physics']['bl_pbl_physics']) for _ in range(max_dom)])
            cu_physics_values = ", ".join([str(self.config['physics']['cu_physics']) for _ in range(max_dom)])
            radt_values = ", ".join(["15" for _ in range(max_dom)])
            bldt_values = ", ".join(["0" for _ in range(max_dom)])
            cudt_values = ", ".join(["0" for _ in range(max_dom)])
            sf_urban_physics_values = ", ".join(["0" for _ in range(max_dom)])

            content += f" mp_physics = {mp_physics_values},\n"
            content += f" cu_physics = {cu_physics_values},\n"
            content += f" ra_lw_physics = {ra_lw_physics_values},\n"
            content += f" ra_sw_physics = {ra_sw_physics_values},\n"
            content += f" bl_pbl_physics = {bl_pbl_physics_values},\n"
            content += f" sf_sfclay_physics = {sf_sfclay_physics_values},\n"
            content += f" sf_surface_physics = {sf_surface_physics_values},\n"
            content += f" radt = {radt_values},\n"
            content += f" bldt = {bldt_values},\n"
            content += f" cudt = {cudt_values},\n"
            content += f" sf_urban_physics = {sf_urban_physics_values},\n"
        else:
            content += f" mp_physics = {self.config['physics']['mp_physics']},    8,\n"
            content += f" cu_physics = {self.config['physics']['cu_physics']},    6,\n"
            content += f" ra_lw_physics = {self.config['physics']['ra_lw_physics']},    4,\n"
            content += f" ra_sw_physics = {self.config['physics']['ra_sw_physics']},    4,\n"
            content += f" bl_pbl_physics = {self.config['physics']['bl_pbl_physics']},    2,\n"
            content += " sf_sfclay_physics = 2,    2,\n"
            content += f" sf_surface_physics = {self.config['physics']['sf_surface_physics']},    2,\n"
            content += " radt = 15,    15,\n"
            content += " bldt = 0,     0,\n"
            content += " cudt = 0,     0,\n"
            content += " sf_urban_physics = 0,     0,\n"

        content += " icloud = 1,\n"
        content += " num_land_cat = 21,\n"
        content += " fractional_seaice = 1,\n"
        content += "/\n\n"

        content += "&fdda\n"
        content += "/\n\n"

        content += "&dynamics\n"
        content += " hybrid_opt = 2,\n"
        content += " w_damping = 0,\n"
        
        if max_dom > 1:
            diff_opt_values = ", ".join(["2" for _ in range(max_dom)])
            km_opt_values = ", ".join(["4" for _ in range(max_dom)])
            diff_6th_opt_values = ", ".join(["0" for _ in range(max_dom)])
            diff_6th_factor_values = ", ".join(["0.12" for _ in range(max_dom)])
            zdamp_values = ", ".join(["5000." for _ in range(max_dom)])
            dampcoef_values = ", ".join(["0.2" for _ in range(max_dom)])
            khdif_values = ", ".join(["0" for _ in range(max_dom)])
            kvdif_values = ", ".join(["0" for _ in range(max_dom)])
            non_hydrostatic_values = ", ".join([".true." for _ in range(max_dom)])
            moist_adv_opt_values = ", ".join(["1" for _ in range(max_dom)])
            scalar_adv_opt_values = ", ".join(["1" for _ in range(max_dom)])
            gwd_opt_values = ", ".join(["1"] + ["0" for _ in range(max_dom-1)])
            
            content += f" diff_opt = {diff_opt_values},\n"
            content += f" km_opt = {km_opt_values},\n"
            content += f" diff_6th_opt = {diff_6th_opt_values},\n"
            content += f" diff_6th_factor = {diff_6th_factor_values},\n"
            content += " base_temp = 290.\n"
            content += " damp_opt = 3,\n"
            content += f" zdamp = {zdamp_values},\n"
            content += f" dampcoef = {dampcoef_values},\n"
            content += f" khdif = {khdif_values},\n"
            content += f" kvdif = {kvdif_values},\n"
            content += f" non_hydrostatic = {non_hydrostatic_values},\n"
            content += f" moist_adv_opt = {moist_adv_opt_values},\n"
            content += f" scalar_adv_opt = {scalar_adv_opt_values},\n"
            content += f" gwd_opt = {gwd_opt_values},\n"
        else:
            content += " diff_opt = 2,      2,\n"
            content += " km_opt = 4,      4,\n"
            content += " diff_6th_opt = 0,      0,\n"
            content += " diff_6th_factor = 0.12,   0.12,\n"
            content += " base_temp = 290.\n"
            content += " damp_opt = 3,\n"
            content += " zdamp = 5000.,  5000.,\n"
            content += " dampcoef = 0.2,    0.2,\n"
            content += " khdif = 0,      0,\n"
            content += " kvdif = 0,      0,\n"
            content += " non_hydrostatic = .true., .true.,\n"
            content += " moist_adv_opt = 1,      1,\n"
            content += " scalar_adv_opt = 1,      1,\n"
            content += " gwd_opt = 1,      0,\n"

        content += "/\n\n"

        content += "&bdy_control\n"
        content += " spec_bdy_width = 5,\n"
        content += " specified = .true.\n"
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
        # Determine script extension based on platform
        is_windows = platform.system().lower() == "windows"
        script_ext = ".bat" if is_windows else ".sh"

        start_date = datetime.datetime.strptime(self.config["start_date"], "%Y-%m-%d_%H:%M:%S")
        end_date = datetime.datetime.strptime(self.config["end_date"], "%Y-%m-%d_%H:%M:%S")

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

            content += ":: Link met_em files\n"
            content += "del met_em.* 2>nul\n"
            content += f"for %%f in (\"{wps_path}\\met_em.*\") do (\n"
            content += "    echo Linking %%~nxf\n"
            content += "    copy \"%%f\" \"%%~nxf\"\n"
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
        # 检查projection是在顶层还是在domain字典中
        if "projection" in self.config:
            projection = self.config["projection"]
        elif "projection" in self.config.get("domain", {}):
            projection = self.config["domain"]["projection"]
        else:
            projection = 1  # 默认使用lambert投影
            
        return proj_map.get(projection, "lambert")