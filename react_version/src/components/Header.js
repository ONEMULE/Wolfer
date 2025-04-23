import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu";
import { Button } from "./ui/button";

const navigationItems = [
  {
    title: "首页",
    href: "/",
  },
  {
    title: "物理参数",
    href: "/physics",
  },
  {
    title: "域设置",
    href: "/domain",
  },
  {
    title: "输出设置",
    href: "/output",
  },
];

function Header() {
  const [isOpen, setOpen] = useState(false);

  return (
    <header className="w-full z-40 bg-background border-b border-border">
      <div className="container relative mx-auto min-h-16 flex gap-4 flex-row lg:grid lg:grid-cols-3 items-center">
        <div className="flex lg:justify-start">
          <p className="font-semibold text-xl">WRF Namelist Generator</p>
        </div>
        <div className="justify-center items-center gap-4 lg:flex hidden flex-row">
          <NavigationMenu className="flex justify-center items-center">
            <NavigationMenuList className="flex justify-center gap-4 flex-row">
              {navigationItems.map((item) => (
                <NavigationMenuItem key={item.title}>
                  <NavigationMenuLink asChild>
                    <Link
                      to={item.href}
                      className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      {item.title}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex justify-end w-full">
          <div className="flex w-12 shrink lg:hidden items-end justify-end">
            <Button variant="ghost" onClick={() => setOpen(!isOpen)}>
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            {isOpen && (
              <div className="absolute top-16 border-t flex flex-col w-full right-0 bg-background shadow-lg py-4 container gap-8 z-50">
                {navigationItems.map((item) => (
                  <div key={item.title}>
                    <Link
                      to={item.href}
                      className="flex justify-between items-center"
                      onClick={() => setOpen(false)}
                    >
                      <span className="text-lg">{item.title}</span>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header; 