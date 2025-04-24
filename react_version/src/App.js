import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Time from './pages/Time';
import Domain from './pages/Domain';
import Physics from './pages/Physics';
import Dynamics from './pages/Dynamics';
import Review from './pages/Review';
import Output from './pages/Output';
import About from './pages/About';
import WrfConfig from './pages/WrfConfig';
import SimulationResults from './pages/SimulationResults';
import WindAnalysis from './pages/WindAnalysis';
import EconomicAnalysis from './pages/EconomicAnalysis';
import { Toaster } from './components/ui/toaster.jsx';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* 平台介绍 */}
          <Route path="/about" element={<About />} />

          {/* WRF配置模块 */}
          <Route path="/wrf-config" element={<WrfConfig />} />
          <Route path="/" element={<Home />} />
          <Route path="/time" element={<Time />} />
          <Route path="/domain" element={<Domain />} />
          <Route path="/physics" element={<Physics />} />
          <Route path="/dynamics" element={<Dynamics />} />
          <Route path="/review" element={<Review />} />
          <Route path="/output" element={<Output />} />
          
          {/* 其他模块 */}
          <Route path="/simulation-results" element={<SimulationResults />} />
          <Route path="/wind-analysis" element={<WindAnalysis />} />
          <Route path="/economic-analysis" element={<EconomicAnalysis />} />
          
          {/* 重定向和404 */}
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={
            <div className="container mx-auto py-8 px-4">
              <div className="max-w-4xl mx-auto bg-card rounded-lg border border-border p-8 text-center">
                <h1 className="text-3xl font-bold mb-4">页面不存在</h1>
                <p className="text-muted-foreground mb-6">您访问的页面不存在或已被移除</p>
              </div>
            </div>
          } />
        </Routes>
      </Layout>
      <Toaster />
    </Router>
  );
}

export default App; 