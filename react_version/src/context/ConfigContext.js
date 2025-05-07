// src/context/ConfigContext.js
import React, { createContext, useContext, useReducer } from 'react';

// 初始状态，结构尽量接近我们定义的JSON v2
const initialState = {
  time_control: {
    start_date_str_arr: ["2001-10-25_00:00:00"], // 示例默认值
    end_date_str_arr: ["2001-10-26_00:00:00"],
    // run_duration_str: "P0DT3H0M0S", // 或者使用下面的分解
    run_days: 0,
    run_hours: 3,
    run_minutes: 0,
    run_seconds: 0,
    interval_seconds_wps: 21600,
    interval_seconds_input: 10800,
    history_interval_arr: [3],
    history_interval_unit_arr: ["h"],
    frames_per_outfile_arr: [1],
    input_from_file_arr: [true],
    restart_enabled: false, // 默认不启用重启
    restart_interval_h: 6,
    io_form_history: 2,
    io_form_restart: 2,
    io_form_input: 2,
    io_form_boundary: 2,
    debug_level: 0,
    nocolons: true,
    data_source: "GFS"
  },
  domain_setup: {
    max_dom: 1,
    e_we_arr: [100], // 前端页面默认值是100
    e_sn_arr: [100],
    dx_arr: [30000], // 前端是30km, 这里存米
    dy_arr: [30000],
    map_proj: "lambert",
    ref_lat: 40.0,    // 前端默认值是40
    ref_lon: 116.0,   // 前端默认值是116
    truelat1: 30.0,
    truelat2: 60.0,
    stand_lon: 116.0, // 前端默认值是116
    geog_data_path: "/path/to/default/geog_on_server", // 这是一个服务器端路径，前端可能不直接设置
    time_step: 60, // 前端默认值
    e_vert_arr: [35], // 默认值
    feedback_arr: [1],
    smooth_option_arr: [0],
    parent_id_arr: [0], // For input, d01 parent_id is 0; for wps, it's 1. This needs careful handling.
    parent_grid_ratio_arr: [1],
    i_parent_start_arr: [1], // For input, d01 is 1 (or 0); for wps, it's 1
    j_parent_start_arr: [1],
    parent_time_step_ratio_arr: [1]
  },
  physics: {
    mp_physics_arr: [8], // Thompson, 对应前端默认
    ra_lw_physics_arr: [1], // RRTM, 对应前端默认
    ra_sw_physics_arr: [1], // Dudhia, 对应前端默认
    radt_arr: [10], // 对应前端默认值 (如果前端有的话)
    sf_sfclay_physics_arr: [1], // MMNN (revised), 对应前端默认
    sf_surface_physics_arr: [2], // Noah, 对应前端默认
    bl_pbl_physics_arr: [1], // YSU, 对应前端默认
    bldt_arr: [0],
    cu_physics_arr: [1], // Kain-Fritsch, _arr 对应前端默认
    cudt_arr: [5],
    isfflx: 1,
    ifsnow: 0,
    icloud: 1,
    surface_input_source: 1,
    num_soil_layers: 4 // Noah 通常是4层
  },
  dynamics: {
    w_damping_arr: [0], // 对应前端damp_opt=0(无阻尼)时w_damping不出现，或damp_opt=1时出现
    diff_opt_arr: [1], // 对应前端默认
    km_opt_arr: [4],   // 对应前端默认
    khdif_arr: [0],
    kvdif_arr: [0],
    non_hydrostatic_arr: [true], // 对应前端默认
    rk_ord: 3,
    damp_opt: 0 // 对应前端默认
    // zdamp_arr, dampcoef_arr 根据 damp_opt 设置
  },
  bdy_control: {
    spec_bdy_width_arr: [5],
    spec_zone_arr: [1],
    relax_zone_arr: [4],
    specified_arr: [true],
    nested_arr: [false]
  },
  namelist_quilt: {
    nio_tasks_per_group: 0,
    nio_groups: 1
  }
};

// Reducer function to update state
// action.type could be 'UPDATE_TIME_CONTROL', 'UPDATE_DOMAIN_SETUP', etc.
// action.payload would be the new data for that section
const configReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_CONFIG_SECTION': // Generic action to update any top-level key
      return {
        ...state,
        [action.section]: { ...state[action.section], ...action.payload }
      };
    case 'SET_FULL_CONFIG': // To load a full config, e.g., from a template
        return { ...action.payload };
    default:
      return state;
  }
};

const ConfigContext = createContext();

export const ConfigProvider = ({ children }) => {
  const [config, dispatch] = useReducer(configReducer, initialState);

  // Function to update a specific section of the config
  // sectionName should match one of the keys in initialState (e.g., 'time_control')
  const updateConfigSection = (sectionName, newValues) => {
    dispatch({ type: 'UPDATE_CONFIG_SECTION', section: sectionName, payload: newValues });
  };
  
  // You might add more specific update functions if needed

  return (
    <ConfigContext.Provider value={{ config, updateConfigSection, dispatch }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}; 