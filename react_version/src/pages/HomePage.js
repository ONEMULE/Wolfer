import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* 背景装饰 */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(var(--accent-rgb),0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_right,rgba(var(--primary-rgb),0.05),transparent_50%)]"></div>
      
      <main className="container flex flex-col items-center justify-center min-h-screen py-20 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gradient animate-fadeIn">
          WRF 模型配置工具
        </h1>
        <p className="mt-6 text-xl md:text-2xl text-muted-foreground max-w-2xl animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          简化您的大气模拟配置，提供直观的界面构建 WRF 模型设置
        </p>
        
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl w-full animate-fadeIn" style={{ animationDelay: '0.4s' }}>
          {/* 时间配置卡片 */}
          <FeatureCard 
            title="时间设置" 
            description="设置模拟的开始和结束时间，以及时间步长和输出间隔。"
            icon="⏱️"
            onClick={() => navigate('/time')}
          />
          
          {/* 区域配置卡片 */}
          <FeatureCard 
            title="区域设置" 
            description="配置模拟区域范围、空间分辨率和网格嵌套。"
            icon="🌍"
            onClick={() => navigate('/domain')}
          />
          
          {/* 物理配置卡片 */}
          <FeatureCard 
            title="物理参数化" 
            description="选择适合您模拟的物理方案组合。"
            icon="⚛️"
            onClick={() => navigate('/physics')}
          />
          
          {/* 动力学配置卡片 */}
          <FeatureCard 
            title="动力学设置" 
            description="配置模型的动力学选项和数值方法。"
            icon="🔄"
            onClick={() => navigate('/dynamics')}
          />
        </div>
        
        <button 
          onClick={() => navigate('/time')} 
          className="mt-16 group btn-accent px-8 py-4 text-lg rounded-full animate-fadeIn animate-float hover:shadow-lg hover:translate-y-0" 
          style={{ animationDelay: '0.6s' }}
        >
          开始配置
          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
        </button>
      </main>
    </div>
  );
}

// 特性卡片组件
function FeatureCard({ title, description, icon, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="glass-card p-6 flex flex-col items-center text-center rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}

export default HomePage; 