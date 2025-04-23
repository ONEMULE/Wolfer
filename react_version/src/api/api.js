import axios from 'axios';

// 创建一个axios实例
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000', 
  timeout: 30000, // 30秒超时
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么
    return config;
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    // 对响应数据做点什么
    return response.data;
  },
  (error) => {
    // 对响应错误做点什么
    let message = '请求失败';
    if (error.response) {
      // 服务器返回了错误状态码
      message = error.response.data.message || `请求错误: ${error.response.status}`;
    } else if (error.request) {
      // 请求发出但没有收到响应
      message = '服务器无响应，请检查网络连接';
    } else {
      // 请求设置有问题
      message = error.message;
    }
    console.error('API请求错误:', message);
    return Promise.reject({ message });
  }
);

// 导出API方法
const apiService = {
  // 获取项目配置
  getConfiguration: () => api.get('/api/configuration'),
  
  // 保存配置
  saveConfiguration: (config) => api.post('/api/configuration', config),
  
  // 生成Namelist文件
  generateNamelist: (config) => api.post('/api/generate', config),
  
  // 下载生成的文件
  downloadFile: (filename) => api.get(`/api/download/${filename}`, { 
    responseType: 'blob' 
  }),
  
  // 获取物理参数选项
  getPhysicsOptions: () => api.get('/api/physics-options'),
  
  // 获取投影选项
  getProjections: () => api.get('/api/projections'),
  
  // 获取数据源选项
  getDataSources: () => api.get('/api/data-sources'),
  
  // 检查配置是否有效
  validateConfig: (config) => api.post('/api/validate', config)
};

export default apiService; 