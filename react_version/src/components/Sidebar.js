import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Settings, 
  BarChart2, 
  Wind, 
  TrendingUp,
  ChevronRight 
} from 'lucide-react';

const sidebarItems = [
  {
    title: '平台介绍',
    icon: <Home className="h-5 w-5" />,
    href: '/about',
  },
  {
    title: 'WRF配置',
    icon: <Settings className="h-5 w-5" />,
    href: '/wrf-config',
    subItems: [
      { title: '首页', href: '/' },
      { title: '时间设置', href: '/time' },
      { title: '域设置', href: '/domain' },
      { title: '物理参数', href: '/physics' },
      { title: '动力学设置', href: '/dynamics' },
      { title: '配置审核', href: '/review' },
      { title: '输出生成', href: '/output' },
    ]
  },
  {
    title: 'WRF模拟运行结果',
    icon: <BarChart2 className="h-5 w-5" />,
    href: '/simulation-results',
  },
  {
    title: '风力资源分析',
    icon: <Wind className="h-5 w-5" />,
    href: '/wind-analysis',
  },
  {
    title: '废效及经济效益分析',
    icon: <TrendingUp className="h-5 w-5" />,
    href: '/economic-analysis',
  },
];

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // 确定当前活动的主菜单
  const getActiveMainMenu = () => {
    // WRF配置子路径
    if (currentPath === '/' || 
        currentPath.startsWith('/time') || 
        currentPath.startsWith('/domain') || 
        currentPath.startsWith('/physics') || 
        currentPath.startsWith('/dynamics') || 
        currentPath.startsWith('/review') || 
        currentPath.startsWith('/output')) {
      return '/wrf-config';
    }
    return currentPath;
  };
  
  const activeMainMenu = getActiveMainMenu();

  return (
    <div className="h-screen w-64 bg-muted border-r border-border overflow-y-auto fixed">
      <div className="p-4">
        <div className="flex flex-col space-y-1">
          {sidebarItems.map((item) => {
            const isActive = activeMainMenu === item.href;
            
            return (
              <div key={item.href}>
                <Link
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-accent/20 text-accent'
                      : 'hover:bg-muted-foreground/10'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.title}</span>
                  {item.subItems && (
                    <ChevronRight className={`ml-auto h-4 w-4 transition-transform ${isActive ? 'rotate-90' : ''}`} />
                  )}
                </Link>
                
                {/* 子菜单 */}
                {isActive && item.subItems && (
                  <div className="ml-7 mt-1 border-l-2 border-accent/30 pl-2 flex flex-col space-y-1">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.href}
                        to={subItem.href}
                        className={`text-sm py-1.5 px-2 rounded-md ${
                          currentPath === subItem.href
                            ? 'text-accent font-medium bg-accent/10'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10'
                        }`}
                      >
                        {subItem.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 