import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DomainForm from "../components/DomainForm";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useToast } from "../components/ui/use-toast";
import { useConfig } from "../context/ConfigContext";

const Domain = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { config: globalConfig, updateConfigSection } = useConfig();
  const [nextDisabled, setNextDisabled] = React.useState(true);

  useEffect(() => {
    const { domain_setup } = globalConfig;
    if (
      domain_setup &&
      domain_setup.e_we_arr && domain_setup.e_we_arr[0] &&
      domain_setup.dx_arr && domain_setup.dx_arr[0] &&
      domain_setup.map_proj
    ) {
      setNextDisabled(false);
    } else {
      setNextDisabled(true);
    }
  }, [globalConfig.domain_setup]);

  const handleSubmit = (domainDataFromForm) => {
    const newDomainSetupData = {
      ...globalConfig.domain_setup,
      max_dom: domainDataFromForm.max_dom,
      map_proj: domainDataFromForm.map_proj,
      e_we_arr: [parseFloat(domainDataFromForm.e_we)],
      e_sn_arr: [parseFloat(domainDataFromForm.e_sn)],
      dx_arr: [parseFloat(domainDataFromForm.dx) * 1000],
      dy_arr: [parseFloat(domainDataFromForm.dy) * 1000],
      ref_lat_arr: [parseFloat(domainDataFromForm.ref_lat)],
      ref_lon_arr: [parseFloat(domainDataFromForm.ref_lon)],
      truelat1_arr: [parseFloat(domainDataFromForm.truelat1)],
      truelat2_arr: [parseFloat(domainDataFromForm.truelat2)],
      stand_lon_arr: [parseFloat(domainDataFromForm.stand_lon)],
      parent_id_arr: globalConfig.domain_setup.parent_id_arr || [0],
      parent_grid_ratio_arr: globalConfig.domain_setup.parent_grid_ratio_arr || [1],
      i_parent_start_arr: globalConfig.domain_setup.i_parent_start_arr || [1],
      j_parent_start_arr: globalConfig.domain_setup.j_parent_start_arr || [1],
    };

    updateConfigSection('domain_setup', newDomainSetupData);
    
    toast({
      title: "域设置已保存至全局配置",
      description: "您可以继续下一步配置或返回修改。",
      variant: "default",
    });
  };

  const handleBack = () => {
    navigate("/time");
  };

  const handleNext = () => {
    navigate("/physics");
  };

  const getDomainFormDefaults = () => {
    const { domain_setup } = globalConfig;
    if (!domain_setup) return {};

    return {
      e_we: domain_setup.e_we_arr ? domain_setup.e_we_arr[0] : 100,
      e_sn: domain_setup.e_sn_arr ? domain_setup.e_sn_arr[0] : 100,
      dx: domain_setup.dx_arr ? domain_setup.dx_arr[0] / 1000 : 30,
      dy: domain_setup.dy_arr ? domain_setup.dy_arr[0] / 1000 : 30,
      ref_lat: domain_setup.ref_lat_arr ? domain_setup.ref_lat_arr[0] : 34.0,
      ref_lon: domain_setup.ref_lon_arr ? domain_setup.ref_lon_arr[0] : 118.0,
      truelat1: domain_setup.truelat1_arr ? domain_setup.truelat1_arr[0] : 30.0,
      truelat2: domain_setup.truelat2_arr ? domain_setup.truelat2_arr[0] : 60.0,
      stand_lon: domain_setup.stand_lon_arr ? domain_setup.stand_lon_arr[0] : 118.0,
      max_dom: domain_setup.max_dom || 1,
      map_proj: domain_setup.map_proj || "lambert",
    };
  };
  
  const currentDomainConfig = globalConfig.domain_setup;

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
            <DomainForm 
              onSubmit={handleSubmit} 
              defaultValues={getDomainFormDefaults()} 
            />
            
            <div className="flex justify-between mt-6">
              <Button 
                variant="outline" 
                onClick={handleBack}
                className="transition-all hover:bg-gray-100 active:scale-95"
              >
                返回：时间设置
              </Button>
              <Button 
                onClick={handleNext} 
                disabled={nextDisabled}
                className={`transition-all ${!nextDisabled && 'hover:brightness-105 active:scale-95'}`}
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
            
            {currentDomainConfig && (
              <Card className="p-6 mt-6 mb-12">
                <h2 className="text-xl font-semibold mb-4">当前配置 (来自全局状态)</h2>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">网格尺寸:</span> {currentDomainConfig.e_we_arr ? currentDomainConfig.e_we_arr[0] : 'N/A'} x {currentDomainConfig.e_sn_arr ? currentDomainConfig.e_sn_arr[0] : 'N/A'}</p>
                  <p><span className="font-medium">网格间距:</span> {currentDomainConfig.dx_arr ? currentDomainConfig.dx_arr[0]/1000 : 'N/A'} km x {currentDomainConfig.dy_arr ? currentDomainConfig.dy_arr[0]/1000 : 'N/A'} km</p>
                  <p><span className="font-medium">中心位置:</span> {currentDomainConfig.ref_lat_arr ? currentDomainConfig.ref_lat_arr[0] : 'N/A'}°N, {currentDomainConfig.ref_lon_arr ? currentDomainConfig.ref_lon_arr[0] : 'N/A'}°E</p>
                  <p>
                    <span className="font-medium">投影方式:</span> {
                      {
                        'lambert': 'Lambert Conformal',
                        'polar': 'Polar Stereographic',
                        'mercator': 'Mercator',
                        'lat-lon': 'Lat-Lon'
                      }[currentDomainConfig.map_proj] || currentDomainConfig.map_proj || 'N/A'
                    }
                  </p>
                  <p><span className="font-medium">域数量:</span> {currentDomainConfig.max_dom || 'N/A'}</p>
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