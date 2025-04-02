# WRF Namelist Generator

一个用于Weather Research and Forecasting (WRF) 模型的配置文件生成工具，提供Web界面和桌面应用两种版本。

## 📖 项目简介

WRF Namelist Generator 旨在简化WRF模型的配置文件（namelist.input）生成过程。WRF是一种用于大气研究和天气预报的中尺度数值天气预报系统，但其配置文件编写过程较为复杂，容易出错。本工具通过图形界面帮助研究人员和气象工作者快速、准确地生成符合要求的配置文件。

## 🔍 项目结构

本项目包含两个独立的版本，用户可根据需求选择使用：

1. **Web版本** - 提供基于Web的配置界面
2. **桌面版本** - 提供基于PyQt5的桌面应用程序

## 🌐 Web版本

位于 `web_version` 目录，特点：

- 简单的Web界面，基于Python标准库http.server实现
- 无需安装额外依赖
- 支持所有WRF物理参数化方案的配置
- 跨平台兼容性好，只需浏览器即可访问
- 适合快速使用或部署在服务器上供多人使用

### 启动Web版本

```bash
cd web_version
python server.py
```

然后在浏览器中访问 http://localhost:8000

## 💻 桌面版本

位于 `desktop_version` 目录，特点：

- 美观的桌面图形界面，基于PyQt5
- 提供更丰富的功能和更好的用户体验
- 支持地图预览和更高级的配置选项
- 适合需要频繁使用或高级配置的用户

### 启动桌面版本

先安装依赖：

```bash
cd desktop_version
pip install -r requirements.txt
python main.py
```

## 🚀 功能特性

- 支持完整的WRF配置参数设置
- 实时参数校验，防止无效配置
- 配置模板保存与加载
- 多语言支持（中文和英文）
- 丰富的物理参数化方案选择

## 📋 系统要求

### Web版本
- Python 3.6+
- 现代Web浏览器（Chrome, Firefox, Safari, Edge等）

### 桌面版本
- Python 3.6+
- PyQt5
- 详细依赖列表见`desktop_version/requirements.txt`

## 🤝 如何贡献

欢迎对本项目做出贡献！您可以通过以下方式参与：

1. 提交问题和建议 (Issues)
2. 提交改进代码 (Pull Requests)
3. 完善文档

## 📄 许可证

MIT