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
import { DEFAULT_CONFIG } from "../utils/constants";

const Output = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
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
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [configError, setConfigError] = useState(null);
  
  useEffect(() => {
    // 加载整体配置
    const savedConfig = localStorage.getItem("wrf_config");
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error("Error parsing saved configuration:", error);
        setConfigError("配置加载失败，请检查您的配置是否完整");
      }
    } else {
      setConfigError("未找到已保存的配置，请完成所有配置步骤");
    }
    setLoading(false);
  }, []);

  const validateConfig = () => {
    if (!config.start_date || !config.end_date || !config.data_source) {
      return "时间配置不完整，请返回时间设置页面完成配置";
    }
    
    if (!config.domain || !config.domain.e_we) {
      return "域配置不完整，请返回域设置页面完成配置";
    }
    
    if (!config.physics || !config.physics.mp_physics) {
      return "物理参数配置不完整，请返回物理参数设置页面完成配置";
    }
    
    if (!config.dynamics || config.dynamics.diff_opt === undefined) {
      return "动力学配置不完整，请返回动力学设置页面完成配置";
    }
    
    return null;
  };

  const handleGenerateFiles = async () => {
    // 先验证配置是否完整
    const validationError = validateConfig();
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
      // 使用完整配置
      const requestConfig = {
        ...config,
        output_dir: outputDir || ""
      };

      // Call API to generate files
      const response = await apiService.generateNamelist(requestConfig);
      
      if (response.success) {
        setIsGenerated(true);
        setOutputDir(response.output_dir);
        setMessages(response.messages || []);
        setDownloads(response.download_links || {});
        
        // Load file contents for preview tabs (if available)
        if (response.file_contents) {
          setResults(response.file_contents);
        }
        
        toast({
          title: "配置文件生成成功",
          description: "您可以下载生成的文件或查看预览",
          variant: "default",
        });
      } else {
        toast({
          title: "生成失败",
          description: response.error || "未知错误，请重试",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("生成文件错误:", error);
      toast({
        title: "生成失败",
        description: error.message || "请求失败，请检查网络连接",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (fileType) => {
    if (downloads[fileType]) {
      window.open(downloads[fileType], "_blank");
    }
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
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 pt-6">
          <h1 className="text-3xl font-bold mb-2">配置生成</h1>
          <p className="text-muted-foreground">
            生成WRF配置文件，包括namelist.wps和namelist.input
          </p>
        </div>
        
        {configError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>配置加载错误</AlertTitle>
            <AlertDescription>
              {configError}
            </AlertDescription>
          </Alert>
        )}
        
        <Card className="p-6">
          {!isGenerated ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="outputDir">输出目录 (可选)</Label>
                <Input
                  id="outputDir"
                  value={outputDir}
                  onChange={(e) => setOutputDir(e.target.value)}
                  placeholder="/path/to/output/directory"
                />
                <p className="text-sm text-muted-foreground">
                  如不指定，将使用默认路径
                </p>
              </div>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>准备生成文件</AlertTitle>
                <AlertDescription>
                  确保已完成以下配置步骤：
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>定义模拟时间 {config.start_date ? '✓' : '❌'}</li>
                    <li>配置区域设置 {config.domain ? '✓' : '❌'}</li>
                    <li>选择物理参数化方案 {config.physics ? '✓' : '❌'}</li>
                    <li>设置动力学选项 {config.dynamics ? '✓' : '❌'}</li>
                  </ol>
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-between items-center">
                <Button variant="outline" onClick={() => navigate("/review")}>
                  返回：配置审核
                </Button>
                <Button 
                  onClick={handleGenerateFiles} 
                  disabled={isLoading || configError !== null || validateConfig() !== null}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      生成中...
                    </>
                  ) : (
                    "生成配置文件"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* 结果显示区域 */}
              <div className="rounded-md bg-muted p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <h3 className="font-medium">生成完成</h3>
                </div>
                
                <div className="text-sm mb-4">
                  <p>输出目录: <span className="font-mono">{outputDir}</span></p>
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
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center p-3 h-auto"
                    onClick={() => handleDownload('namelist_wps')}
                  >
                    <Download className="h-5 w-5 mb-1" />
                    <span className="text-xs">namelist.wps</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center p-3 h-auto"
                    onClick={() => handleDownload('namelist_input')}
                  >
                    <Download className="h-5 w-5 mb-1" />
                    <span className="text-xs">namelist.input</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center p-3 h-auto"
                    onClick={() => handleDownload('download_script')}
                  >
                    <Download className="h-5 w-5 mb-1" />
                    <span className="text-xs">下载脚本</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center p-3 h-auto"
                    onClick={() => handleDownload('run_script')}
                  >
                    <Download className="h-5 w-5 mb-1" />
                    <span className="text-xs">运行脚本</span>
                  </Button>
                </div>
                
                {/* Namelist Preview Tabs */}
                <div className="mt-4">
                  <h3 className="font-medium mb-2">文件预览</h3>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-2">
                      <TabsTrigger value="wps">namelist.wps</TabsTrigger>
                      <TabsTrigger value="input">namelist.input</TabsTrigger>
                    </TabsList>
                    <TabsContent value="wps" className="mt-0">
                      <div className="bg-background border rounded-md p-2 overflow-x-auto">
                        <pre className="text-xs font-mono">{results.namelist_wps || "内容加载中..."}</pre>
                      </div>
                    </TabsContent>
                    <TabsContent value="input" className="mt-0">
                      <div className="bg-background border rounded-md p-2 overflow-x-auto">
                        <pre className="text-xs font-mono">{results.namelist_input || "内容加载中..."}</pre>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <Button variant="outline" onClick={() => setIsGenerated(false)}>
                  返回
                </Button>
                <Button onClick={handleGenerateFiles}>
                  重新生成
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Output; 