import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/ui/use-toast";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Loader2, Download, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import apiService from "../api/api";
import { useConfig } from "../context/ConfigContext";

const Output = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { config } = useConfig();
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [outputDir, setOutputDir] = useState("");
  const [messages, setMessages] = useState([]);
  const [results, setResults] = useState({
    namelist_wps: "",
    namelist_input: "",
  });
  const [downloads, setDownloads] = useState({
    namelist_wps: "",
    namelist_input: "",
    download_script: "",
    run_script: "",
  });
  const [activeTab, setActiveTab] = useState("wps");

  const validateConfig = (currentConfig) => {
    if (!currentConfig || !currentConfig.time_control) {
        return "配置数据不完整或未加载。";
    }

    if (
      !currentConfig.time_control.start_date_str_arr || currentConfig.time_control.start_date_str_arr.length === 0 || !currentConfig.time_control.start_date_str_arr[0] ||
      !currentConfig.time_control.end_date_str_arr || currentConfig.time_control.end_date_str_arr.length === 0 || !currentConfig.time_control.end_date_str_arr[0] ||
      currentConfig.time_control.interval_seconds_wps === undefined || 
      !currentConfig.time_control.data_source
    ) {
      return "时间配置不完整，请返回时间设置页面完成配置。";
    }
    
    if (
      !currentConfig.domain_setup || !currentConfig.domain_setup.e_we_arr || currentConfig.domain_setup.e_we_arr.length === 0 ||
      !currentConfig.domain_setup.map_proj || !currentConfig.domain_setup.geog_data_path
    ) {
      return "域配置不完整，请返回域设置页面完成配置。";
    }
    
    if (
      !currentConfig.physics || !currentConfig.physics.mp_physics_arr || currentConfig.physics.mp_physics_arr.length === 0
    ) {
      return "物理参数配置不完整，请返回物理参数设置页面完成配置。";
    }
    
    if (
      !currentConfig.dynamics || currentConfig.dynamics.diff_opt_arr === undefined || currentConfig.dynamics.diff_opt_arr.length === 0
    ) {
      return "动力学配置不完整，请返回动力学设置页面完成配置。";
    }
    
    return null;
  };

  const handleGenerateFiles = async () => {
    if (!config) {
        toast({
            title: "配置错误",
            description: "无法加载配置信息，请尝试刷新或返回首页。",
            variant: "destructive",
        });
        return;
    }

    const validationError = validateConfig(config);
    if (validationError) {
      toast({
        title: "配置不完整",
        description: validationError,
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setMessages([]);
    setIsGenerated(false);

    try {
      const requestConfig = {
        ...config, 
        output_dir: outputDir || undefined
      };
      
      const response = await apiService.generateNamelist(requestConfig); 
      
      if (response.success) {
        setIsGenerated(true);
        setOutputDir(response.output_dir || "");
        setMessages(response.messages || []);
        setDownloads(response.download_links || {});
        
        if (response.file_contents) {
          setResults(response.file_contents);
        }
        
        toast({
          title: "配置文件生成成功",
          description: "您可以下载生成的文件或查看预览。",
          variant: "default",
        });
      } else {
        toast({
          title: "生成失败",
          description: response.error || response.message || "未知错误，请重试。",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("生成文件错误:", error);
      toast({
        title: "生成失败",
        description: error.message || "请求失败，请检查网络连接或查看控制台。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (fileType) => {
    if (downloads[fileType]) {
      window.open(downloads[fileType], "_blank");
    } else {
        toast({
            title: "下载失败",
            description: `文件 ${fileType} 的下载链接不存在。`,
            variant: "destructive",
        });
    }
  };
  
  if (!config) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center">
        <p>加载配置中...</p> 
      </div>
    );
  }

  const currentValidationError = validateConfig(config);

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 pt-6">
          <h1 className="text-3xl font-bold mb-2">配置生成</h1>
          <p className="text-muted-foreground">
            生成WRF配置文件，包括namelist.wps和namelist.input
          </p>
        </div>
        
        <Card className="p-6">
          {!isGenerated ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="outputDir">输出目录 (可选)</Label>
                <Input
                  id="outputDir"
                  value={outputDir}
                  onChange={(e) => setOutputDir(e.target.value)}
                  placeholder="例如：/user/project_A/wrf_output (后端将使用默认值如果留空)"
                />
                <p className="text-sm text-muted-foreground">
                  如不指定，将使用后端定义的默认路径。
                </p>
              </div>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>准备生成文件</AlertTitle>
                <AlertDescription>
                  请确保已在前面步骤中完成所有必要的配置。
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>时间定义: {config.time_control && config.time_control.start_date_str_arr && config.time_control.start_date_str_arr[0] ? '✓' : '❌'}</li>
                    <li>域设置: {config.domain_setup && config.domain_setup.e_we_arr && config.domain_setup.e_we_arr[0] ? '✓' : '❌'}</li>
                    <li>物理参数: {config.physics && config.physics.mp_physics_arr && config.physics.mp_physics_arr[0] ? '✓' : '❌'}</li>
                    <li>动力学选项: {config.dynamics && config.dynamics.diff_opt_arr && config.dynamics.diff_opt_arr[0] !== undefined ? '✓' : '❌'}</li>
                  </ol>
                  {currentValidationError && <p className="text-red-500 text-sm mt-2">提示: {currentValidationError}</p>}
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-between items-center">
                <Button variant="outline" onClick={() => navigate("/review")}>
                  返回：配置审核
                </Button>
                <Button 
                  onClick={handleGenerateFiles} 
                  disabled={isLoading || !!currentValidationError}
                >
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 生成中...</>
                  ) : (
                    "生成配置文件"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-md bg-muted p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <h3 className="font-medium">生成完成</h3>
                </div>
                
                <div className="text-sm mb-4">
                  <p>输出目录: <span className="font-mono">{outputDir || "由后端指定"}</span></p>
                </div>
                
                {messages.length > 0 && (
                  <div className="bg-background border rounded-md p-3 mb-4 max-h-40 overflow-y-auto">
                    <h4 className="font-medium mb-1">处理日志:</h4>
                    <div className="text-xs space-y-1">
                      {messages.map((message, index) => (
                        <div key={index} className="font-mono">{message}</div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {downloads.namelist_wps && (
                    <Button 
                      variant="outline" 
                      className="flex flex-col items-center p-3 h-auto"
                      onClick={() => handleDownload('namelist_wps')}
                    >
                      <Download className="h-5 w-5 mb-1" />
                      <span className="text-xs">namelist.wps</span>
                    </Button>
                  )}
                  {downloads.namelist_input && (
                    <Button 
                      variant="outline" 
                      className="flex flex-col items-center p-3 h-auto"
                      onClick={() => handleDownload('namelist_input')}
                    >
                      <Download className="h-5 w-5 mb-1" />
                      <span className="text-xs">namelist.input</span>
                    </Button>
                  )}
                   {downloads.download_script && (
                    <Button 
                      variant="outline" 
                      className="flex flex-col items-center p-3 h-auto"
                      onClick={() => handleDownload('download_script')}
                    >
                      <Download className="h-5 w-5 mb-1" />
                      <span className="text-xs">下载脚本</span>
                    </Button>
                  )}
                  {downloads.run_script && (
                    <Button 
                      variant="outline" 
                      className="flex flex-col items-center p-3 h-auto"
                      onClick={() => handleDownload('run_script')}
                    >
                      <Download className="h-5 w-5 mb-1" />
                      <span className="text-xs">运行脚本</span>
                    </Button>
                  )}
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="wps">namelist.wps</TabsTrigger>
                  <TabsTrigger value="input">namelist.input</TabsTrigger>
                </TabsList>
                <TabsContent value="wps">
                  <Card className="mt-2">
                    <pre className="p-4 text-sm overflow-x-auto">
                      {results.namelist_wps || "Namelist.wps 内容将在此处显示"}
                    </pre>
                  </Card>
                </TabsContent>
                <TabsContent value="input">
                  <Card className="mt-2">
                    <pre className="p-4 text-sm overflow-x-auto">
                      {results.namelist_input || "Namelist.input 内容将在此处显示"}
                    </pre>
                  </Card>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end">
                <Button onClick={() => setIsGenerated(false)}>重新生成</Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Output; 