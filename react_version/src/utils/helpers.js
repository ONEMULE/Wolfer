/**
 * 格式化日期字符串为WRF需要的格式
 * @param {string} dateString - 日期字符串，格式为 YYYY-MM-DD_HH:MM:SS
 * @returns {object} 包含格式化后年月日时分秒的对象
 */
export const formatDateString = (dateString) => {
  const [datePart, timePart] = dateString.split('_');
  const [year, month, day] = datePart.split('-');
  const [hour, minute, second] = timePart.split(':');
  
  return {
    year: parseInt(year),
    month: parseInt(month),
    day: parseInt(day),
    hour: parseInt(hour),
    minute: parseInt(minute),
    second: parseInt(second)
  };
};

/**
 * 将日期对象转换为WRF输入格式的字符串
 * @param {Date} date - 日期对象
 * @returns {string} 格式为 YYYY-MM-DD_HH:MM:SS 的字符串
 */
export const dateToWrfString = (date) => {
  const pad = (num) => String(num).padStart(2, '0');
  
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

/**
 * 将WRF格式的字符串转换为日期对象
 * @param {string} wrfString - 格式为 YYYY-MM-DD_HH:MM:SS 的WRF日期字符串
 * @returns {Date} 日期对象
 */
export const wrfStringToDate = (wrfString) => {
  const [datePart, timePart] = wrfString.split('_');
  const [year, month, day] = datePart.split('-');
  const [hour, minute, second] = timePart.split(':');
  
  return new Date(
    parseInt(year),
    parseInt(month) - 1, // JavaScript的月份是0-11
    parseInt(day),
    parseInt(hour),
    parseInt(minute),
    parseInt(second)
  );
};

/**
 * 计算两个WRF日期字符串之间的小时差
 * @param {string} startDate - 开始日期，格式为 YYYY-MM-DD_HH:MM:SS
 * @param {string} endDate - 结束日期，格式为 YYYY-MM-DD_HH:MM:SS
 * @returns {number} 小时差
 */
export const calculateHoursBetweenDates = (startDate, endDate) => {
  const start = wrfStringToDate(startDate);
  const end = wrfStringToDate(endDate);
  
  const diffMilliseconds = end - start;
  return Math.floor(diffMilliseconds / (1000 * 60 * 60));
};

/**
 * 验证配置对象的有效性
 * @param {object} config - WRF配置对象
 * @returns {object} 包含isValid和errors的对象
 */
export const validateConfig = (config) => {
  const errors = {};
  
  // 验证日期
  if (!config.start_date) {
    errors.start_date = '开始日期不能为空';
  }
  
  if (!config.end_date) {
    errors.end_date = '结束日期不能为空';
  }
  
  if (config.start_date && config.end_date) {
    const start = wrfStringToDate(config.start_date);
    const end = wrfStringToDate(config.end_date);
    
    if (start >= end) {
      errors.date_range = '结束日期必须晚于开始日期';
    }
  }
  
  // 验证domain
  const domain = config.domain;
  if (!domain) {
    errors.domain = '缺少domain配置';
  } else {
    if (!domain.e_we || domain.e_we < 3) {
      errors.e_we = 'e_we必须大于等于3';
    }
    
    if (!domain.e_sn || domain.e_sn < 3) {
      errors.e_sn = 'e_sn必须大于等于3';
    }
    
    if (!domain.dx || domain.dx <= 0) {
      errors.dx = 'dx必须大于0';
    }
    
    if (!domain.dy || domain.dy <= 0) {
      errors.dy = 'dy必须大于0';
    }
    
    if (domain.max_dom < 1 || domain.max_dom > 10) {
      errors.max_dom = 'max_dom必须在1-10之间';
    }
  }
  
  // 验证输出路径
  if (!config.output_dir) {
    errors.output_dir = '输出目录不能为空';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * 下载生成的文件
 * @param {Blob} blob - 文件Blob对象
 * @param {string} filename - 文件名
 */
export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  a.remove();
}; 