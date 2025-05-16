// 模拟与Gemini API的交互
// 实际实现中，这些请求会转发到后端Node.js服务，再由后端调用Gemini API

/**
 * 发送消息到灵犀助手
 * @param {string} message - 用户消息
 * @param {Array} history - 对话历史
 * @returns {Promise} - 返回响应Promise
 */
export const sendMessageToLingxi = async (message, history = []) => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 模拟响应
  const responses = {
    default: "感谢您的提问。我是灵犀助手，基于Gemini 2.0模型，可以帮助您解答关于沃风平台、WRF模型配置以及风资源评估相关的问题。请问还有什么我可以帮您解答的吗？",
    
    wrf: "WRF (Weather Research and Forecasting) 模型是一个功能强大的中尺度数值天气预报系统，被广泛用于大气研究和天气预报。在沃风平台中，我们简化了WRF的配置过程，重点关注以下几个核心参数：\n\n1. 时间设置：确定模拟的起止时间和输出频率\n2. 域设置：定义模拟区域的位置、大小和分辨率\n3. 物理参数化方案：选择适合您研究目标的各类物理过程表示方法\n4. 动力学设置：控制模型求解方程的方式\n\n您可以通过平台界面轻松设置这些参数，不需要直接编辑复杂的namelist文件。",
    
    wind: "风资源评估是风电场选址的关键步骤。沃风平台可以帮助您：\n\n1. 分析模拟得到的风场数据，计算关键指标如平均风速、风功率密度和湍流强度\n2. 生成可视化图表，包括风速分布图、风向玫瑰图和风切变分析\n3. 基于预设标准自动识别风资源丰富的潜在区域\n4. 结合地形、土地利用等因素进行综合评估\n\n这些功能可以帮助您在初期快速筛选出值得进一步实地考察的位置，节省时间和成本。",
    
    economics: "沃风平台的经济效益分析模块可以帮助您评估风电项目的经济可行性。通过集成ABaCAS工具，平台可以：\n\n1. 基于模拟的风资源数据，估算风电场的发电量\n2. 考虑设备成本、运维费用、电价等因素，计算项目的投资回报\n3. 生成关键经济指标如内部收益率(IRR)、净现值(NPV)和投资回收期\n4. 进行敏感性分析，评估不同参数变化对项目经济性的影响\n\n这些分析可以帮助您在项目决策初期就对经济可行性有清晰的认识。"
  };

  // 简单关键词匹配来决定回复内容
  let response = responses.default;
  const messageLower = message.toLowerCase();
  
  if (messageLower.includes('wrf') || messageLower.includes('模型') || messageLower.includes('参数')) {
    response = responses.wrf;
  } else if (messageLower.includes('风') || messageLower.includes('资源') || messageLower.includes('评估')) {
    response = responses.wind;
  } else if (messageLower.includes('经济') || messageLower.includes('收益') || messageLower.includes('投资')) {
    response = responses.economics;
  }

  return {
    role: 'assistant',
    content: response
  };
};

/**
 * 获取模型信息
 * @returns {Object} - 返回模型信息
 */
export const getLingxiModelInfo = () => {
  return {
    name: "灵犀助手",
    model: "Gemini 2.0",
    description: "基于Gemini 2.0的专业WRF和风资源评估助手",
    version: "1.0.0 Beta",
    capabilities: [
      "WRF模型配置指导",
      "风资源评估解析",
      "专业术语解释",
      "经济效益分析辅助"
    ]
  };
}; 