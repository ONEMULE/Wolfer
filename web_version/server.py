"""
简化版的WRF Namelist生成器Web服务器
使用Python标准库http.server实现，不依赖外部包
"""

import http.server
import socketserver
import os
import json
import urllib.parse
import datetime
import queue
import threading
import sys
import socket
import html
import platform
import re

# 添加父目录到路径以便导入WRF模块
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    from generator_module import WRFGenerator
    HAS_GENERATOR = True
except ImportError:
    HAS_GENERATOR = False
    print("警告: 无法导入generator_module，部分功能可能不可用")

# 定义默认配置
DEFAULT_CONFIG = {
    "start_date": datetime.datetime.now().strftime("%Y-%m-%d_%H:%M:%S"),
    "end_date": (datetime.datetime.now() + datetime.timedelta(days=3)).strftime("%Y-%m-%d_%H:%M:%S"),
    "domain": {
        "e_we": 100,
        "e_sn": 100,
        "dx": 30.0,
        "dy": 30.0,
        "ref_lat": 40.0,
        "ref_lon": 116.0,
        "truelat1": 30.0,
        "truelat2": 60.0,
        "stand_lon": 116.0,
        "max_dom": 1,
        "parent_grid_ratio": [1, 3, 3],
        "i_parent_start": [1, 31, 31],
        "j_parent_start": [1, 17, 33],
        "parent_time_step_ratio": [1, 3, 3]
    },
    "projection": 1,
    "physics": {
        "mp_physics": 6,
        "ra_lw_physics": 1,
        "ra_sw_physics": 1,
        "sf_surface_physics": 2,
        "bl_pbl_physics": 1,
        "cu_physics": 1
    },
    "dynamics": {
        "diff_opt": 2,
        "km_opt": 4,
        "non_hydrostatic": True
    },
    "data_source": "GFS",
    "output_dir": os.path.join(os.path.expanduser("~"), "wrf_run"),
    "user_settings": {
        "geog_data_path": "",
        "cds_api_key": "",
        "cds_api_url": "https://cds.climate.copernicus.eu/api/v2",
        "wps_path": "",
        "wrf_path": ""
    }
}

# 可用选项
PHYSICS_OPTIONS = {
    "mp_physics": {
        "1": "Kessler scheme",
        "2": "Lin et al. scheme",
        "3": "WSM3 scheme",
        "4": "WSM5 scheme",
        "6": "WSM6 scheme",
        "8": "Thompson scheme",
        "10": "Morrison 2-moment scheme"
    },
    "ra_lw_physics": {
        "1": "RRTM scheme",
        "3": "CAM scheme",
        "4": "RRTMG scheme"
    },
    "ra_sw_physics": {
        "1": "Dudhia scheme",
        "2": "Goddard shortwave",
        "3": "CAM scheme",
        "4": "RRTMG scheme"
    },
    "sf_surface_physics": {
        "1": "Thermal diffusion scheme",
        "2": "Noah Land Surface Model",
        "3": "RUC Land Surface Model",
        "4": "Noah-MP Land Surface Model"
    },
    "bl_pbl_physics": {
        "1": "YSU scheme",
        "2": "Mellor-Yamada-Janjic scheme",
        "4": "QNSE scheme",
        "5": "MYNN2 scheme",
        "6": "MYNN3 scheme"
    },
    "cu_physics": {
        "0": "No cumulus",
        "1": "Kain-Fritsch scheme",
        "2": "Betts-Miller-Janjic scheme",
        "3": "Grell-Freitas scheme",
        "5": "Grell-3D scheme"
    }
}

DYNAMICS_OPTIONS = {
    "diff_opt": {
        "0": "No turbulence or mixing",
        "1": "Evaluate second-order diffusion term on coordinate surfaces",
        "2": "Evaluate second-order diffusion term on model levels"
    },
    "km_opt": {
        "1": "Constant coefficient",
        "2": "1.5-order TKE closure",
        "3": "Smagorinsky first-order closure",
        "4": "Horizontal Smagorinsky first-order closure"
    }
}

PROJECTIONS = {
    "1": "Lambert Conformal",
    "2": "Polar Stereographic",
    "3": "Mercator",
    "6": "Lat-Lon (including global)"
}

DATA_SOURCES = {
    "GFS": "NCEP Global Forecast System",
    "ERA5": "ECMWF ERA5 Reanalysis",
    "FNL": "NCEP Final Analysis",
    "NARR": "North American Regional Reanalysis"
}

# 读取HTML模板
def get_html_template():
    template_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "templates", "index.html")
    try:
        with open(template_path, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        # 返回简化版HTML
        return """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>WRF Namelist Generator</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                h1 { text-align: center; }
                .container { max-width: 800px; margin: 0 auto; }
                .alert { padding: 15px; margin-bottom: 20px; border: 1px solid transparent; border-radius: 4px; }
                .alert-info { color: #31708f; background-color: #d9edf7; border-color: #bce8f1; }
                .alert-danger { color: #a94442; background-color: #f2dede; border-color: #ebccd1; }
                .btn { display: inline-block; padding: 6px 12px; margin-bottom: 0; font-size: 14px; font-weight: 400; 
                      line-height: 1.42857143; text-align: center; white-space: nowrap; vertical-align: middle; 
                      cursor: pointer; border: 1px solid transparent; border-radius: 4px; }
                .btn-primary { color: #fff; background-color: #337ab7; border-color: #2e6da4; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>WRF Namelist Generator</h1>
                <div class="alert alert-info">
                    <p>这是一个简化版的WRF Namelist生成器。完整版需要安装FastAPI和其他依赖。</p>
                    <p>由于检测到网络问题，我们提供了这个简化版本。</p>
                </div>
                <div>
                    <p>要使用完整功能，请先解决网络代理问题，然后安装以下依赖：</p>
                    <pre>pip install fastapi uvicorn python-multipart jinja2 pydantic</pre>
                </div>
                <hr>
                <div>
                    <h3>简化版功能演示</h3>
                    <p>点击下面的按钮生成一个使用默认设置的WRF namelist：</p>
                    <form action="/generate" method="post">
                        <button type="submit" class="btn btn-primary">使用默认设置生成</button>
                    </form>
                </div>
            </div>
        </body>
        </html>
        """

class WRFRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # 创建消息队列，但必须先调用父类的初始化
        super().__init__(*args, **kwargs)
        
    def initialize_queue(self):
        """确保队列已初始化"""
        if not hasattr(self, 'queue'):
            self.queue = queue.Queue()
        return self.queue
        
    def queue_put(self, message):
        """安全地将消息放入队列"""
        try:
            queue = self.initialize_queue()
            queue.put(message)
            print(f"消息日志: {message}")  # 在控制台也显示消息
        except Exception as e:
            print(f"消息队列错误 ({str(e)}): {message}")
    
    def do_GET(self):
        # 确保队列已初始化
        self.initialize_queue()
        
        # 解析路径
        parsed_path = urllib.parse.urlparse(self.path)
        
        # 处理静态文件
        if parsed_path.path.startswith('/static/'):
            try:
                file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), parsed_path.path[1:])
                with open(file_path, 'rb') as f:
                    self.send_response(200)
                    if file_path.endswith('.css'):
                        self.send_header('Content-type', 'text/css')
                    elif file_path.endswith('.js'):
                        self.send_header('Content-type', 'application/javascript')
                    else:
                        self.send_header('Content-type', 'application/octet-stream')
                    self.end_headers()
                    self.wfile.write(f.read())
                return
            except FileNotFoundError:
                print(f"Error: File not found: {file_path}")
                self.send_response(404)
                self.send_header('Content-type', 'text/html')
                self.end_headers()
                self.wfile.write(b'File not found')
                return
        
        # 首页
        if parsed_path.path == '/' or parsed_path.path == '/index.html':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            
            # 获取原始模板
            template = get_html_template()
            
            # 创建一个完整的HTML字符串，避免模板语法
            html_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Web-based configuration tool for Weather Research and Forecasting (WRF) Model. Generate namelist.wps and namelist.input files with guided setup.">
    <meta name="keywords" content="WRF, Weather Model, Atmospheric Simulation, Namelist Generator">
    <meta name="author" content="WRF Configuration Team">
    <title>WRF Namelist Generator - Web Configuration Interface</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="/static/css/style.css">
    <!-- Open Graph tags for social sharing -->
    <meta property="og:title" content="WRF Namelist Generator">
    <meta property="og:description" content="Web-based configuration tool for Weather Research and Forecasting Model">
    <meta property="og:type" content="website">
</head>
<body>
    <div class="container">
        <header>
            <h1>WRF Namelist Generator</h1>
            <p class="lead">Advanced configuration tool for Weather Research and Forecasting Model</p>
        </header>
        
        <!-- Step Navigation -->
        <div class="steps-nav">
            <div class="step-item active" data-step="1" data-label="Time">
                <i class="fas fa-clock"></i>
            </div>
            <div class="step-item" data-step="2" data-label="Domain">
                <i class="fas fa-globe"></i>
            </div>
            <div class="step-item" data-step="3" data-label="Physics">
                <i class="fas fa-atom"></i>
            </div>
            <div class="step-item" data-step="4" data-label="Dynamics">
                <i class="fas fa-wind"></i>
            </div>
            <div class="step-item" data-step="5" data-label="Review">
                <i class="fas fa-check"></i>
            </div>
        </div>
        
        <div class="steps-content">
            <!-- Step 1: Simulation Period -->
            <div class="step-page active" id="step-1">
                <div class="card">
                    <h2 class="card-title">
                        <i class="fas fa-clock"></i>
                        Simulation Period
                    </h2>
                    <p class="card-description">Define the time span for your WRF simulation. This determines the start and end dates for your forecast or analysis.</p>
                    
                    <div class="form-group">
                        <label for="start_date" class="form-label">Start Date</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="start_date" name="start_date" 
                                   placeholder="YYYY-MM-DD_HH:MM:SS"
                                   value="{start_date}"
                                   pattern="\\d{{4}}-\\d{{2}}-\\d{{2}}_\\d{{2}}:\\d{{2}}:\\d{{2}}">
                            <div class="input-help">
                                <i class="fas fa-circle-info"></i>
                                <span class="help-text">Format: YYYY-MM-DD_HH:MM:SS</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="end_date" class="form-label">End Date</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="end_date" name="end_date" 
                                   placeholder="YYYY-MM-DD_HH:MM:SS"
                                   value="{end_date}"
                                   pattern="\\d{{4}}-\\d{{2}}-\\d{{2}}_\\d{{2}}:\\d{{2}}:\\d{{2}}">
                            <div class="input-help">
                                <i class="fas fa-circle-info"></i>
                                <span class="help-text">Format: YYYY-MM-DD_HH:MM:SS</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="data_source" class="form-label">Data Source</label>
                        <select class="form-select" id="data_source" name="data_source">
                            {data_source_options}
                        </select>
                        <div class="input-help">
                            <i class="fas fa-circle-info"></i>
                            <span class="help-text">Meteorological data source for initial and boundary conditions</span>
                        </div>
                    </div>
                    
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle"></i>
                        <div>
                            <strong>Resource Impact</strong>
                            <p>The simulation period directly impacts computational resources needed and the accuracy of your forecast. Consider these factors when setting the time span:</p>
                            <ul>
                                <li>Longer periods require more computational time</li>
                                <li>Forecast accuracy typically decreases with longer time spans</li>
                                <li>Historical data availability may limit start dates</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="btn-group">
                        <div></div>
                        <button type="button" class="btn btn-primary next-step" data-next="2">
                            Next: Domain Setup
                            <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Step 2: Domain Setup -->
            <div class="step-page" id="step-2">
                <div class="card">
                    <h2 class="card-title">
                        <i class="fas fa-globe"></i>
                        Domain Setup
                    </h2>
                    <p class="card-description">Configure the spatial characteristics of your WRF model domain including resolution, projection, and nesting.</p>
                    
                    <div class="form-group">
                        <label for="projection" class="form-label">Map Projection</label>
                        <select class="form-select" id="projection" name="projection">
                            {projection_options}
                        </select>
                        <div class="input-help">
                            <i class="fas fa-circle-info"></i>
                            <span class="help-text">Choose the appropriate map projection for your region</span>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="max_dom" class="form-label">Number of Domains</label>
                        <select class="form-select" id="max_dom" name="domain.max_dom">
                            {max_dom_options}
                        </select>
                        <div class="input-help">
                            <i class="fas fa-circle-info"></i>
                            <span class="help-text">Select the number of nested domains (1-3)</span>
                        </div>
                    </div>
                    
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="e_we" class="form-label">E-W Grid Points</label>
                            <input type="number" class="form-control" id="e_we" name="domain.e_we" 
                                   value="{e_we}" min="1">
                        </div>
                        <div class="form-group">
                            <label for="e_sn" class="form-label">N-S Grid Points</label>
                            <input type="number" class="form-control" id="e_sn" name="domain.e_sn" 
                                   value="{e_sn}" min="1">
                        </div>
                    </div>
                    
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="dx" class="form-label">DX (km)</label>
                            <input type="number" step="0.1" class="form-control" id="dx" name="domain.dx" 
                                   value="{dx}" min="0">
                        </div>
                        <div class="form-group">
                            <label for="dy" class="form-label">DY (km)</label>
                            <input type="number" step="0.1" class="form-control" id="dy" name="domain.dy" 
                                   value="{dy}" min="0">
                        </div>
                    </div>
                    
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="ref_lat" class="form-label">Reference Latitude</label>
                            <input type="number" step="0.1" class="form-control" id="ref_lat" name="domain.ref_lat" 
                                   value="{ref_lat}">
                        </div>
                        <div class="form-group">
                            <label for="ref_lon" class="form-label">Reference Longitude</label>
                            <input type="number" step="0.1" class="form-control" id="ref_lon" name="domain.ref_lon" 
                                   value="{ref_lon}">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="stand_lon" class="form-label">Standard Longitude</label>
                        <input type="number" step="0.1" class="form-control" id="stand_lon" name="domain.stand_lon" 
                               value="{stand_lon}">
                    </div>
                    
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="truelat1" class="form-label">True Latitude 1</label>
                            <input type="number" step="0.1" class="form-control" id="truelat1" name="domain.truelat1" 
                                   value="{truelat1}">
                        </div>
                        <div class="form-group">
                            <label for="truelat2" class="form-label">True Latitude 2</label>
                            <input type="number" step="0.1" class="form-control" id="truelat2" name="domain.truelat2" 
                                   value="{truelat2}">
                        </div>
                    </div>
                    
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle"></i>
                        <div>
                            <strong>Domain Configuration</strong>
                            <p>For multi-domain setup, parent grid ratios and starting locations are set automatically based on best practices. Consider these guidelines:</p>
                            <ul>
                                <li>Nested domains should be at least 10 grid points from parent boundaries</li>
                                <li>Recommended parent-to-nest ratio is 3:1 or 5:1</li>
                                <li>Higher resolution domains require more computational resources</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="btn-group">
                        <button type="button" class="btn btn-secondary prev-step" data-prev="1">
                            <i class="fas fa-arrow-left"></i>
                            Previous
                        </button>
                        <button type="button" class="btn btn-primary next-step" data-next="3">
                            Next: Physics Options
                            <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Step 3: Physics Options -->
            <div class="step-page" id="step-3">
                <div class="card">
                    <h2 class="card-title">
                        <i class="fas fa-atom"></i>
                        Physics Options
                    </h2>
                    <p class="card-description">Select the physical parameterization schemes for your simulation.</p>
                    
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="mp_physics" class="form-label">Microphysics Scheme</label>
                            <select class="form-select" id="mp_physics" name="physics.mp_physics">
                                {mp_physics_options}
                            </select>
                            <div class="input-help">
                                <i class="fas fa-circle-info"></i>
                                <span class="help-text">Controls cloud and precipitation processes</span>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="cu_physics" class="form-label">Cumulus Scheme</label>
                            <select class="form-select" id="cu_physics" name="physics.cu_physics">
                                {cu_physics_options}
                            </select>
                            <div class="input-help">
                                <i class="fas fa-circle-info"></i>
                                <span class="help-text">Handles convective processes</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="ra_lw_physics" class="form-label">Longwave Radiation Scheme</label>
                            <select class="form-select" id="ra_lw_physics" name="physics.ra_lw_physics">
                                {ra_lw_physics_options}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="ra_sw_physics" class="form-label">Shortwave Radiation Scheme</label>
                            <select class="form-select" id="ra_sw_physics" name="physics.ra_sw_physics">
                                {ra_sw_physics_options}
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="sf_surface_physics" class="form-label">Surface Layer Scheme</label>
                            <select class="form-select" id="sf_surface_physics" name="physics.sf_surface_physics">
                                {sf_surface_physics_options}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="bl_pbl_physics" class="form-label">PBL Scheme</label>
                            <select class="form-select" id="bl_pbl_physics" name="physics.bl_pbl_physics">
                                {bl_pbl_physics_options}
                            </select>
                        </div>
                    </div>
                    
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle"></i>
                        <div>
                            <strong>Physics Scheme Selection</strong>
                            <p>Choose physics schemes that are appropriate for your region and research goals:</p>
                            <ul>
                                <li>Some schemes are more computationally intensive than others</li>
                                <li>Certain combinations of schemes work better together</li>
                                <li>Consider the spatial and temporal scales of your phenomena of interest</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="btn-group">
                        <button type="button" class="btn btn-secondary prev-step" data-prev="2">
                            <i class="fas fa-arrow-left"></i>
                            Previous
                        </button>
                        <button type="button" class="btn btn-primary next-step" data-next="4">
                            Next: Dynamics Options
                            <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Step 4: Dynamics Options -->
            <div class="step-page" id="step-4">
                <div class="card">
                    <h2 class="card-title">
                        <i class="fas fa-wind"></i>
                        Dynamics Options
                    </h2>
                    <p class="card-description">Configure the dynamic core settings for your WRF simulation.</p>
                    
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="diff_opt" class="form-label">Diffusion Option</label>
                            <select class="form-select" id="diff_opt" name="dynamics.diff_opt">
                                {diff_opt_options}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="km_opt" class="form-label">Eddy Coefficient Option</label>
                            <select class="form-select" id="km_opt" name="dynamics.km_opt">
                                {km_opt_options}
                            </select>
                        </div>
                    </div>
                    
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle"></i>
                        <div>
                            <strong>Dynamics Configuration</strong>
                            <p>The dynamics options control how the model handles:</p>
                            <ul>
                                <li>Numerical diffusion and stability</li>
                                <li>Turbulent mixing processes</li>
                                <li>Model dynamics and computational efficiency</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="btn-group">
                        <button type="button" class="btn btn-secondary prev-step" data-prev="3">
                            <i class="fas fa-arrow-left"></i>
                            Previous
                        </button>
                        <button type="button" class="btn btn-primary next-step" data-next="5">
                            Next: Review Configuration
                            <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Step 5: Review and Generate -->
            <div class="step-page" id="step-5">
                <div class="card">
                    <h2 class="card-title">
                        <i class="fas fa-check"></i>
                        Review Configuration
                    </h2>
                    <p class="card-description">Review your configuration settings before generating the namelist files.</p>
                    
                    <div id="config-summary">
                        <!-- This will be populated by JavaScript -->
                    </div>
                    
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle"></i>
                        <div>
                            <strong>Before Generating</strong>
                            <p>Please verify that:</p>
                            <ul>
                                <li>All required fields are filled correctly</li>
                                <li>The domain configuration is appropriate for your study area</li>
                                <li>The selected physics schemes are compatible</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div id="result-section" style="display: none;">
                        <div class="card">
                            <h2 class="card-title">
                                <i class="fas fa-check-circle"></i>
                                生成结果
                            </h2>
                            
                            <div id="result-messages" class="result-messages"></div>
                            
                            <div class="download-section">
                                <h3>下载文件</h3>
                                <p>这些文件已经生成并可供下载：</p>
                                
                                <div class="download-grid">
                                    <div class="download-item">
                                        <i class="fas fa-file-code"></i>
                                        <h4>namelist.wps</h4>
                                        <p>WRF预处理系统配置文件</p>
                                        <a href="#" id="download-wps" class="btn btn-secondary">
                                            <i class="fas fa-download"></i> 下载
                                        </a>
                                    </div>
                                    
                                    <div class="download-item">
                                        <i class="fas fa-file-code"></i>
                                        <h4>namelist.input</h4>
                                        <p>WRF模型运行配置文件</p>
                                        <a href="#" id="download-input" class="btn btn-secondary">
                                            <i class="fas fa-download"></i> 下载
                                        </a>
                                    </div>
                                    
                                    <div class="download-item">
                                        <i class="fas fa-terminal"></i>
                                        <h4>数据下载脚本</h4>
                                        <p>用于获取气象数据的脚本</p>
                                        <a href="#" id="download-script" class="btn btn-secondary">
                                            <i class="fas fa-download"></i> 下载
                                        </a>
                                    </div>
                                    
                                    <div class="download-item">
                                        <i class="fas fa-play"></i>
                                        <h4>运行脚本</h4>
                                        <p>用于执行WRF模型的脚本</p>
                                        <a href="#" id="download-run" class="btn btn-secondary">
                                            <i class="fas fa-download"></i> 下载
                                        </a>
                                    </div>
                                </div>
                                
                                <div class="output-path">
                                    <p>所有文件已保存至：</p>
                                    <div id="output-dir-path" class="code-block"></div>
                                </div>
                                
                                <div id="namelist-preview" class="namelist-preview">
                                    <h3>Namelist 预览</h3>
                                    <div class="tabs">
                                        <button class="tab active" data-tab="wps">namelist.wps</button>
                                        <button class="tab" data-tab="input">namelist.input</button>
                                    </div>
                                    <div id="wps-tab" class="tab-content active">
                                        <pre id="wps-content"></pre>
                                    </div>
                                    <div id="input-tab" class="tab-content">
                                        <pre id="input-content"></pre>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="btn-group">
                                <button type="button" class="btn btn-secondary" id="reset-btn">
                                    <i class="fas fa-redo"></i> 重置配置
                                </button>
                                <button type="button" class="btn btn-secondary" id="save-config-btn">
                                    <i class="fas fa-save"></i> 保存配置模板
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="btn-group">
                        <button type="button" class="btn btn-secondary prev-step" data-prev="4">
                            <i class="fas fa-arrow-left"></i>
                            Previous
                        </button>
                        <button type="button" class="btn btn-primary" id="generate-btn">
                            Generate Namelist Files
                            <i class="fas fa-file-export"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script src="/static/js/script.js"></script>
</body>
</html>
            """
            
            # 构建投影选项的HTML
            projection_options = ""
            for proj_id, proj_name in PROJECTIONS.items():
                selected = "selected" if int(proj_id) == DEFAULT_CONFIG['projection'] else ""
                projection_options += f'<option value="{proj_id}" {selected}>{proj_name}</option>\n'
            
            # 构建数据源选项的HTML
            data_source_options = ""
            for ds_id, ds_name in DATA_SOURCES.items():
                selected = "selected" if ds_id == DEFAULT_CONFIG['data_source'] else ""
                data_source_options += f'<option value="{ds_id}" {selected}>{ds_name}</option>\n'
            
            # 构建物理参数选项的HTML
            physics_options = {}
            for phys_key, options in PHYSICS_OPTIONS.items():
                options_html = ""
                for option_id, option_name in options.items():
                    selected = "selected" if int(option_id) == DEFAULT_CONFIG['physics'].get(phys_key, 1) else ""
                    options_html += f'<option value="{option_id}" {selected}>{option_name}</option>\n'
                physics_options[phys_key] = options_html
            
            # 构建动力学选项的HTML
            dynamics_options = {}
            for dyn_key, options in DYNAMICS_OPTIONS.items():
                options_html = ""
                for option_id, option_name in options.items():
                    selected = "selected" if int(option_id) == DEFAULT_CONFIG['dynamics'].get(dyn_key, 2) else ""
                    options_html += f'<option value="{option_id}" {selected}>{option_name}</option>\n'
                dynamics_options[dyn_key] = options_html
            
            # 构建max_dom下拉选项
            max_dom_options = ""
            for i in range(1, 4):
                selected = "selected" if i == DEFAULT_CONFIG['domain']['max_dom'] else ""
                max_dom_options += f'<option value="{i}" {selected}>{i}</option>\n'
            
            # 替换变量
            formatted_html = html_content.format(
                start_date=DEFAULT_CONFIG['start_date'],
                end_date=DEFAULT_CONFIG['end_date'],
                data_source_options=data_source_options,
                projection_options=projection_options,
                max_dom_options=max_dom_options,
                e_we=DEFAULT_CONFIG['domain']['e_we'],
                e_sn=DEFAULT_CONFIG['domain']['e_sn'],
                dx=DEFAULT_CONFIG['domain']['dx'],
                dy=DEFAULT_CONFIG['domain']['dy'],
                ref_lat=DEFAULT_CONFIG['domain']['ref_lat'],
                ref_lon=DEFAULT_CONFIG['domain']['ref_lon'],
                stand_lon=DEFAULT_CONFIG['domain']['stand_lon'],
                truelat1=DEFAULT_CONFIG['domain']['truelat1'],
                truelat2=DEFAULT_CONFIG['domain']['truelat2'],
                mp_physics_options=physics_options['mp_physics'],
                cu_physics_options=physics_options['cu_physics'],
                ra_lw_physics_options=physics_options['ra_lw_physics'],
                ra_sw_physics_options=physics_options['ra_sw_physics'],
                sf_surface_physics_options=physics_options['sf_surface_physics'],
                bl_pbl_physics_options=physics_options['bl_pbl_physics'],
                diff_opt_options=dynamics_options['diff_opt'],
                km_opt_options=dynamics_options['km_opt']
            )
            
            self.wfile.write(formatted_html.encode('utf-8'))
            return
            
        # 下载文件
        elif parsed_path.path.startswith('/download/'):
            filename = parsed_path.path.split('/')[-1]
            query = urllib.parse.parse_qs(parsed_path.query)
            
            # 修复：确保即使未提供output_dir参数也能使用默认路径
            if 'output_dir' in query and query['output_dir'][0].strip():
                output_dir = query['output_dir'][0]
            else:
                output_dir = DEFAULT_CONFIG['output_dir']
                self.queue_put(f"Using default output directory: {output_dir}")
            
            file_path = os.path.join(output_dir, filename)
            
            # 检查目录是否存在，如果不存在则创建
            if not os.path.exists(output_dir):
                try:
                    os.makedirs(output_dir)
                    self.queue_put(f"Created output directory: {output_dir}")
                except Exception as e:
                    self.send_response(500)
                    self.send_header('Content-type', 'text/html')
                    self.end_headers()
                    self.wfile.write(f'创建目录失败: {str(e)}'.encode('utf-8'))
                    return
            
            # 尝试创建文件如果不存在（用于测试）
            if not os.path.exists(file_path):
                try:
                    # 根据文件类型创建示例内容
                    if filename == "namelist.wps":
                        with open(file_path, 'w') as f:
                            f.write("&share\n wrf_core = 'ARW',\n/\n")
                    elif filename == "namelist.input":
                        with open(file_path, 'w') as f:
                            f.write("&time_control\n run_days = 1,\n/\n")
                    elif filename.endswith(".sh") or filename.endswith(".bat"):
                        with open(file_path, 'w') as f:
                            f.write("#!/bin/bash\necho 'WRF Script'\n" if filename.endswith(".sh") else "@echo off\necho WRF Script\n")
                        if filename.endswith(".sh"):
                            os.chmod(file_path, 0o755)  # 设置可执行权限
                except Exception as e:
                    self.send_response(500)
                    self.send_header('Content-type', 'text/html')
                    self.end_headers()
                    self.wfile.write(f'创建文件失败: {str(e)}'.encode('utf-8'))
                    return
            
            if os.path.exists(file_path):
                self.send_response(200)
                self.send_header('Content-type', 'application/octet-stream')
                self.send_header('Content-Disposition', f'attachment; filename="{filename}"')
                self.end_headers()
                
                with open(file_path, 'rb') as f:
                    self.wfile.write(f.read())
            else:
                self.send_response(404)
                self.send_header('Content-type', 'text/html')
                self.end_headers()
                self.wfile.write(f'文件 {filename} 不存在'.encode('utf-8'))
            return
            
        # API端点：获取配置
        elif parsed_path.path == '/config':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(DEFAULT_CONFIG).encode('utf-8'))
            return
            
        # API端点：获取选项
        elif parsed_path.path == '/options':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            options = {
                "physics_options": PHYSICS_OPTIONS,
                "dynamics_options": DYNAMICS_OPTIONS,
                "projections": PROJECTIONS,
                "data_sources": DATA_SOURCES
            }
            self.wfile.write(json.dumps(options).encode('utf-8'))
            return
            
        # 未找到的路径
        else:
            self.send_response(404)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(b'Page not found')
            return
    
    def do_POST(self):
        # 确保队列已初始化
        self.initialize_queue()
        
        # 生成文件API
        if self.path == '/generate':
            # 获取POST数据长度
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length).decode('utf-8')
            
            try:
                # 尝试解析JSON
                config = json.loads(post_data) if content_length > 0 else DEFAULT_CONFIG
            except json.JSONDecodeError:
                # 如果不是JSON，尝试解析表单数据
                form_data = urllib.parse.parse_qs(post_data)
                config = self.parse_form_data(form_data)
            
            # 检查是否可以生成文件
            if not HAS_GENERATOR:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                response = {
                    "success": False,
                    "error": "无法导入generator_module，无法生成文件"
                }
                self.wfile.write(json.dumps(response).encode('utf-8'))
                return
            
            try:
                # 使用处理程序的消息队列
                self.queue_put("开始生成配置文件...")
                
                # 创建生成器
                generator = WRFGenerator(config, self)
                
                # 生成文件
                generator_thread = threading.Thread(target=generator.generate_all)
                generator_thread.start()
                generator_thread.join()
                
                # 收集消息
                messages = []
                queue = self.initialize_queue()
                while not queue.empty():
                    messages.append(queue.get())
                
                # 返回成功响应
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                
                # 构建下载链接
                download_links = {
                    "namelist_wps": f"/download/namelist.wps",
                    "namelist_input": f"/download/namelist.input",
                    "download_script": f"/download/download_data.{'bat' if platform.system().lower() == 'windows' else 'sh'}",
                    "run_script": f"/download/run_wrf.{'bat' if platform.system().lower() == 'windows' else 'sh'}"
                }
                
                response = {
                    "success": True,
                    "output_dir": config['output_dir'],
                    "messages": messages,
                    "download_links": download_links
                }
                self.wfile.write(json.dumps(response).encode('utf-8'))
                
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                
                response = {
                    "success": False,
                    "error": str(e)
                }
                self.wfile.write(json.dumps(response).encode('utf-8'))
        else:
            self.send_response(404)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(b'Endpoint not found')

    def parse_form_data(self, form_data):
        """解析表单数据并转换为配置对象"""
        config = DEFAULT_CONFIG.copy()
        
        # 解析基本参数
        if 'start_date' in form_data:
            config['start_date'] = form_data['start_date'][0]
        if 'end_date' in form_data:
            config['end_date'] = form_data['end_date'][0]
        if 'data_source' in form_data:
            config['data_source'] = form_data['data_source'][0]
        if 'output_dir' in form_data:
            config['output_dir'] = form_data['output_dir'][0]
        if 'projection' in form_data:
            config['projection'] = int(form_data['projection'][0])
        
        # 解析domain参数
        for key in config['domain'].keys():
            form_key = f'domain.{key}'
            if form_key in form_data:
                try:
                    # 尝试转换为数值类型
                    value = form_data[form_key][0]
                    if key in ['max_dom', 'e_we', 'e_sn', 'i_parent_start', 'j_parent_start']:
                        config['domain'][key] = int(value)
                    elif key in ['dx', 'dy', 'ref_lat', 'ref_lon', 'truelat1', 'truelat2', 'stand_lon']:
                        config['domain'][key] = float(value)
                    elif key in ['parent_grid_ratio', 'parent_time_step_ratio']:
                        # 处理逗号分隔的数组
                        config['domain'][key] = [int(x.strip()) for x in value.split(',')]
                    else:
                        config['domain'][key] = value
                except (ValueError, TypeError):
                    # 如果转换失败，保留默认值
                    pass
        
        # 解析physics参数
        for key in config['physics'].keys():
            form_key = f'physics.{key}'
            if form_key in form_data:
                try:
                    config['physics'][key] = int(form_data[form_key][0])
                except (ValueError, TypeError):
                    pass
        
        # 解析dynamics参数
        for key in config['dynamics'].keys():
            form_key = f'dynamics.{key}'
            if form_key in form_data:
                try:
                    if key in ['diff_opt', 'km_opt']:
                        config['dynamics'][key] = int(form_data[form_key][0])
                    elif key == 'non_hydrostatic':
                        config['dynamics'][key] = bool(int(form_data[form_key][0]))
                    else:
                        config['dynamics'][key] = form_data[form_key][0]
                except (ValueError, TypeError):
                    # 如果转换失败，保留默认值
                    pass
        
        # 解析用户设置
        for key in config['user_settings'].keys():
            form_key = f'user_settings.{key}'
            if form_key in form_data:
                config['user_settings'][key] = form_data[form_key][0]
        
        return config

def run_server(port=8000):
    try:
        # 尝试启动服务器
        with socketserver.TCPServer(("", port), WRFRequestHandler) as httpd:
            print(f"服务器已启动，访问 http://localhost:{port}")
            httpd.serve_forever()
    except socket.error as e:
        if e.errno == 10048:  # 端口已被占用
            print(f"端口 {port} 已被占用，尝试使用其他端口...")
            run_server(port + 1)
        else:
            print(f"启动服务器时出错: {e}")
    except KeyboardInterrupt:
        print("服务器已停止")

if __name__ == "__main__":
    run_server()