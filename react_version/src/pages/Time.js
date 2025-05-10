import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TimeForm from "../components/TimeForm";
import { Button } from "../components/ui/button";
import { useToast } from "../components/ui/use-toast";
import { useConfig } from "../context/ConfigContext";

const Time = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { config: globalConfig, updateConfigSection } = useConfig();

  const handleSubmit = (timeDataFromForm) => {
    const updatedTimeControl = {
      ...globalConfig.time_control,
      start_date_str_arr: [timeDataFromForm.start_date],
      end_date_str_arr: [timeDataFromForm.end_date],
      data_source: timeDataFromForm.data_source,
    };
    
    updateConfigSection('time_control', updatedTimeControl);
    
    toast({
      title: "时间设置已保存",
      description: "配置已更新，您可以继续下一步。",
      variant: "default",
    });
  };

  const handleNext = () => {
    navigate("/domain");
  };

  const timeFormDefaultValues = {
    start_date: globalConfig.time_control.start_date_str_arr[0] || "",
    end_date: globalConfig.time_control.end_date_str_arr[0] || "",
    data_source: globalConfig.time_control.data_source || "GFS"
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="mb-2 pt-6">
          <h1 className="text-3xl font-bold mb-2">时间配置</h1>
          <p className="text-muted-foreground">
            设置WRF模拟的时间范围和数据源 (已接入Context)
          </p>
        </div>
        
        <TimeForm 
          onSubmit={handleSubmit} 
          defaultValues={timeFormDefaultValues} 
        />
        
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => navigate("/")}>
            返回首页
          </Button>
          <Button 
            onClick={handleNext} 
          >
            下一步：区域设置
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Time; 