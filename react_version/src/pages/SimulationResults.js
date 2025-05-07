import React, { useState } from 'react';

const SimulationResults = () => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      alert(`文件 "${selectedFile.name}" 已选择，上传功能待实现。`);
      // 实际的上传逻辑将在这里
      // 例如: const formData = new FormData();
      // formData.append("wrfFile", selectedFile);
      // axios.post("/api/upload-wrf-output", formData)...
    } else {
      alert('请先选择一个文件。');
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 pt-6">
          <h1 className="text-3xl font-bold mb-2">WRF模拟运行结果</h1>
          <p className="text-muted-foreground">
            查看和分析WRF模拟的计算结果
          </p>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
          {/* New File Upload Section */}
          <div className="mb-8 p-6 border-b border-border">
            <h2 className="text-xl font-semibold mb-4">上传WRF输出文件</h2>
            <p className="text-sm text-muted-foreground mb-4">
              请选择您的 NetCDF (<code>.nc</code>) 格式的 WRF 输出文件 (例如 <code>wrfout_d01_xxxx-xx-xx_xx:xx:xx</code>)。
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="wrfFile" className="block text-sm font-medium text-foreground mb-1">
                  WRF 输出文件
                </label>
                <input
                  type="file"
                  id="wrfFile"
                  name="wrfFile"
                  accept=".nc"
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  onChange={handleFileChange}
                />
              </div>
              {selectedFile && (
                <div className="mt-2 text-sm text-muted-foreground">
                  已选择文件: {selectedFile.name} ({ (selectedFile.size / 1024 / 1024).toFixed(2) } MB)
                </div>
              )}
              <button
                type="button"
                onClick={handleUpload}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                上传文件
              </button>
            </div>
          </div>
          {/* End of New File Upload Section */}

          <p className="text-center text-lg text-muted-foreground py-12">
            模拟结果功能正在开发中...
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimulationResults; 