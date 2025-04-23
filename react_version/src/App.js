import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Time from './pages/Time';
import Domain from './pages/Domain';
import Physics from './pages/Physics';
import Dynamics from './pages/Dynamics';
import Review from './pages/Review';
import Output from './pages/Output';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/time" element={<Time />} />
            <Route path="/domain" element={<Domain />} />
            <Route path="/physics" element={<Physics />} />
            <Route path="/dynamics" element={<Dynamics />} />
            <Route path="/review" element={<Review />} />
            <Route path="/output" element={<Output />} />
            <Route path="*" element={<div className="container mx-auto py-8"><h1>页面不存在</h1></div>} />
          </Routes>
        </main>
        <footer className="py-6 border-t border-border">
          <div className="container mx-auto text-center text-sm text-muted-foreground">
            <p>WRF Namelist Generator &copy; {new Date().getFullYear()}</p>
          </div>
        </footer>
        <Toaster />
      </div>
    </Router>
  );
}

export default App; 