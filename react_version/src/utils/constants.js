// 默认配置
export const DEFAULT_CONFIG = {
  start_date: new Date().toISOString().substring(0, 10) + "_00:00:00",
  end_date: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().substring(0, 10) + "_00:00:00",
  domain: {
    e_we: 100,
    e_sn: 100,
    dx: 30.0,
    dy: 30.0,
    ref_lat: 40.0,
    ref_lon: 116.0,
    truelat1: 30.0,
    truelat2: 60.0,
    stand_lon: 116.0,
    max_dom: 1,
    parent_grid_ratio: [1, 3, 3],
    i_parent_start: [1, 31, 31],
    j_parent_start: [1, 17, 33],
    parent_time_step_ratio: [1, 3, 3]
  },
  projection: 1,
  physics: {
    mp_physics: 6,
    ra_lw_physics: 1,
    ra_sw_physics: 1,
    sf_surface_physics: 2,
    bl_pbl_physics: 1,
    cu_physics: 1
  },
  dynamics: {
    diff_opt: 2,
    km_opt: 4,
    non_hydrostatic: true
  },
  data_source: "GFS",
  output_dir: "",
  user_settings: {
    geog_data_path: "",
    cds_api_key: "",
    cds_api_url: "https://cds.climate.copernicus.eu/api/v2",
    wps_path: "",
    wrf_path: ""
  }
};

// 物理参数选项
export const PHYSICS_OPTIONS = {
  mp_physics: {
    1: "Kessler scheme",
    2: "Lin et al. scheme",
    3: "WSM3 scheme",
    4: "WSM5 scheme",
    6: "WSM6 scheme",
    8: "Thompson scheme",
    10: "Morrison 2-moment scheme"
  },
  ra_lw_physics: {
    1: "RRTM scheme",
    3: "CAM scheme",
    4: "RRTMG scheme"
  },
  ra_sw_physics: {
    1: "Dudhia scheme",
    2: "Goddard shortwave",
    3: "CAM scheme",
    4: "RRTMG scheme"
  },
  sf_surface_physics: {
    1: "Thermal diffusion scheme",
    2: "Noah Land Surface Model",
    3: "RUC Land Surface Model",
    4: "Noah-MP Land Surface Model"
  },
  bl_pbl_physics: {
    1: "YSU scheme",
    2: "Mellor-Yamada-Janjic scheme",
    4: "QNSE scheme",
    5: "MYNN2 scheme",
    6: "MYNN3 scheme"
  },
  cu_physics: {
    0: "No cumulus",
    1: "Kain-Fritsch scheme",
    2: "Betts-Miller-Janjic scheme",
    3: "Grell-Freitas scheme",
    5: "Grell-3D scheme"
  }
};

// 动力学选项
export const DYNAMICS_OPTIONS = {
  diff_opt: {
    0: "No turbulence or mixing",
    1: "Evaluate second-order diffusion term on coordinate surfaces",
    2: "Evaluate second-order diffusion term on model levels"
  },
  km_opt: {
    1: "Constant coefficient",
    2: "1.5-order TKE closure",
    3: "Smagorinsky first-order closure",
    4: "Horizontal Smagorinsky first-order closure"
  }
};

// 投影选项
export const PROJECTIONS = {
  1: "Lambert Conformal",
  2: "Polar Stereographic",
  3: "Mercator",
  6: "Lat-Lon (including global)"
};

// 数据源选项
export const DATA_SOURCES = {
  GFS: "NCEP Global Forecast System",
  ERA5: "ECMWF ERA5 Reanalysis",
  FNL: "NCEP Final Analysis",
  NARR: "North American Regional Reanalysis"
}; 