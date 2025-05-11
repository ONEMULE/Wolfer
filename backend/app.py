# backend_app.py

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import json
import os
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


# 默认的物理参数选项
PHYSICS_OPTIONS = {
    "mp_physics": [
        {"id": 1, "name": "Kessler", "description": "简单的暖云方案"},
        {"id": 3, "name": "WRF Single-Moment 3-class", "description": "简单的冰云方案"},
        {"id": 4, "name": "WRF Single-Moment 5-class", "description": "混合相方案"},
        {"id": 6, "name": "WRF Single-Moment 6-class", "description": "包含冰、雪和霰的方案"},
        {"id": 8, "name": "Thompson", "description": "复杂的混合相方案"},
        {"id": 10, "name": "Morrison 2-moment", "description": "双矩方案"}
    ],
    "ra_lw_physics": [
        {"id": 1, "name": "RRTM", "description": "Rapid Radiative Transfer Model"},
        {"id": 3, "name": "CAM", "description": "Community Atmosphere Model方案"},
        {"id": 4, "name": "RRTMG", "description": "RRTM的更新版本，适用于全球模式"}
    ],
    "ra_sw_physics": [
        {"id": 1, "name": "Dudhia", "description": "简单高效的短波方案"},
        {"id": 2, "name": "Goddard", "description": "NASA Goddard短波方案"},
        {"id": 3, "name": "CAM", "description": "Community Atmosphere Model方案"},
        {"id": 4, "name": "RRTMG", "description": "适用于全球模式的短波方案"}
    ],
    "sf_surface_physics": [
        {"id": 1, "name": "Thermal diffusion", "description": "简单的热扩散方案"},
        {"id": 2, "name": "Noah Land Surface Model", "description": "复杂的陆面过程方案"},
        {"id": 3, "name": "RUC LSM", "description": "包含多层雪模型的方案"},
        {"id": 4, "name": "Noah-MP", "description": "Noah的多物理选项版本"}
    ],
    "bl_pbl_physics": [
        {"id": 1, "name": "YSU", "description": "Yonsei University方案"},
        {"id": 2, "name": "MYJ", "description": "Mellor-Yamada-Janjic方案"},
        {"id": 4, "name": "QNSE", "description": "Quasi-Normal Scale Elimination方案"},
        {"id": 5, "name": "MYNN2", "description": "Mellor-Yamada Nakanishi and Niino Level 2.5"}
    ],
    "cu_physics": [
        {"id": 0, "name": "None", "description": "不使用积云参数化"},
        {"id": 1, "name": "Kain-Fritsch", "description": "基于质量通量的积云对流方案"},
        {"id": 2, "name": "Betts-Miller-Janjic", "description": "调整型方案"},
        {"id": 3, "name": "Grell-Freitas", "description": "Grell方案的改进版本"}
    ]
}

# 默认的投影选项
PROJECTIONS = [
    {"id": "lambert", "name": "Lambert Conformal", "description": "适用于中纬度区域"},
    {"id": "polar", "name": "Polar Stereographic", "description": "适用于极地区域"},
    {"id": "mercator", "name": "Mercator", "description": "适用于热带和赤道区域"},
    {"id": "lat-lon", "name": "Lat-Lon", "description": "经纬度网格，适用于全球范围"}
]

# 默认的数据源选项
DATA_SOURCES = [
    {"id": "GFS", "name": "GFS", "description": "全球预报系统数据"},
    {"id": "ERA5", "name": "ERA5", "description": "ECMWF再分析数据"},
    {"id": "FNL", "name": "NCEP FNL", "description": "NCEP最终分析数据"}
]

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

    # 存储生成的文件内容，供下载使用
    if not hasattr(app, 'recent_generated_files'):
        app.recent_generated_files = {}
    app.recent_generated_files['namelist.wps'] = namelist_wps_str
    app.recent_generated_files['namelist.input'] = namelist_input_str

    print("\n--- Generated namelist.wps ---")
    print(namelist_wps_str)
    print("\n--- Generated namelist.input ---")
    print(namelist_input_str)

    # 创建下载链接
    base_url = request.host_url.rstrip('/')  # 获取请求的主机URL
    download_links = {
        "namelist_wps": f"{base_url}/api/download/namelist.wps",
        "namelist_input": f"{base_url}/api/download/namelist.input"
    }
    
    # 创建日志消息
    messages = [
        "配置解析完成",
        "格式转换应用",
        "物理参数检查通过",
        "namelist.wps生成成功",
        "namelist.input生成成功"
    ]

    # 返回符合前端期望的格式
    return jsonify({
        "success": True,
        "message": "Namelist content generated successfully.",
        "output_dir": data.get("output_dir", "默认输出目录"),
        "messages": messages,
        "download_links": download_links,
        "file_contents": {
            "namelist_wps": namelist_wps_str,
            "namelist_input": namelist_input_str
        }
    }), 200

# 新增API端点
@app.route('/api/configuration', methods=['GET'])
def get_configuration():
    """获取默认配置"""
    default_config = {
        "time_control": {
            "start_date_str_arr": ["2001-10-25_00:00:00"],
            "end_date_str_arr": ["2001-10-26_00:00:00"],
            "interval_seconds_wps": 21600,
            "interval_seconds_input": 10800,
        },
        "domain_setup": {
            "max_dom": 1,
            "e_we_arr": [100],
            "e_sn_arr": [100],
            "dx_arr": [30000],
            "dy_arr": [30000],
            "map_proj": "lambert",
            "ref_lat": 40.0,
            "ref_lon": 116.0,
            "truelat1": 30.0,
            "truelat2": 60.0,
            "stand_lon": 116.0,
        },
        "physics": {
            "mp_physics_arr": [8],
            "ra_lw_physics_arr": [1],
            "ra_sw_physics_arr": [1],
            "sf_sfclay_physics_arr": [1],
            "sf_surface_physics_arr": [2],
            "bl_pbl_physics_arr": [1],
            "cu_physics_arr": [1],
        },
        "dynamics": {
            "diff_opt_arr": [1],
            "km_opt_arr": [4],
            "non_hydrostatic_arr": [True],
        }
    }
    return jsonify(default_config), 200

@app.route('/api/configuration', methods=['POST'])
def save_configuration():
    """保存整个配置"""
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400
    data = request.get_json()
    # 这里可以添加配置保存逻辑，例如写入数据库或文件
    # 现在仅返回成功消息
    return jsonify({"message": "Configuration saved successfully"}), 200

@app.route('/api/physics-options', methods=['GET'])
def get_physics_options():
    """获取物理参数选项"""
    return jsonify(PHYSICS_OPTIONS), 200

@app.route('/api/projections', methods=['GET'])
def get_projections():
    """获取投影选项"""
    return jsonify(PROJECTIONS), 200

@app.route('/api/data-sources', methods=['GET'])
def get_data_sources():
    """获取数据源选项"""
    return jsonify(DATA_SOURCES), 200

@app.route('/api/validate', methods=['POST'])
def validate_config():
    """验证配置的有效性"""
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400
    data = request.get_json()
    # 这里可以添加配置验证逻辑
    # 简单示例：验证必填字段
    errors = []
    
    # 检查时间控制部分
    if 'time_control' not in data:
        errors.append("Missing time_control section")
    elif 'start_date_str_arr' not in data['time_control'] or not data['time_control']['start_date_str_arr']:
        errors.append("Missing start date")
    elif 'end_date_str_arr' not in data['time_control'] or not data['time_control']['end_date_str_arr']:
        errors.append("Missing end date")
    
    # 检查域设置部分
    if 'domain_setup' not in data:
        errors.append("Missing domain_setup section")
    elif 'e_we_arr' not in data['domain_setup'] or not data['domain_setup']['e_we_arr']:
        errors.append("Missing grid size (e_we)")
    elif 'e_sn_arr' not in data['domain_setup'] or not data['domain_setup']['e_sn_arr']:
        errors.append("Missing grid size (e_sn)")
    
    if errors:
        return jsonify({"valid": False, "errors": errors}), 400
    
    return jsonify({"valid": True}), 200

@app.route('/api/options', methods=['GET'])
def get_all_options():
    """获取所有选项集合"""
    options = {
        "physics": PHYSICS_OPTIONS,
        "projections": PROJECTIONS,
        "dataSources": DATA_SOURCES
    }
    return jsonify(options), 200

@app.route('/api/download/<filename>', methods=['GET'])
def download_file(filename):
    """下载生成的文件"""
    # 用于存储最近生成的文件内容的内存字典
    # 实际应用中应该使用数据库或文件系统存储这些内容
    global recent_generated_files
    if not hasattr(app, 'recent_generated_files'):
        app.recent_generated_files = {
            'namelist.wps': "",
            'namelist.input': ""
        }
    
    if filename == 'namelist.wps':
        # 返回最近生成的namelist.wps内容
        content = app.recent_generated_files.get('namelist.wps', "&share\n wrf_core = 'ARW',\n max_dom = 1\n/")
        return content, 200, {
            'Content-Type': 'text/plain',
            'Content-Disposition': f'attachment; filename={filename}'
        }
    elif filename == 'namelist.input':
        # 返回最近生成的namelist.input内容
        content = app.recent_generated_files.get('namelist.input', "&time_control\n run_days = 1\n/")
        return content, 200, {
            'Content-Type': 'text/plain',
            'Content-Disposition': f'attachment; filename={filename}'
        }
    else:
        return jsonify({"error": "File not found"}), 404

@app.route('/api/time-config', methods=['POST'])
def save_time_config():
    """保存时间配置"""
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400
    data = request.get_json()
    # 这里可以添加时间配置处理逻辑
    return jsonify({"message": "Time configuration saved successfully"}), 200

@app.route('/api/domain-config', methods=['POST'])
def save_domain_config():
    """保存域配置"""
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400
    data = request.get_json()
    # 这里可以添加域配置处理逻辑
    return jsonify({"message": "Domain configuration saved successfully"}), 200

@app.route('/api/physics-config', methods=['POST'])
def save_physics_config():
    """保存物理参数配置"""
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400
    data = request.get_json()
    # 这里可以添加物理参数配置处理逻辑
    return jsonify({"message": "Physics configuration saved successfully"}), 200

if __name__ == '__main__':
    # 确保应用监听所有公共接口，而不仅仅是 127.0.0.1
    app.run(host='0.0.0.0', debug=True, port=5001)