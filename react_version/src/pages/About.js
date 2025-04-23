import React from 'react';

const About = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 pt-6">
          <h1 className="text-3xl font-bold mb-2">平台介绍</h1>
          <p className="text-muted-foreground">
            沃风平台是一个专业的气象模拟与风能资源评估系统
          </p>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
          <p className="text-center text-lg text-muted-foreground py-12">
            平台介绍内容正在完善中...
          </p>
        </div>
      </div>
    </div>
  );
};

export default About; 