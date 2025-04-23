import * as React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// 创建一个工具函数来合并类名
const cn = (...inputs) => {
  return twMerge(clsx(inputs));
};

// 导航菜单
const NavigationMenu = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    return (
      <nav ref={ref} className={cn("relative", className)} {...props}>
        {children}
      </nav>
    );
  }
);
NavigationMenu.displayName = "NavigationMenu";

// 导航菜单列表
const NavigationMenuList = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <ul
        ref={ref}
        className={cn(
          "flex flex-1 list-none items-center justify-center space-x-1",
          className
        )}
        {...props}
      />
    );
  }
);
NavigationMenuList.displayName = "NavigationMenuList";

// 导航菜单项
const NavigationMenuItem = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <li ref={ref} className={cn("relative", className)} {...props} />
  );
});
NavigationMenuItem.displayName = "NavigationMenuItem";

// 导航菜单触发器
const NavigationMenuTrigger = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
NavigationMenuTrigger.displayName = "NavigationMenuTrigger";

// 导航菜单内容
const NavigationMenuContent = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "absolute left-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out",
          className
        )}
        {...props}
      />
    );
  }
);
NavigationMenuContent.displayName = "NavigationMenuContent";

// 导航菜单链接
const NavigationMenuLink = React.forwardRef(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? React.Fragment : "a";
    return (
      <Comp
        ref={ref}
        className={cn(
          "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
NavigationMenuLink.displayName = "NavigationMenuLink";

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
}; 