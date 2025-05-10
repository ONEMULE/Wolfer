import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { InfoIcon, RefreshCwIcon } from "lucide-react";
import { useConfig } from "../context/ConfigContext";
import { PHYSICS_OPTIONS, DYNAMICS_OPTIONS, PROJECTIONS, DATA_SOURCES } from "../utils/constants";

// Helper function to safely access array elements for display
const getDisplayValue = (arr, index = 0, fallback = "未设置") => {
  return arr && arr.length > index && arr[index] !== undefined && arr[index] !== null 
         ? arr[index].toString() 
         : fallback;
};

const getBooleanDisplayValue = (arr, index = 0, trueText = "开启", falseText = "关闭", fallback = "未设置") => {
  if (arr && arr.length > index && arr[index] !== undefined && arr[index] !== null) {
    return arr[index] ? trueText : falseText;
  }
  return fallback;
};

const Review = () => {
  const navigate = useNavigate();
  const { config: globalConfig, loadConfig: reloadConfigFromLocalStorage } = useConfig();

  const handleGenerate = () => {
    navigate("/output");
  };

  const handlePreviousStep = () => {
    navigate("/dynamics");
  };
  
  const handleReloadConfig = () => {
    reloadConfigFromLocalStorage();
  };

  if (!globalConfig || Object.keys(globalConfig).length === 1 && globalConfig._lastUpdated) {
    return (
      <div className="container mx-auto py-8 px-4 flex flex-col items-center">
        <p className="mb-4">配置似乎尚未从Context加载或不完整。</p>
        <Button onClick={handleReloadConfig} variant="outline">
          <RefreshCwIcon className="mr-2 h-4 w-4" /> 尝试重新加载配置
        </Button>
      </div>
    );
  }

  const isConfigComplete = 
    globalConfig.time_control && 
    globalConfig.time_control.start_date_str_arr && globalConfig.time_control.start_date_str_arr[0] &&
    globalConfig.domain_setup && 
    globalConfig.domain_setup.e_we_arr && globalConfig.domain_setup.e_we_arr[0] !== undefined &&
    globalConfig.physics && 
    globalConfig.physics.mp_physics_arr && globalConfig.physics.mp_physics_arr[0] !== undefined &&
    globalConfig.dynamics &&
    globalConfig.dynamics.diff_opt_arr && globalConfig.dynamics.diff_opt_arr[0] !== undefined;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col items-center">
        <div className="w-full max-w-4xl mb-8">
          <div className="flex items-center justify-between mb-6 pt-6">
            <h1 className="text-3xl font-bold">配置审核</h1>
            <div className="flex gap-4">
              <Button variant="outline" onClick={handlePreviousStep}>
                返回
              </Button>
            </div>
          </div>
          
          {!isConfigComplete && (
            <Alert className="mb-6 border-orange-200 bg-orange-50">
              <InfoIcon className="h-5 w-5 text-orange-500" />
              <AlertTitle className="text-orange-700">配置可能不完整</AlertTitle>
              <AlertDescription className="text-orange-700">
                请确保所有步骤的配置都已正确保存。部分关键设置似乎缺失。
              </AlertDescription>
            </Alert>
          )}
          
          <Card className="w-full p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">时间设置</h2>
            {globalConfig.time_control ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">开始时间</p>
                  <p>{getDisplayValue(globalConfig.time_control.start_date_str_arr)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">结束时间</p>
                  <p>{getDisplayValue(globalConfig.time_control.end_date_str_arr)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">数据源</p>
                  <p>{globalConfig.time_control.data_source ? DATA_SOURCES[globalConfig.time_control.data_source] : "未设置"}</p>
                </div>
              </div>
            ) : <p className="text-muted-foreground">时间设置未加载</p>}
          </Card>
          
          <Card className="w-full p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">域设置</h2>
            {globalConfig.domain_setup ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">投影方式</p>
                  <p>{PROJECTIONS[getDisplayValue(globalConfig.domain_setup.map_proj_arr)] || "未设置"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">域数量</p>
                  <p>{getDisplayValue(globalConfig.domain_setup.max_dom_arr)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">网格点数 (E-W)</p>
                  <p>{getDisplayValue(globalConfig.domain_setup.e_we_arr)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">网格点数 (N-S)</p>
                  <p>{getDisplayValue(globalConfig.domain_setup.e_sn_arr)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">网格间距 DX (km)</p>
                  <p>{getDisplayValue(globalConfig.domain_setup.dx_arr)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">网格间距 DY (km)</p>
                  <p>{getDisplayValue(globalConfig.domain_setup.dy_arr)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">参考纬度 (°)</p>
                  <p>{getDisplayValue(globalConfig.domain_setup.ref_lat_arr)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">参考经度 (°)</p>
                  <p>{getDisplayValue(globalConfig.domain_setup.ref_lon_arr)}</p>
                </div>
                 <div>
                  <p className="text-sm font-medium text-gray-500">第一标准纬度 (°)</p>
                  <p>{getDisplayValue(globalConfig.domain_setup.truelat1_arr)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">第二标准纬度 (°)</p>
                  <p>{getDisplayValue(globalConfig.domain_setup.truelat2_arr)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">标准经度 (°)</p>
                  <p>{getDisplayValue(globalConfig.domain_setup.stand_lon_arr)}</p>
                </div>
              </div>
            ) : <p className="text-muted-foreground">域设置未加载</p>}
          </Card>
          
          <Card className="w-full p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">物理参数化方案</h2>
            {globalConfig.physics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(PHYSICS_OPTIONS).map(key => {
                  const arrKey = `${key}_arr`;
                  const value = getDisplayValue(globalConfig.physics[arrKey]);
                  const label = PHYSICS_OPTIONS[key][value] || value;
                  const readableKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                  return (
                    <div key={arrKey}>
                      <p className="text-sm font-medium text-gray-500">{readableKey}</p>
                      <p>{label}</p>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-muted-foreground">物理参数未加载</p>}
          </Card>
          
          <Card className="w-full p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">动力学设置</h2>
            {globalConfig.dynamics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(DYNAMICS_OPTIONS).map(key => {
                  const arrKey = `${key}_arr`;
                  const value = getDisplayValue(globalConfig.dynamics[arrKey]);
                  const label = DYNAMICS_OPTIONS[key][value] || value;
                  const readableKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                  return (
                    <div key={arrKey}>
                      <p className="text-sm font-medium text-gray-500">{readableKey}</p>
                      <p>{label}</p>
                    </div>
                  );
                })}
                <div>
                  <p className="text-sm font-medium text-gray-500">Non Hydrostatic</p>
                  <p>{getBooleanDisplayValue(globalConfig.dynamics.non_hydrostatic_arr)}</p>
                </div>
              </div>
            ) : <p className="text-muted-foreground">动力学设置未加载</p>}
          </Card>
          
          <div className="flex justify-end">
            <Button 
              onClick={handleGenerate}
              disabled={!isConfigComplete}
              size="lg"
            >
              生成Namelist文件
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Review; 