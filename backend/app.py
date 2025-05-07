# backend_app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from datetime import datetime, timedelta  # 用于处理时间

app = Flask(__name__)
CORS(app)


# --- Helper function to format for namelist (especially for arrays for single domain) ---
def get_single_param_val(data_dict, param_key, default_val=None):
    """Safely get the first element if it's an array, or the value itself."""
    val_arr = data_dict.get(param_key)
    if isinstance(val_arr, list):
        return val_arr[0] if val_arr else default_val
    return val_arr if val_arr is not None else default_val


def format_namelist_value(value):
    if isinstance(value, bool):
        return f".{str(value).lower()}."
    if isinstance(value, str) and not value.startswith("'"):  #
        return f"'{value}'"  # Add quotes for strings if not already present
    return value


# --- Namelist Generation Functions (Single Domain Focus) ---
def generate_wps_namelist_content(data):
    """Generates namelist.wps content for a single domain."""
    share = data.get("time_control", {})  # WPS share uses time_control for start/end
    geogrid = data.get("domain_setup", {})
    # Defaults for ungrib and metgrid for simplicity
    ungrib_out_format = 'WPS'
    ungrib_prefix = 'FILE'
    metgrid_fg_name = 'FILE'
    metgrid_io_form = 2

    # &share section
    # WRF WPS namelist typically expects dates as strings directly
    start_date_wps = get_single_param_val(share, "start_date_str_arr", "YYYY-MM-DD_HH:MM:SS")
    end_date_wps = get_single_param_val(share, "end_date_str_arr", "YYYY-MM-DD_HH:MM:SS")

    content = "&share\n"
    content += f" wrf_core = 'ARW',\n"  # Typically ARW
    content += f" max_dom = {geogrid.get('max_dom', 1)},\n"
    content += f" start_date = {format_namelist_value(start_date_wps)},\n"
    content += f" end_date = {format_namelist_value(end_date_wps)},\n"
    content += f" interval_seconds = {share.get('interval_seconds_wps', 21600)},\n"
    content += f" io_form_geogrid = 2,\n"  # Common default
    content += "/\n\n"

    # &geogrid section
    content += "&geogrid\n"
    content += f" parent_id = {get_single_param_val(geogrid, 'parent_id_arr', 1)},\n"  # WPS usually starts parent_id at 1 for the first domain
    content += f" parent_grid_ratio = {get_single_param_val(geogrid, 'parent_grid_ratio_arr', 1)},\n"
    content += f" i_parent_start = {get_single_param_val(geogrid, 'i_parent_start_arr', 1)},\n"
    content += f" j_parent_start = {get_single_param_val(geogrid, 'j_parent_start_arr', 1)},\n"
    content += f" e_we = {get_single_param_val(geogrid, 'e_we_arr', 100)},\n"
    content += f" e_sn = {get_single_param_val(geogrid, 'e_sn_arr', 100)},\n"
    content += f" dx = {get_single_param_val(geogrid, 'dx_arr', 10000.0)},\n"  # Assuming already in meters
    content += f" dy = {get_single_param_val(geogrid, 'dy_arr', 10000.0)},\n"  # Assuming already in meters
    content += f" map_proj = {format_namelist_value(geogrid.get('map_proj', 'lambert'))},\n"
    content += f" ref_lat = {geogrid.get('ref_lat', 0.0)},\n"
    content += f" ref_lon = {geogrid.get('ref_lon', 0.0)},\n"
    content += f" truelat1 = {geogrid.get('truelat1', 0.0)},\n"
    content += f" truelat2 = {geogrid.get('truelat2', 0.0)},\n"
    content += f" stand_lon = {geogrid.get('stand_lon', 0.0)},\n"
    content += f" geog_data_path = {format_namelist_value(geogrid.get('geog_data_path', '/path/to/geog'))},\n"
    # geog_data_res is a bit more complex, often a list. For simplicity, taking the first or default.
    # geog_data_res_val = get_single_param_val(geogrid, 'geog_data_res_arr', 'default')
    # content += f" geog_data_res = {format_namelist_value(geog_data_res_val)},\n"
    content += "/\n\n"

    # &ungrib section
    content += "&ungrib\n"
    content += f" out_format = {format_namelist_value(ungrib_out_format)},\n"
    content += f" prefix = {format_namelist_value(ungrib_prefix)},\n"
    content += "/\n\n"

    # &metgrid section
    content += "&metgrid\n"
    content += f" fg_name = {format_namelist_value(metgrid_fg_name)},\n"
    content += f" io_form_metgrid = {metgrid_io_form},\n"
    content += "/\n"

    return content


def generate_input_namelist_content(data):
    """Generates namelist.input content for a single domain."""
    tc = data.get("time_control", {})
    dom = data.get("domain_setup", {})
    phy = data.get("physics", {})
    dyn = data.get("dynamics", {})
    bdy = data.get("bdy_control", {})
    quilt = data.get("namelist_quilt", {})

    # Time parsing
    start_datetime_str = get_single_param_val(tc, "start_date_str_arr", "2000-01-01_00:00:00")
    end_datetime_str = get_single_param_val(tc, "end_date_str_arr", "2000-01-01_03:00:00")

    try:
        sdt = datetime.strptime(start_datetime_str, "%Y-%m-%d_%H:%M:%S")
        edt = datetime.strptime(end_datetime_str, "%Y-%m-%d_%H:%M:%S")
    except ValueError:  # Fallback if parsing fails
        sdt = datetime(2000, 1, 1, 0, 0, 0)
        edt = datetime(2000, 1, 1, 3, 0, 0)

    run_seconds_total = (edt - sdt).total_seconds()
    run_days = int(run_seconds_total // 86400)
    run_hours = int((run_seconds_total % 86400) // 3600)
    # For namelist.input, often individual start/end components are listed
    start_year = sdt.year
    start_month = sdt.month
    start_day = sdt.day
    start_hour = sdt.hour
    # ... and so on for minute, second, end_year etc.

    content = "&time_control\n"
    content += f" run_days = {run_days},\n"
    content += f" run_hours = {run_hours},\n"
    content += f" run_minutes = 0,\n"  # Assuming minutes/seconds from duration are handled by run_hours
    content += f" run_seconds = 0,\n"
    content += f" start_year = {start_year},\n"
    content += f" start_month = {start_month:02d},\n"  # Pad month/day if needed by namelist format
    content += f" start_day = {start_day:02d},\n"
    content += f" start_hour = {start_hour:02d},\n"
    # ... similarly for end_year, end_month etc.
    content += f" end_year = {edt.year},\n"
    content += f" end_month = {edt.month:02d},\n"
    content += f" end_day = {edt.day:02d},\n"
    content += f" end_hour = {edt.hour:02d},\n"
    content += f" interval_seconds = {tc.get('interval_seconds_input', 10800)},\n"
    content += f" input_from_file = {format_namelist_value(get_single_param_val(tc, 'input_from_file_arr', True))},\n"
    history_interval_val = get_single_param_val(tc, "history_interval_arr", 3)
    history_interval_unit = get_single_param_val(tc, "history_interval_unit_arr", "h")
    if history_interval_unit == 'h':
        content += f" history_interval = {history_interval_val * 60}, ! Converted from hours to minutes\n"  # WRF often takes minutes for history_interval
        # Or use history_interval_h, history_interval_m, history_interval_d directly if available
    else:  # assuming minutes or days
        content += f" history_interval = {history_interval_val}, ! Unit: {history_interval_unit}\n"

    content += f" frames_per_outfile = {get_single_param_val(tc, 'frames_per_outfile_arr', 1)},\n"
    content += f" restart = {format_namelist_value(tc.get('restart_enabled', False))},\n"
    content += f" restart_interval = {tc.get('restart_interval_h', 6) * 60}, ! Converted to minutes\n"  # Often in minutes
    content += f" io_form_history = {tc.get('io_form_history', 2)},\n"
    # ... add other tc parameters ...
    content += f" nocolons = {format_namelist_value(tc.get('nocolons', True))},\n"
    content += "/\n\n"

    content += "&domains\n"
    content += f" time_step = {dom.get('time_step', 60)},\n"
    content += f" max_dom = {dom.get('max_dom', 1)},\n"
    content += f" e_we = {get_single_param_val(dom, 'e_we_arr', 100)},\n"
    content += f" e_sn = {get_single_param_val(dom, 'e_sn_arr', 100)},\n"
    content += f" e_vert = {get_single_param_val(dom, 'e_vert_arr', 35)},\n"
    content += f" dx = {get_single_param_val(dom, 'dx_arr', 10000.0)},\n"
    content += f" dy = {get_single_param_val(dom, 'dy_arr', 10000.0)},\n"
    content += f" grid_id = {get_single_param_val(dom, 'parent_id_arr', 1)}, ! Assuming grid_id matches parent_id for WPS for domain 1\n"  # Actually, grid_id is 1 for d01
    content += f" parent_id = {get_single_param_val(dom, 'parent_id_arr', 0)}, ! For namelist.input, d01 parent_id is 0\n"
    content += f" i_parent_start = {get_single_param_val(dom, 'i_parent_start_arr', 0)},\n"  # For d01, these are 0 or 1 depending on convention
    content += f" j_parent_start = {get_single_param_val(dom, 'j_parent_start_arr', 0)},\n"
    content += f" parent_grid_ratio = {get_single_param_val(dom, 'parent_grid_ratio_arr', 1)},\n"
    content += f" parent_time_step_ratio = {get_single_param_val(dom, 'parent_time_step_ratio_arr', 1)},\n"
    content += f" feedback = {get_single_param_val(dom, 'feedback_arr', 1)},\n"
    # ... add other dom parameters ...
    content += "/\n\n"

    content += "&physics\n"
    content += f" mp_physics = {get_single_param_val(phy, 'mp_physics_arr', 8)},\n"
    content += f" ra_lw_physics = {get_single_param_val(phy, 'ra_lw_physics_arr', 1)},\n"
    content += f" ra_sw_physics = {get_single_param_val(phy, 'ra_sw_physics_arr', 1)},\n"
    content += f" radt = {get_single_param_val(phy, 'radt_arr', 30)},\n"
    content += f" sf_sfclay_physics = {get_single_param_val(phy, 'sf_sfclay_physics_arr', 1)},\n"
    content += f" sf_surface_physics = {get_single_param_val(phy, 'sf_surface_physics_arr', 2)},\n"
    content += f" bl_pbl_physics = {get_single_param_val(phy, 'bl_pbl_physics_arr', 1)},\n"
    content += f" bldt = {get_single_param_val(phy, 'bldt_arr', 0)},\n"
    content += f" cu_physics = {get_single_param_val(phy, 'cu_physics_arr', 1)},\n"
    content += f" cudt = {get_single_param_val(phy, 'cudt_arr', 5)},\n"
    # ... add other phy parameters ...
    content += "/\n\n"

    content += "&dynamics\n"
    content += f" diff_opt = {get_single_param_val(dyn, 'diff_opt_arr', 1)},\n"
    content += f" km_opt = {get_single_param_val(dyn, 'km_opt_arr', 4)},\n"
    content += f" non_hydrostatic = {format_namelist_value(get_single_param_val(dyn, 'non_hydrostatic_arr', True))},\n"
    content += f" w_damping = {get_single_param_val(dyn, 'w_damping_arr', 0)},\n"  # Assuming damp_opt might make this active
    # ... add other dyn parameters ...
    content += "/\n\n"

    content += "&bdy_control\n"
    content += f" spec_bdy_width = {get_single_param_val(bdy, 'spec_bdy_width_arr', 5)},\n"
    content += f" spec_zone = {get_single_param_val(bdy, 'spec_zone_arr', 1)},\n"
    content += f" relax_zone = {get_single_param_val(bdy, 'relax_zone_arr', 4)},\n"
    content += f" specified = {format_namelist_value(get_single_param_val(bdy, 'specified_arr', True))},\n"
    content += f" nested = {format_namelist_value(get_single_param_val(bdy, 'nested_arr', False))},\n"
    content += "/\n\n"

    content += "&namelist_quilt\n"
    content += f" nio_tasks_per_group = {quilt.get('nio_tasks_per_group', 0)},\n"
    content += f" nio_groups = {quilt.get('nio_groups', 1)},\n"
    content += "/\n"

    return content


@app.route('/api/generate-namelist', methods=['POST'])
def generate_namelist_endpoint():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400
    data = request.get_json()
    print("Received data for namelist generation:")
    print(json.dumps(data, indent=2))

    # Generate content (focus on single domain for now)
    namelist_wps_str = generate_wps_namelist_content(data)
    namelist_input_str = generate_input_namelist_content(data)

    print("\n--- Generated namelist.wps ---")
    print(namelist_wps_str)
    print("\n--- Generated namelist.input ---")
    print(namelist_input_str)

    return jsonify({
        "message": "Namelist content generated (single domain).",
        "namelist_wps": namelist_wps_str,
        "namelist_input": namelist_input_str
    }), 200


if __name__ == '__main__':
    app.run(debug=True, port=5001)  # Run on a different port from React dev server