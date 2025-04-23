import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { InfoIcon } from "lucide-react";
import { useToast } from "../components/ui/use-toast";
import { DEFAULT_CONFIG, PHYSICS_OPTIONS, DYNAMICS_OPTIONS, PROJECTIONS, DATA_SOURCES } from "../utils/constants";

const Review = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  
  useEffect(() => {
    const loadConfig = () => {
      setLoading(true);
      const savedConfig = localStorage.getItem("wrf_config");
      if (savedConfig) {
        try {
          setConfig(JSON.parse(savedConfig));
          setError(null);
        } catch (error) {
          console.error("Error parsing saved configuration:", error);
          setError("配置加载失败，请检查是否已完成所有设置步骤");
          toast({
            title: "配置加载错误",
            description: "无法加载保存的配置，请返回重新配置",
            variant: "destructive",
          });
        }
      } else {
        setError("未找到保存的配置，请完成所有设置步骤");
      }
      setLoading(false);
    };

    loadConfig();
  }, [toast]);

  const handleGenerate = () => {
    // 在这里添加生成namelist文件的代码
    toast({
      title: "配置文件生成功能",
      description: "将在后续版本中实现",
      variant: "default",
    });
  };

  const handlePreviousStep = () => {
    navigate("/dynamics");
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center">
        <p>加载配置中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertTitle>配置错误</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={() => navigate("/")}>
              返回主页
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 检查配置是否完整
  const isConfigComplete = 
    config.start_date && 
    config.end_date && 
    config.domain && 
    config.physics && 
    config.dynamics;

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
              <AlertTitle className="text-orange-700">配置不完整</AlertTitle>
              <AlertDescription className="text-orange-700">
                请完成所有配置步骤以确保生成准确的namelist文件。
              </AlertDescription>
            </Alert>
          )}
          
          <Card className="w-full p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">时间设置</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">开始时间</p>
                <p>{config.start_date || "未设置"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">结束时间</p>
                <p>{config.end_date || "未设置"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">数据源</p>
                <p>{config.data_source ? DATA_SOURCES[config.data_source] : "未设置"}</p>
              </div>
            </div>
          </Card>
          
          <Card className="w-full p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">域设置</h2>
            {config.domain ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">投影方式</p>
                  <p>{PROJECTIONS[config.projection]}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">域数量</p>
                  <p>{config.domain.max_dom}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">网格点数 (E-W)</p>
                  <p>{config.domain.e_we}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">网格点数 (N-S)</p>
                  <p>{config.domain.e_sn}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">网格间距 DX (km)</p>
                  <p>{config.domain.dx}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">网格间距 DY (km)</p>
                  <p>{config.domain.dy}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">中心纬度</p>
                  <p>{config.domain.ref_lat}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">中心经度</p>
                  <p>{config.domain.ref_lon}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">未完成域设置</p>
            )}
          </Card>
          
          <Card className="w-full p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">物理参数化方案</h2>
            {config.physics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">微物理方案</p>
                  <p>{PHYSICS_OPTIONS.mp_physics[config.physics.mp_physics]}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">积云方案</p>
                  <p>{PHYSICS_OPTIONS.cu_physics[config.physics.cu_physics]}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">长波辐射方案</p>
                  <p>{PHYSICS_OPTIONS.ra_lw_physics[config.physics.ra_lw_physics]}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">短波辐射方案</p>
                  <p>{PHYSICS_OPTIONS.ra_sw_physics[config.physics.ra_sw_physics]}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">地表层方案</p>
                  <p>{PHYSICS_OPTIONS.sf_surface_physics[config.physics.sf_surface_physics]}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">边界层方案</p>
                  <p>{PHYSICS_OPTIONS.bl_pbl_physics[config.physics.bl_pbl_physics]}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">未完成物理参数设置</p>
            )}
          </Card>
          
          <Card className="w-full p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">动力学设置</h2>
            {config.dynamics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">扩散选项</p>
                  <p>{DYNAMICS_OPTIONS.diff_opt[config.dynamics.diff_opt]}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">湍流系数选项</p>
                  <p>{DYNAMICS_OPTIONS.km_opt[config.dynamics.km_opt]}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">非静力学模式</p>
                  <p>{config.dynamics.non_hydrostatic ? "开启" : "关闭"}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">未完成动力学设置</p>
            )}
          </Card>
          
          <div className="flex justify-end">
            <Button 
              onClick={handleGenerate}
              disabled={!isConfigComplete}
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