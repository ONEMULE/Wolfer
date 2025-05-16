/**
 * 灵犀助手 - Gemini API 代理服务器
 * 
 * 此服务器作为前端和Gemini API之间的安全代理，负责：
 * 1. 安全管理API密钥
 * 2. 处理API请求
 * 3. 实现流式响应传输
 * 
 * 使用方法：
 * 1. 安装依赖: npm install express cors dotenv @google/generative-ai
 * 2. 创建.env文件并添加: GEMINI_API_KEY=your_api_key
 * 3. 启动服务器: node lingxi_proxy.js
 */

const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 创建Gemini客户端
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Gemini聊天端点 - 流式传输
app.post('/api/claude-chat', async (req, res) => {
  try {
    const { prompt, history } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "提示信息不能为空" });
    }

    // 设置响应为SSE格式
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // 系统提示
    const systemPrompt = `你是沃风平台的智能助手"灵犀"，专门帮助用户理解和使用WRF模型进行风资源评估和经济分析。
作为一名专业的气象和风能领域专家，你的职责是：
1. 解释WRF模型的参数和配置选项，使用通俗易懂的语言帮助非专业用户理解复杂概念
2. 指导用户使用沃风平台的各项功能，包括:
   - WRF模型配置与运行
   - 风资源评估与可视化
   - 基于ABaCAS的经济效益分析
3. 分析和解读模拟结果，提供专业的见解和建议
4. 回答用户关于风电场选址、风资源评估方法等专业问题

请保持专业、友好和耐心的态度，使用简洁明了的语言，避免过于技术性的术语，除非用户明确表示他们有相关背景。`;

    // 准备历史消息格式
    const formattedHistory = [];
    if (history && Array.isArray(history)) {
      history.forEach(msg => {
        const role = msg.role === 'user' ? 'user' : 'model';
        formattedHistory.push({
          role: role,
          parts: [{ text: msg.content }]
        });
      });
    }

    // 初始化Gemini模型
    const model = genAI.getGenerativeModel({
      model: "gemini-pro", 
      systemInstruction: systemPrompt
    });

    // 创建聊天会话
    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        maxOutputTokens: 2048,
      },
    });

    // 发送消息并获取流式响应
    const result = await chat.sendMessageStream(prompt);

    // 处理流式响应
    for await (const chunk of result.stream) {
      const textChunk = chunk.text();
      if (textChunk) {
        res.write(`data: ${JSON.stringify({ textChunk })}\n\n`);
      }
    }

    // 发送完成消息
    res.write(`data: ${JSON.stringify({ isComplete: true })}\n\n`);
    res.end();

  } catch (error) {
    console.error('Gemini API 调用失败:', error);
    
    // 根据请求状态发送错误响应
    if (!res.headersSent) {
      res.status(500).json({ error: '与AI助手通信失败' });
    } else {
      try {
        res.write(`event: error\ndata: ${JSON.stringify({ message: 'AI助手处理时发生错误' })}\n\n`);
      } catch (sseError) {
        console.error('发送SSE错误事件失败:', sseError);
      }
      res.end();
    }
  }
});

// 非流式端点 - 用于简单测试
app.post('/api/claude-chat-simple', async (req, res) => {
  try {
    const { prompt, history } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "提示信息不能为空" });
    }

    // 系统提示同上
    const systemPrompt = `你是沃风平台的智能助手"灵犀"...`; // 同上完整提示

    // 准备历史消息格式
    const formattedHistory = [];
    if (history && Array.isArray(history)) {
      history.forEach(msg => {
        const role = msg.role === 'user' ? 'user' : 'model';
        formattedHistory.push({
          role: role,
          parts: [{ text: msg.content }]
        });
      });
    }

    // 初始化Gemini模型
    const model = genAI.getGenerativeModel({
      model: "gemini-pro", 
      systemInstruction: systemPrompt
    });

    // 创建聊天会话
    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        maxOutputTokens: 2048,
      },
    });

    // 发送消息并获取响应
    const result = await chat.sendMessage(prompt);
    const response = result.response.text();

    // 返回响应
    res.json({
      role: 'assistant',
      content: response
    });
  } catch (error) {
    console.error('Gemini API 调用失败:', error);
    res.status(500).json({ error: '与AI助手通信失败' });
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`灵犀助手代理服务器运行在 http://localhost:${port}`);
}); 