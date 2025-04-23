import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DynamicsForm from "../components/DynamicsForm";
import { DEFAULT_CONFIG } from "../utils/constants";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { InfoIcon } from "lucide-react";
import { useToast } from "../components/ui/use-toast";

const Dynamics = () => {
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

  const handleSubmit = (dynamicsData) => {
    // 更新整体配置中的dynamics部分
    const updatedConfig = {
      ...config,
      dynamics: dynamicsData
    };
    
    // 保存更新后的整体配置
    localStorage.setItem("wrf_config", JSON.stringify(updatedConfig));
    setConfig(updatedConfig);
    
    // 显示成功提示
    toast({
      title: "动力学参数已保存",
      description: "您可以继续下一步配置",
      variant: "default",
    });
  };

  const handleNext = () => {
    navigate("/review");
  };

  const handleBack = () => {
    navigate("/physics");
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
          <h1 className="text-3xl font-bold mb-2">动力学配置</h1>
          <p className="text-muted-foreground">
            配置WRF模型的动力学核心设置，影响模拟的稳定性和精度
          </p>
        </div>
        
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <div className="flex items-start">
            <InfoIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
            <AlertDescription className="text-blue-700">
              动力学设置控制WRF模型的数值求解方法。选择合适的动力学选项对高分辨率模拟尤为重要，
              可以显著影响模拟结果的稳定性和准确性。
            </AlertDescription>
          </div>
        </Alert>
        
        <DynamicsForm 
          onSubmit={handleSubmit}
          defaultValues={config.dynamics}
        />
        
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={handleBack}>
            返回：物理参数
          </Button>
          <Button 
            onClick={handleNext} 
            disabled={!config.dynamics}
          >
            下一步：配置审核
          </Button>
        </div>
        
        <div className="mt-4 text-sm text-gray-500">
          <h3 className="font-medium text-gray-700 mb-2">参数说明：</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><span className="font-medium">diff_opt</span> - 扩散选项，控制模型中的水平和垂直扩散计算方法</li>
            <li><span className="font-medium">km_opt</span> - 湍流系数选项，确定湍流混合强度的计算方式</li>
            <li><span className="font-medium">non_hydrostatic</span> - 非静力学选项，对于高分辨率模拟（小于10km）建议开启</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dynamics; 