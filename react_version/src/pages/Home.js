import React from "react";
import { ArrowRight, Cloud, Terminal } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

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

// 示例namelist配置
const shareExample = `&share
 wrf_core = 'ARW',
 max_dom = 1,
 start_date = '2025-02-14_00:00:00',
 end_date   = '2025-02-15_00:00:00',
 interval_seconds = 10800,
 io_form_geogrid = 102,
/

&geogrid
 parent_id         =   1,
 parent_grid_ratio =   1, 
 i_parent_start    =   1, 
 j_parent_start    =   1,
 e_we              =   31, 
 e_sn              =   31,
 geog_data_res = 'default',
 dx = 3000,
 dy = 3000,
 map_proj = 'lambert',
 ref_lat   =  36.20,
 ref_lon   =  120.60,
 truelat1  =  30.0,
 truelat2  =  60.0,
 stand_lon =  120.60,
 geog_data_path = '/home/onemule/WRF/run/geo_data/geog_high_res_mandatory/WPS_GEOG'
/

&ungrib
 out_format = 'WPS',
 prefix = 'FILE',
/

&metgrid
 fg_name = 'FILE',
 io_form_metgrid = 102,
/`;

const timeControlExample = ` &time_control
 run_days                            = 0,
 run_hours                           = 24,
 run_minutes                         = 0,
 run_seconds                         = 0,
 start_year                          = 2025, 
 start_month                         = 02, 
 start_day                           = 14,
 start_hour                          = 00, 
 end_year                            = 2025, 
 end_month                           = 02,
 end_day                             = 15,   
 end_hour                            = 00, 
 interval_seconds                    = 10800
 input_from_file                     = .true.,
 history_interval                    = 30,
 frames_per_outfile                  = 1000,
 restart                             = .false.,
 restart_interval                    = 7200,
 io_form_history                     = 2
 io_form_restart                     = 2
 io_form_input                       = 2
 io_form_boundary                    = 2
 /

 &domains
 time_step                           = 18,
 time_step_fract_num                 = 0,
 time_step_fract_den                 = 1,
 max_dom                             = 1,
 e_we                                = 31,  
 e_sn                                = 31,
 e_vert                              = 45, 
 dzstretch_s                         = 1.1
 p_top_requested                     = 5000,
 num_metgrid_levels                  = 34,
 num_metgrid_soil_levels             = 4,
 dx                                  = 3000,
 dy                                  = 3000,
 grid_id                             = 1, 
 parent_id                           = 1, 
 i_parent_start                      = 1,  
 j_parent_start                      = 1, 
 parent_grid_ratio                   = 1, 
 parent_time_step_ratio              = 1, 
 feedback                            = 1,
 smooth_option                       = 0
 /

 &physics
 physics_suite                       = 'CONUS'
 mp_physics                          = 8,    
 cu_physics                          = 6,    
 ra_lw_physics                       = 4,    
 ra_sw_physics                       = 4,    
 bl_pbl_physics                      = 2,    
 sf_sfclay_physics                   = 2,    
 sf_surface_physics                  = 2,    
 radt                                = 15,   
 bldt                                = 0,     
 cudt                                = 0,     
 icloud                              = 1,
 num_land_cat                        = 21,
 sf_urban_physics                    = 0,     
 fractional_seaice                   = 1,
 /

 &fdda
 /

 &dynamics
 hybrid_opt                          = 2, 
 w_damping                           = 0,
 diff_opt                            = 2,    
 km_opt                              = 4,    
 diff_6th_opt                        = 0,   
 diff_6th_factor                     = 0.12, 
 base_temp                           = 290.
 damp_opt                            = 3,
 zdamp                               = 5000., 
 dampcoef                            = 0.2,    
 khdif                               = 0,      
 kvdif                               = 0,     
 non_hydrostatic                     = .true., 
 moist_adv_opt                       = 1,
 scalar_adv_opt                      = 1,
 gwd_opt                             = 1,
 /

 &bdy_control
 spec_bdy_width                      = 5,
 specified                           = .true.
 /

 &grib2
 /

 &namelist_quilt
 nio_tasks_per_group = 0,
 nio_groups = 1,
 /`;

// Namelist 预览组件
const NamelistPreview = () => {
  return (
    <Tabs defaultValue="share" className="w-full">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium">Namelist 文件预览</h3>
        <TabsList className="p-0.5">
          <TabsTrigger value="share" className="text-xs px-3 py-1.5">namelist.wps</TabsTrigger>
          <TabsTrigger value="time" className="text-xs px-3 py-1.5">namelist.input</TabsTrigger>
        </TabsList>
      </div>
      
      <Card className="w-full overflow-hidden border border-border">
        <TabsContent value="share" className="m-0">
          <div className="bg-black/90 overflow-auto h-[300px] p-4 font-mono text-sm text-green-400">
            <div className="flex">
              <div className="min-w-[40px] text-gray-500 select-none text-right pr-4">
                {shareExample.split('\n').map((_, i) => (
                  <div key={i} className="h-5 leading-5">{i + 1}</div>
                ))}
              </div>
              <pre className="text-left">{shareExample}</pre>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="time" className="m-0">
          <div className="bg-black/90 overflow-auto h-[300px] p-4 font-mono text-sm text-green-400">
            <div className="flex">
              <div className="min-w-[40px] text-gray-500 select-none text-right pr-4">
                {timeControlExample.split('\n').map((_, i) => (
                  <div key={i} className="h-5 leading-5">{i + 1}</div>
                ))}
              </div>
              <pre className="text-left">{timeControlExample}</pre>
            </div>
          </div>
        </TabsContent>
      </Card>
    </Tabs>
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

          {/* Namelist Preview */}
          <div className="relative w-full max-w-5xl mt-8 rounded-lg overflow-hidden shadow-lg">
            <NamelistPreview />
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
      title="天气研究和预报模型配置模块"
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