import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import { Button } from './ui/button';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header with higher z-index to stay above sidebar */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-background">
        <Header />
      </div>
      
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
        
        {/* Sidebar - positioned below header but fixed */}
        <div className={`
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          fixed top-16 left-0 z-20
          w-64
          bottom-0
          border-r border-border
          bg-background
          overflow-y-auto
          pb-8
        `}>
          <Sidebar />
        </div>
        
        {/* Main content with margin to account for fixed sidebar and header */}
        <main className="flex-1 w-full overflow-auto pl-0 lg:pl-64 pt-16 pb-12">
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
      
      {/* Footer with margin to account for fixed sidebar */}
      <footer className="py-6 border-t border-border pl-0 lg:pl-64 mt-auto">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>沃风平台 &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 