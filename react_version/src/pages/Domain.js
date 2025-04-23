import React, { useState } from "react";
import DomainForm from "../components/DomainForm";
import { Card } from "../components/ui/card";
import { Alert } from "../components/ui/alert";
import { PROJECTIONS } from "../utils/constants";

const Domain = () => {
  const [formConfig, setFormConfig] = useState(null);
  const [configSaved, setConfigSaved] = useState(false);

  const handleSubmit = (values) => {
    // 在实际应用中，这里会发送数据到API或存储到状态管理系统中
    console.log("Domain configuration saved:", values);
    setFormConfig(values);
    setConfigSaved(true);
    
    // 几秒后清除提示
    setTimeout(() => {
      setConfigSaved(false);
    }, 3000);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">WRF域设置</h1>
      
      {configSaved && (
        <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
          域设置已保存成功！
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <DomainForm onSubmit={handleSubmit} />
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
          
          {formConfig && (
            <Card className="p-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">当前配置</h2>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">网格尺寸:</span> {formConfig.e_we} x {formConfig.e_sn}</p>
                <p><span className="font-medium">网格间距:</span> {formConfig.dx} km x {formConfig.dy} km</p>
                <p><span className="font-medium">中心位置:</span> {formConfig.ref_lat}°N, {formConfig.ref_lon}°E</p>
                <p>
                  <span className="font-medium">投影方式:</span> {
                    {
                      'lambert': 'Lambert Conformal',
                      'polar': 'Polar Stereographic',
                      'mercator': 'Mercator',
                      'lat-lon': 'Lat-Lon'
                    }[formConfig.map_proj]
                  }
                </p>
                <p><span className="font-medium">域数量:</span> {formConfig.max_dom}</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Domain; 