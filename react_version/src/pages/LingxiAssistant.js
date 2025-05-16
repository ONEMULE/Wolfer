import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { sendMessageToLingxi, getLingxiModelInfo } from '../api/lingxiApi';

// 聊天消息类型
const MessageType = {
  user: 'user',
  assistant: 'assistant'
};

// 预设的聊天记录
const initialMessages = [
  {
    role: 'user',
    content: "灵犀你好，我想评估一下我所在城市周边区域的风资源潜力，为建设小型风力发电项目做初步调研。我对WRF模型的具体参数不是很熟悉，沃风平台能怎么帮我呢？"
  },
  {
    role: 'assistant',
    content: "您好！很高兴为您进行风资源潜力评估提供支持。沃风平台的核心目标之一就是简化WRF这类专业模型的使用，您不需要担心复杂的参数配置。\n\n要开始评估，请您按照以下步骤操作：\n\n1. 请在平台前端的'WRF模拟设置区'创建一个新的模拟项目。\n2. 定义模拟区域与分辨率： 您可以通过我们提供的地图工具交互式地选择您城市周边的评估范围，或者输入精确的经纬度坐标。平台会根据您的选择推荐合理的模拟分辨率，例如，对于局地风资源评估，可能会建议使用几公里级别的分辨率。\n3. 设定模拟时段： 选择您希望评估的时间段，比如最近一年或者某个代表性的季节。\n4. 物理参数方案： 对于风资源评估，平台会自动为您预设或推荐一组经过优化的物理参数组合。例如，边界层方案（bl_pbl_physics）可能会选用YSU方案，陆面过程方案（sf_surface_physics）可能会选用Noah LSM，这些方案在风场模拟中通常有较好的表现。您在界面上只会看到非常简化的选项。\n\n平台后端的自动化脚本会根据您的这些简单输入，自动生成WRF所需的复杂namelist.input文件，并控制整个模拟流程，包括WPS预处理、real.exe初始化和wrf.exe主模型运算。您只需点击'运行'即可。"
  },
  {
    role: 'user',
    content: "听起来确实方便多了！那模拟运行完成后，我能得到哪些关于风资源的结果呢？手册里提到的'自动化风场建设辅助决策'具体是什么意思？"
  },
  {
    role: 'assistant',
    content: "模拟成功运行后，在'结果可视化区'，平台会自动处理WRF的输出数据（通常是NetCDF格式的wrfout文件），并为您展示一系列风资源分析结果，可能包括：\n\n1. 平均风速和风功率密度图： 在您关心的典型轮毂高度（如70米、100米、120米）上，显示风速和风功率密度的空间分布图。\n2. 风向玫瑰图和风能频率分布： 展示各方向风的频率及对应风能的大小。\n3. 湍流强度图： 评估区域内的湍流情况，这对风机安全和效率很重要。\n4. 风切变指数： 反映风速随高度的变化情况。\n\n至于'自动化风场建设辅助决策'，这是指我们后端内置的Python分析脚本，会根据上述WRF模拟出的高精度风场数据，结合一些预设的评估标准（例如：最小年平均风速阈值、最大允许湍流强度、排除不适宜的地形坡度或土地利用类型等），进行初步的智能分析：\n\n• 高亮潜力区域： 在地图上标出风能资源丰富、湍流适中、建设条件相对较好的潜在区域。\n• 提供初步建议： 可能会给出关于这些区域开发潜力的文字性总结，或者提示某些区域可能存在的特定风险。\n\n这些分析结果和建议旨在为您提供快速的项目前期筛选和初步判断依据，帮助您缩小重点勘察范围。当然，最终的风电场选址决策还需要结合更详细的实地勘测、经济效益分析和环境评估。"
  }
];

const LingxiAssistant = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modelInfo, setModelInfo] = useState(null);
  const messagesEndRef = useRef(null);

  // 获取模型信息
  useEffect(() => {
    setModelInfo(getLingxiModelInfo());
  }, []);

  // 自动滚动到底部
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // 处理发送信息
  const handleSendMessage = async () => {
    if (inputValue.trim() && !isLoading) {
      // 添加用户消息
      const userMessage = { role: 'user', content: inputValue };
      setMessages(prev => [...prev, userMessage]);
      
      // 清空输入框
      setInputValue('');
      
      // 设置加载状态
      setIsLoading(true);
      
      try {
        // 调用API获取回复
        const history = messages.slice(-6); // 只发送最近的几条消息作为上下文
        const assistantResponse = await sendMessageToLingxi(inputValue, history);
        
        // 添加助手回复
        setMessages(prev => [...prev, assistantResponse]);
      } catch (error) {
        console.error("与灵犀助手通信失败:", error);
        // 添加错误消息
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "很抱歉，我在处理您的请求时遇到了问题。请稍后再试。" 
        }]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 处理按键事件（按Enter发送）
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="container mx-auto py-4">
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden flex flex-col" style={{height: "calc(100vh - 150px)"}}>
        {/* 顶部标题栏 */}
        <header className="bg-muted/30 p-4 border-b border-border flex items-center">
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground mr-3 flex items-center justify-center">
            <span className="font-bold">灵</span>
          </div>
          <h1 className="text-lg font-semibold">灵犀助手</h1>
          <div className="ml-2 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">Beta</div>
          
          {modelInfo && (
            <div className="ml-auto text-xs text-muted-foreground">
              {modelInfo.model} · {modelInfo.version}
            </div>
          )}
        </header>

        {/* 聊天内容区域 */}
        <div className="flex-1 overflow-auto p-4 bg-background/50">
          <div className="max-w-3xl mx-auto">
            {messages.map((message, index) => (
              <div 
                key={index}
                className={`mb-4 ${message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}`}
              >
                <div 
                  className={`rounded-lg p-3 max-w-md ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-card shadow-sm border border-border'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center mb-1">
                      <span className="font-bold text-sm text-muted-foreground">灵犀 (沃风平台AI)</span>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">
                    {message.content.split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < message.content.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            
            {/* 加载指示器 */}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-card shadow-sm border border-border rounded-lg p-3">
                  <div className="flex items-center mb-1">
                    <span className="font-bold text-sm text-muted-foreground">灵犀 (沃风平台AI)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* 输入区域 */}
        <div className="bg-muted/20 p-4 border-t border-border">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center bg-background rounded-lg px-3 py-2 border border-input">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="发送消息给灵犀助手..."
                className="flex-1 bg-transparent outline-none resize-none max-h-24"
                rows={1}
                disabled={isLoading}
              />
              <button 
                onClick={handleSendMessage}
                className="ml-2 p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                disabled={!inputValue.trim() || isLoading}
              >
                <Send size={18} />
              </button>
            </div>
            <div className="text-xs text-muted-foreground mt-1 text-center">
              灵犀助手由沃风平台提供，基于Google的Gemini 2.0模型。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LingxiAssistant; 