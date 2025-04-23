import React from "react";
import { ArrowRight, Cloud } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";

const FeatureCard = ({ title, description, icon }) => {
  return (
    <Card className="flex flex-col p-6 space-y-4 border border-border/50 bg-background/50 hover:bg-accent/5 transition-colors">
      <div className="p-2 w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </Card>
  );
};

const HeroSection = ({
  title,
  description,
  badge,
  actions,
  features,
}) => {
  return (
    <section className="bg-background text-foreground py-12 sm:py-24 px-4">
      <div className="mx-auto max-w-7xl flex flex-col gap-16">
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Badge */}
          {badge && (
            <Badge variant="outline" className="gap-2">
              <span className="text-muted-foreground">{badge.text}</span>
            </Badge>
          )}

          {/* Title */}
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl max-w-3xl">
            {title}
          </h1>

          {/* Description */}
          <p className="text-md max-w-[650px] font-medium text-muted-foreground sm:text-xl">
            {description}
          </p>

          {/* Actions */}
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {actions.map((action, index) => (
              <Button key={index} variant={action.variant || "default"} size="lg" asChild>
                <Link to={action.href} className="flex items-center gap-2">
                  {action.text}
                  {index === 0 && <ArrowRight className="h-4 w-4" />}
                </Link>
              </Button>
            ))}
          </div>

          {/* Image Placeholder */}
          <div className="relative w-full max-w-5xl mt-8 rounded-lg overflow-hidden border border-border/50 shadow-lg">
            <div className="w-full h-[300px] bg-muted flex items-center justify-center">
              <p className="text-muted-foreground">WRF Namelist Generator Preview</p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="flex flex-col gap-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-center">
            主要功能
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const Home = () => {
  const features = [
    {
      title: "交互式配置",
      description: "通过直观的用户界面轻松配置WRF参数，无需手动编辑namelist文件。",
      icon: <Cloud className="h-6 w-6" />,
    },
    {
      title: "模板库",
      description: "访问为常见WRF模拟场景和研究应用预配置的模板。",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/></svg>,
    },
    {
      title: "验证系统",
      description: "自动验证您的配置，防止常见错误并确保选项之间的兼容性。",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
    },
    {
      title: "导出选项",
      description: "将您的配置导出为标准namelist.input文件或保存您的设置以供将来使用。",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
    },
    {
      title: "参数文档",
      description: "访问每个参数的综合文档，包括解释和推荐值。",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
    },
    {
      title: "多域支持",
      description: "轻松配置单个或多个嵌套域的WRF模拟，支持不同的网格比例和位置设置。",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    },
  ];

  return (
    <HeroSection
      badge={{
        text: "WRF Namelist Generator",
      }}
      title="简化天气研究和预报模型配置"
      description="一个用于创建、验证和管理Weather Research and Forecasting (WRF)模型配置文件的强大工具。为您的大气研究和天气模拟节省时间并减少错误。"
      actions={[
        {
          text: "开始配置",
          href: "/time",
          variant: "default",
        },
        {
          text: "了解更多",
          href: "/docs",
          variant: "outline",
        },
      ]}
      features={features}
    />
  );
};

export default Home; 