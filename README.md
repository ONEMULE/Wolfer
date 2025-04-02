# WRF Namelist Generator

Weather Research and Forecasting (WRF) 模型的配置文件生成工具，提供Web界面和桌面应用两种版本。

## 项目结构

本项目包含两个独立的版本：

1. **Web版本** - 提供基于Web的配置界面
2. **桌面版本** - 提供基于PyQt5的桌面应用程序

## Web版本

位于 `web_version` 目录，特点：

- 简单的Web界面，基于Python标准库http.server实现
- 无需安装额外依赖
- 支持所有WRF物理参数化方案的配置
- 启动简单，通过浏览器访问

### 启动Web版本

```bash
cd web_version
python server.py
```

然后在浏览器中访问 http://localhost:8000

## 桌面版本

位于 `desktop_version` 目录，特点：

- 美观的桌面图形界面，基于PyQt5
- 提供更丰富的功能和更好的用户体验
- 支持地图预览和更高级的配置选项

### 启动桌面版本

先安装依赖：

```bash
cd desktop_version
pip install -r requirements.txt
python main.py
```

## 许可证

<<<<<<< HEAD
MIT 
=======
MIT
>>>>>>> dd1a7473a8bf0b735f17a9fb36cc1b7185b04ea2
