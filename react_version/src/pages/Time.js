import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TimeForm from "../components/TimeForm";
import { Button } from "../components/ui/button";
import { useToast } from "../components/ui/use-toast";
import { DEFAULT_CONFIG } from "../utils/constants";

const Time = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  
  useEffect(() => {
    // 加载整体配置
    const savedConfig = localStorage.getItem("wrf_config");
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error("Error parsing saved configuration:", error);
      }
    }
    setLoading(false);
  }, []);

  const handleSubmit = (timeData) => {
    // 更新整体配置中的时间和数据源设置
    const updatedConfig = {
      ...config,
      start_date: timeData.start_date,
      end_date: timeData.end_date,
      data_source: timeData.data_source
    };
    
    // 保存更新后的整体配置
    localStorage.setItem("wrf_config", JSON.stringify(updatedConfig));
    setConfig(updatedConfig);
    
    // 显示成功提示
    toast({
      title: "时间设置已保存",
      description: "您可以继续下一步配置",
      variant: "default",
    });
  };

  const handleNext = () => {
    navigate("/domain");
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center">
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="mb-2">
          <h1 className="text-3xl font-bold mb-2">时间配置</h1>
          <p className="text-muted-foreground">
            设置WRF模拟的时间范围和数据源
          </p>
        </div>
        
        <TimeForm 
          onSubmit={handleSubmit} 
          defaultValues={{
            start_date: config.start_date,
            end_date: config.end_date,
            data_source: config.data_source
          }} 
        />
        
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => navigate("/")}>
            返回首页
          </Button>
          <Button 
            onClick={handleNext} 
            disabled={!config.start_date || !config.end_date || !config.data_source}
          >
            下一步：区域设置
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Time; 