import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';

const WrfConfig = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 pt-6">
          <h1 className="text-3xl font-bold mb-2">WRF配置</h1>
          <p className="text-muted-foreground">
            配置和生成WRF模拟所需的namelist文件
          </p>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">配置步骤</h2>
          <div className="space-y-4">
            <div className="flex items-center p-3 border rounded-md hover:bg-accent/5 transition-colors">
              <div className="flex-shrink-0 bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center mr-4">
                <span className="text-primary font-medium">1</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium">时间设置</h3>
                <p className="text-sm text-muted-foreground">配置模拟的开始和结束时间</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/time')}>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center p-3 border rounded-md hover:bg-accent/5 transition-colors">
              <div className="flex-shrink-0 bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center mr-4">
                <span className="text-primary font-medium">2</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium">域设置</h3>
                <p className="text-sm text-muted-foreground">配置模拟区域和空间分辨率</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/domain')}>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center p-3 border rounded-md hover:bg-accent/5 transition-colors">
              <div className="flex-shrink-0 bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center mr-4">
                <span className="text-primary font-medium">3</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium">物理参数</h3>
                <p className="text-sm text-muted-foreground">选择适合您研究的物理参数化方案</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/physics')}>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center p-3 border rounded-md hover:bg-accent/5 transition-colors">
              <div className="flex-shrink-0 bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center mr-4">
                <span className="text-primary font-medium">4</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium">动力学设置</h3>
                <p className="text-sm text-muted-foreground">配置模型的动力学和数值选项</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/dynamics')}>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center p-3 border rounded-md hover:bg-accent/5 transition-colors">
              <div className="flex-shrink-0 bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center mr-4">
                <span className="text-primary font-medium">5</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium">配置审核</h3>
                <p className="text-sm text-muted-foreground">审核所有配置选项</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/review')}>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center p-3 border rounded-md hover:bg-accent/5 transition-colors">
              <div className="flex-shrink-0 bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center mr-4">
                <span className="text-primary font-medium">6</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium">输出生成</h3>
                <p className="text-sm text-muted-foreground">生成namelist.wps和namelist.input文件</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/output')}>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WrfConfig; 