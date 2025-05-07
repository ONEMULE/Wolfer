import React, { useState } from 'react';

const WindAnalysis = () => {
  const [selectedAnalysisFile, setSelectedAnalysisFile] = useState(null);

  // Dummy files for selection demonstration
  const dummyFiles = [
    { id: 'wrfout_d01_2023-01-15.nc', name: 'wrfout_d01_2023-01-15.nc (示例1)' },
    { id: 'wrfout_d02_run_short.nc', name: 'wrfout_d02_run_short.nc (示例2)' },
    { id: 'case_study_final.nc', name: 'case_study_final.nc (示例3)' },
  ];

  const handleFileSelect = (file) => {
    setSelectedAnalysisFile(file);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 pt-6">
          <h1 className="text-3xl font-bold mb-2">风力资源分析</h1>
          <p className="text-muted-foreground">
            基于模拟结果进行风能资源特性分析
          </p>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
          <div className="space-y-8">
            <div className="p-4 border rounded-md">
              <h3 className="text-lg font-semibold mb-2">选择分析输入</h3>
              <p className="text-sm text-muted-foreground mb-3">
                请选择一个已上传的WRF结果文件开始分析：
              </p>
              <div className="space-y-2">
                {dummyFiles.map((file) => (
                  <button
                    key={file.id}
                    type="button"
                    onClick={() => handleFileSelect(file)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm 
                                ${selectedAnalysisFile?.id === file.id 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-slate-100 hover:bg-slate-200'}`}
                  >
                    {file.name}
                  </button>
                ))}
              </div>
              {selectedAnalysisFile && (
                <p className="text-sm text-green-600 mt-3">
                  已选择进行分析： {selectedAnalysisFile.name}
                </p>
              )}
            </div>

            <div className="p-4 border rounded-md">
              <h3 className="text-lg font-semibold mb-2">分析结果摘要 (演示)</h3>
              {!selectedAnalysisFile ? (
                <p className="text-sm text-muted-foreground">请先从上方选择一个文件进行分析。</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Simulating data based on selected file */}
                  <div className="p-3 bg-background rounded">
                    <p className="text-sm text-muted-foreground">平均风速 (100m) for {selectedAnalysisFile.id}</p>
                    <p className="text-xl font-bold">{selectedAnalysisFile.id.includes('d01') ? '7.5 m/s' : '8.2 m/s'}</p> 
                  </div>
                  <div className="p-3 bg-background rounded">
                    <p className="text-sm text-muted-foreground">主导风向 (100m) for {selectedAnalysisFile.id}</p>
                    <p className="text-xl font-bold">{selectedAnalysisFile.id.includes('d01') ? '270 °' : '265 °'}</p>
                  </div>
                  <div className="p-3 bg-background rounded">
                    <p className="text-sm text-muted-foreground">风功率密度 (100m) for {selectedAnalysisFile.id}</p>
                    <p className="text-xl font-bold">{selectedAnalysisFile.id.includes('d01') ? '450 W/m²' : '510 W/m²'}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border rounded-md">
              <h3 className="text-lg font-semibold mb-2">风玫瑰图 (演示)</h3>
              {!selectedAnalysisFile ? (
                <p className="text-sm text-muted-foreground">请先选择文件以查看风玫瑰图。</p>
              ) : (
                <div className="h-64 bg-slate-200 rounded flex items-center justify-center">
                  <p className="text-muted-foreground">(风玫瑰图 for {selectedAnalysisFile.name})</p>
                </div>
              )}
            </div>

            <div className="p-4 border rounded-md">
              <h3 className="text-lg font-semibold mb-2">风速空间分布图 (演示)</h3>
              {!selectedAnalysisFile ? (
                <p className="text-sm text-muted-foreground">请先选择文件以查看空间分布图。</p>
              ) : (
                <div className="h-64 bg-slate-200 rounded flex items-center justify-center">
                  <p className="text-muted-foreground">(地图 for {selectedAnalysisFile.name})</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WindAnalysis; 