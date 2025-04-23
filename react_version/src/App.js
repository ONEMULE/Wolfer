import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Domain from './pages/Domain';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/domain" element={<Domain />} />
            <Route path="/physics" element={<div className="container mx-auto py-8"><h1>物理参数设置</h1><p>页面开发中...</p></div>} />
            <Route path="/output" element={<div className="container mx-auto py-8"><h1>输出设置</h1><p>页面开发中...</p></div>} />
            <Route path="*" element={<div className="container mx-auto py-8"><h1>页面不存在</h1></div>} />
          </Routes>
        </main>
        <footer className="py-6 border-t border-border">
          <div className="container mx-auto text-center text-sm text-muted-foreground">
            <p>WRF Namelist Generator &copy; {new Date().getFullYear()}</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App; 