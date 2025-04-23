import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PhysicsForm from "../components/PhysicsForm";
import { Alert, AlertDescription } from "../components/ui/alert";
import { InfoIcon } from "lucide-react";
import { Button } from "../components/ui/button";
import { useToast } from "../components/ui/use-toast";
import { DEFAULT_CONFIG } from "../utils/constants";

const Physics = () => {
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

  const handlePhysicsSubmit = (physicsData) => {
    // 更新整体配置中的physics部分
    const updatedConfig = {
      ...config,
      physics: physicsData
    };
    
    // 保存更新后的整体配置
    localStorage.setItem("wrf_config", JSON.stringify(updatedConfig));
    setConfig(updatedConfig);
    
    // 显示成功提示
    toast({
      title: "物理参数已保存",
      description: "您可以继续下一步配置",
      variant: "default",
    });
  };

  const handleNext = () => {
    navigate("/dynamics");
  };

  const handleBack = () => {
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
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="mb-2 pt-6">
          <h1 className="text-3xl font-bold mb-2">物理参数设置</h1>
          <p className="text-muted-foreground">
            选择适合您研究目标的物理参数化方案以提高模拟结果的准确性
          </p>
        </div>
        
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <div className="flex items-start">
            <InfoIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
            <AlertDescription className="text-blue-700">
              物理参数设置决定了WRF如何模拟大气中的各种物理过程，包括辐射、微物理、地表过程、边界层和积云对流等。
              选择适合您研究目标的物理参数化方案可以提高模拟结果的准确性。
            </AlertDescription>
          </div>
        </Alert>
        
        <PhysicsForm onSubmit={handlePhysicsSubmit} defaultValues={config.physics} />
        
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={handleBack}>
            返回：区域设置
          </Button>
          <Button 
            onClick={handleNext} 
            disabled={!config.physics}
          >
            下一步：动力学设置
          </Button>
        </div>
        
        <div className="mt-4 text-sm text-gray-500">
          <h3 className="font-medium text-gray-700 mb-2">参数说明：</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><span className="font-medium">mp_physics</span> - 微物理方案，控制大气中水汽、云和降水过程的模拟</li>
            <li><span className="font-medium">ra_lw_physics</span> - 长波辐射方案，处理热辐射从地球向太空的传输</li>
            <li><span className="font-medium">ra_sw_physics</span> - 短波辐射方案，处理太阳辐射在大气中的传输和吸收</li>
            <li><span className="font-medium">sf_surface_physics</span> - 地表物理方案，模拟地表与大气之间的热量和水分交换</li>
            <li><span className="font-medium">bl_pbl_physics</span> - 边界层参数化方案，模拟近地面大气层的湍流混合</li>
            <li><span className="font-medium">cu_physics</span> - 积云参数化方案，模拟对流云的形成和发展</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Physics; 