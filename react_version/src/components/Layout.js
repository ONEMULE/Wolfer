import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import { Button } from './ui/button';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile sidebar toggle */}
        <div className="lg:hidden fixed left-4 bottom-4 z-30">
          <Button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            size="icon"
            variant="outline"
            className="rounded-full shadow-md bg-background h-12 w-12"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Sidebar - hidden on mobile by default */}
        <div className={`
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:block fixed lg:static inset-y-0 left-0 z-20
          w-64 lg:w-64
        `}>
          <div className="h-16 bg-background border-b border-border" /> {/* 占位 */}
          <Sidebar />
        </div>
        
        {/* Main content */}
        <main className="flex-1 w-full overflow-auto pl-0 lg:pl-64">
          {children}
        </main>
        
        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-10 lg:hidden" 
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
      
      {/* Footer */}
      <footer className="py-6 border-t border-border pl-0 lg:pl-64 transition-all duration-300">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>沃风平台 &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 