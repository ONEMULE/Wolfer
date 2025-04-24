import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DomainForm from "../components/DomainForm";
import { Card } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { InfoIcon } from "lucide-react";
import { useToast } from "../components/ui/use-toast";
import { PROJECTIONS, DEFAULT_CONFIG } from "../utils/constants";

const Domain = () => {
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

  const handleSubmit = (domainData) => {
    // 更新整体配置中的domain部分
    const updatedConfig = {
      ...config,
      domain: domainData,
      projection: parseInt(domainData.map_proj === 'lambert' ? 1 : 
                           domainData.map_proj === 'polar' ? 2 : 
                           domainData.map_proj === 'mercator' ? 3 : 6)
    };
    
    // 保存更新后的整体配置
    localStorage.setItem("wrf_config", JSON.stringify(updatedConfig));
    setConfig(updatedConfig);
    
    // 显示成功提示
    toast({
      title: "域设置已保存",
      description: "您可以继续下一步配置",
      variant: "default",
    });
  };

  const handleBack = () => {
    navigate("/time");
  };

  const handleNext = () => {
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
    <div className="container mx-auto py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 pt-6">
          <h1 className="text-3xl font-bold mb-2">WRF域设置</h1>
          <p className="text-muted-foreground">
            配置模拟区域的空间特性，包括分辨率、投影和嵌套域
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <DomainForm onSubmit={handleSubmit} defaultValues={config.domain} />
            
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={handleBack}>
                返回：时间设置
              </Button>
              <Button 
                onClick={handleNext} 
                disabled={!config.domain}
              >
                下一步：物理参数设置
              </Button>
            </div>
          </div>
          
          <div>
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">域设置帮助</h2>
              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="font-medium">网格尺寸 (E_WE & E_SN)</h3>
                  <p className="text-muted-foreground">
                    这些值定义了模型域中的网格点数量。更高的值会增加计算需求。
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">网格间距 (DX & DY)</h3>
                  <p className="text-muted-foreground">
                    定义了网格点之间的距离，单位为千米。较小的值会产生更高分辨率的模拟，但增加计算成本。
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">参考经纬度</h3>
                  <p className="text-muted-foreground">
                    域中心的地理坐标。
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">地图投影</h3>
                  <p className="text-muted-foreground">
                    不同的投影适用于不同的地理区域：
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Lambert：适用于中纬度区域</li>
                    <li>Polar：适用于极地区域</li>
                    <li>Mercator：适用于热带和赤道区域</li>
                    <li>Lat-Lon：适用于全球范围</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium">最大域数量</h3>
                  <p className="text-muted-foreground">
                    嵌套域的数量。增加域可以在重点区域提供更高分辨率。
                  </p>
                </div>
              </div>
            </Card>
            
            {config.domain && (
              <Card className="p-6 mt-6 mb-12">
                <h2 className="text-xl font-semibold mb-4">当前配置</h2>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">网格尺寸:</span> {config.domain.e_we} x {config.domain.e_sn}</p>
                  <p><span className="font-medium">网格间距:</span> {config.domain.dx} km x {config.domain.dy} km</p>
                  <p><span className="font-medium">中心位置:</span> {config.domain.ref_lat}°N, {config.domain.ref_lon}°E</p>
                  <p>
                    <span className="font-medium">投影方式:</span> {
                      {
                        'lambert': 'Lambert Conformal',
                        'polar': 'Polar Stereographic',
                        'mercator': 'Mercator',
                        'lat-lon': 'Lat-Lon'
                      }[config.domain.map_proj] || config.domain.map_proj
                    }
                  </p>
                  <p><span className="font-medium">域数量:</span> {config.domain.max_dom}</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Domain; 