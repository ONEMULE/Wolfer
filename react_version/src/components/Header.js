import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu";
import { Button } from "./ui/button";

// 添加在开头，引入字体
import "../styles/custom-fonts.css"; 

const navigationItems = [
  {
    title: "平台介绍",
    href: "/about",
  },
  {
    title: "WRF配置",
    href: "/wrf-config",
  },
  {
    title: "WRF模拟运行结果",
    href: "/simulation-results",
  },
  {
    title: "风力资源分析",
    href: "/wind-analysis",
  },
  {
    title: "废效及经济效益分析",
    href: "/economic-analysis",
  },
];

function Header() {
  const [isOpen, setOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="w-full z-40 bg-background sticky top-0 border-b border-border shadow-sm backdrop-blur-sm bg-opacity-95">
      <div className="container relative mx-auto min-h-16 flex gap-4 flex-row lg:grid lg:grid-cols-4 items-center">
        <div className="flex lg:justify-start lg:col-span-1 -ml-4">
          <Link to="/" className="flex items-center group">
            <p className="font-black text-4xl mr-8 tracking-wide font-title bg-gradient-to-br from-primary via-accent to-blue-500 bg-clip-text text-transparent transition-all duration-300 ease-in-out group-hover:scale-105 group-hover:skew-x-1 drop-shadow-lg">沃风平台</p>
          </Link>
        </div>
        <div className="justify-center items-center gap-4 lg:flex hidden flex-row lg:col-span-2 -ml-6">
          <NavigationMenu className="flex justify-center items-center">
            <NavigationMenuList className="flex justify-center gap-2 flex-row">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.href || 
                                (item.href === "/wrf-config" && 
                                 ["/", "/time", "/domain", "/physics", "/dynamics", "/review", "/output"].includes(location.pathname));
                return (
                  <NavigationMenuItem key={item.title}>
                    <NavigationMenuLink asChild>
                      <Link
                        to={item.href}
                        className={`group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
                          isActive 
                            ? "bg-accent/10 text-accent font-semibold" 
                            : "bg-background text-foreground hover:bg-accent/10 hover:text-accent"
                        }`}
                      >
                        {item.title}
                        {isActive && (
                          <span className="absolute bottom-0 left-0 right-0 mx-auto h-0.5 w-2/3 rounded-full bg-accent"></span>
                        )}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                );
              })}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex justify-end w-full lg:col-span-1">
          <div className="flex w-12 shrink lg:hidden items-end justify-end">
            <Button variant="ghost" onClick={() => setOpen(!isOpen)} className="rounded-full p-2 hover:bg-accent/10">
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            {isOpen && (
              <div className="absolute top-16 border-t flex flex-col w-full right-0 bg-background/95 backdrop-blur-sm shadow-lg py-4 container gap-4 z-50 animate-in fade-in slide-in-from-top-5 duration-300">
                {navigationItems.map((item) => {
                  const isActive = location.pathname === item.href || 
                                   (item.href === "/wrf-config" && 
                                    ["/", "/time", "/domain", "/physics", "/dynamics", "/review", "/output"].includes(location.pathname));
                  return (
                    <div key={item.title}>
                      <Link
                        to={item.href}
                        className={`flex justify-between items-center px-2 py-2 rounded-md transition-colors ${
                          isActive 
                            ? "bg-accent/10 text-accent font-semibold" 
                            : "hover:bg-accent/5 hover:text-accent"
                        }`}
                        onClick={() => setOpen(false)}
                      >
                        <span className="text-base">{item.title}</span>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header; 