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
    def do_GET(self):
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
            
            template = get_html_template()
            # 简单的模板替换
            html_content = template.replace('{{ config.start_date }}', DEFAULT_CONFIG['start_date'])
            html_content = html_content.replace('{{ config.end_date }}', DEFAULT_CONFIG['end_date'])
            
            self.wfile.write(html_content.encode('utf-8'))
            return
            
        # 下载文件
        elif parsed_path.path.startswith('/download/'):
            filename = parsed_path.path.split('/')[-1]
            query = urllib.parse.parse_qs(parsed_path.query)
            output_dir = query.get('output_dir', [DEFAULT_CONFIG['output_dir']])[0]
            
            file_path = os.path.join(output_dir, filename)
            
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
    
    def do_POST(self):
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
                config = DEFAULT_CONFIG
            
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
                # 创建消息队列
                message_queue = queue.Queue()
                
                # 创建生成器
                generator = WRFGenerator(config, message_queue)
                
                # 生成文件
                generator_thread = threading.Thread(target=generator.generate_all)
                generator_thread.start()
                generator_thread.join()
                
                # 收集消息
                messages = []
                while not message_queue.empty():
                    messages.append(message_queue.get())
                
                # 返回成功响应
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                
                response = {
                    "success": True,
                    "output_dir": config['output_dir'],
                    "messages": messages
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