# 沃风平台 - React版本

基于React 18.2.0和现代UI组件的Weather Research and Forecasting (WRF)模型配置文件生成工具。

## 特性

- 现代化UI界面，使用React 18和Radix UI组件
- 完整的WRF域参数配置
- 丰富的物理参数化方案选择
- 实时参数验证与表单控制
- 响应式设计，支持各种设备访问
- 利用React 18的并发特性提升性能

## 安装要求

- Node.js 16.x或更高版本
- npm 8.x或更高版本

## 安装说明

1. 克隆仓库
2. 安装依赖

```bash
cd react_version
npm install
```

3. 启动开发服务器

```bash
npm start
```

此时应用将在 http://localhost:3000 上运行

## 构建生产版本

```bash
npm run build
```

构建后的文件将在 `build` 目录中。

## 项目结构

```
src/
├── api/           # API服务接口
├── components/    # UI组件
│   ├── ui/        # 基础UI组件
│   └── ...        # 其他组件
├── pages/         # 页面组件
├── utils/         # 工具函数和常量
└── App.js         # 主应用组件
```

## 技术栈

- React 18.2.0
- React DOM 18.2.0
- React Router 6.18.0
- Tailwind CSS 3.3.3
- Radix UI组件库
- Axios 1.5.0

## React 18特性应用

- **自动批处理**：减少不必要的重新渲染
- **并发渲染**：优化用户界面响应性
- **Suspense组件**：改进数据加载体验
- **新的服务器端渲染架构**：提升首次加载性能

## 配置选项

### 域设置

- **E_WE & E_SN**: 网格尺寸
- **DX & DY**: 网格间距(km)
- **REF_LAT & REF_LON**: 参考纬度和经度
- **投影选项**: Lambert Conformal、Polar Stereographic、Mercator、Lat-Lon等

### 物理参数设置

- **微物理方案**: WSM6、Thompson等
- **长波辐射**: RRTM、CAM等
- **短波辐射**: Dudhia、Goddard等
- **表面物理**: Noah Land Surface Model等
- **边界层方案**: YSU、MYJ等
- **积云方案**: Kain-Fritsch、BMJ等

## 后端接口

该React前端设计为与原有Web版本的后端服务（server.py）或自定义API服务配合使用。

## 浏览器兼容性

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## 贡献指南

欢迎提交问题和拉取请求以改进项目！ 