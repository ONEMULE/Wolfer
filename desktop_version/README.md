# WRF Namelist Generator - 桌面版本

这是WRF Namelist Generator的桌面版本，提供了一个基于PyQt5的图形界面，用于配置和生成WRF模型的namelist文件。

## 特点

- 美观的桌面图形界面
- 支持所有WRF物理参数化方案的配置
- 支持多域嵌套配置
- 内置地图预览功能
- 支持GFS、ERA5等多种数据源
- 生成namelist.wps和namelist.input文件
- 提供WPS和WRF运行环境配置

## 安装

1. 确保已安装Python 3.7+
2. 安装依赖:

```bash
pip install -r requirements.txt
```

## 启动应用

```bash
python main.py
```

## 打包为可执行文件

使用PyInstaller打包为独立可执行文件:

```bash
pip install pyinstaller
pyinstaller --onefile --windowed main.py
```

生成的可执行文件位于`dist`目录中。

## 配置文件

配置文件保存在用户目录下的`.wrf_generator`目录中:

- Windows: `C:\Users\<用户名>\.wrf_generator`
- Linux/macOS: `~/.wrf_generator`

## 许可证

MIT