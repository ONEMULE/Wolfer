# WRF Namelist Generator - Web版本

这是WRF Namelist Generator的Web版本，提供了一个基于Web的界面，用于配置和生成WRF模型的namelist文件。

## 特点

- 简单的Web界面，无需安装额外依赖
- 支持所有WRF物理参数化方案的配置
- 支持多域嵌套配置
- 支持GFS、ERA5等多种数据源
- 生成namelist.wps和namelist.input文件

## 快速开始

1. 确保已安装Python 3.7+
2. 运行服务器:

```bash
python server.py
```

3. 在浏览器中访问 http://localhost:8000

## 自定义配置

修改 `server.py` 中的 `DEFAULT_CONFIG` 变量来更改默认配置。

## 使用FastAPI版本（可选）

如果您希望使用基于FastAPI的高级版本，请安装额外的依赖：

```bash
pip install -r requirements.txt
```

并取消注释相关代码，然后使用:

```bash
python -m uvicorn main:app --reload
```

## 许可证

MIT