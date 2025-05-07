import React, { createContext, useContext, useReducer, useEffect } from 'react';

// 初始状态，结构尽量接近我们定义的JSON v2
const baseInitialState = {
  _lastUpdated: null, // Initialize _lastUpdated
  time_control: {
    start_date_str_arr: ["2001-10-25_00:00:00"],
    end_date_str_arr: ["2001-10-26_00:00:00"],
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
    restart_enabled: false,
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
    e_we_arr: [100],
    e_sn_arr: [100],
    dx_arr: [30000],
    dy_arr: [30000],
    ref_lat_arr: [34.0],
    ref_lon_arr: [118.0],
    truelat1_arr: [30.0],
    truelat2_arr: [60.0],
    stand_lon_arr: [118.0],
    map_proj: "lambert", // e.g., "lambert", "polar", "mercator", "lat-lon"
    geog_data_path: "/path/to/wps_geog/",
    opt_geogrid_tbl_path: "./geogrid/GEOGRID.TBL.ARW_CHEM",
    // For single domain, these might look like:
    parent_id_arr: [0], // Domain 1 has parent_id 0 (itself conceptually for WPS)
    parent_grid_ratio_arr: [1], // No parent, so ratio is 1
    i_parent_start_arr: [1],    // Starts at 1 in its own grid
    j_parent_start_arr: [1],
  },
  physics_options: {
    mp_physics_arr: [8],
    cu_physics_arr: [1],
    ra_lw_physics_arr: [4],
    ra_sw_physics_arr: [4],
    bl_pbl_physics_arr: [1],
    sf_sfclay_physics_arr: [1],
    sf_surface_physics_arr: [2],
    radt_arr: [30],
    bldt_arr: [0],
    cudt_arr: [5],
    icloud_arr: [1],
    num_soil_layers_arr: [4],
    sf_urban_physics_arr: [0],
    iz0tlnd_arr: [0],
    ishallow_arr: [0],
    isfflx_arr: [1],
    ifsnow_arr: [0],
    sst_update_arr: [0],
  },
  dynamics_options: {
    w_damping_arr: [1],
    diff_opt_arr: [1],
    km_opt_arr: [4],
    damp_opt_arr: [3],
    zdamp_arr: [5000],
    dampcoef_arr: [0.2],
    khdif_arr: [0],
    kvdif_arr: [0],
    non_hydrostatic_arr: [true],
    eta_levels_arr: [], // Typically auto-calculated or specified in detail
    time_step_arr: [60], // Should be dynamically calculated based on dx, etc.
    use_adaptive_time_step_arr: [false],
    step_to_output_time_arr: [true],
    time_step_fract_num_arr: [0],
    time_step_fract_den_arr: [1],
  },
  // Add other sections like fdda, namelist_quilt etc. as needed
};

const ConfigContext = createContext();

const configReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_CONFIG_SECTION':
      console.log(`Reducer: Updating section ${action.section}`, action.data);
      const newState = {
        ...state,
        [action.section]: {
          ...state[action.section],
          ...action.data,
        },
        _lastUpdated: Date.now(), // Ensure config object reference changes
      };
      console.log("Reducer: New state after update:", newState);
      return newState;
    case 'SET_ENTIRE_CONFIG':
      console.log("Reducer: Setting entire config:", action.data);
      return { ...action.data, _lastUpdated: Date.now() }; // Also update timestamp here
    case 'RESET_CONFIG':
      console.log("Reducer: Resetting config");
      // Ensure that the reset action also properly creates a new object reference
      // and resets the _lastUpdated timestamp as per baseInitialState.
      return { ...baseInitialState, _lastUpdated: Date.now() }; // Or baseInitialState._lastUpdated if reset shouldn't trigger save immediately
    default:
      return state;
  }
};

export const ConfigProvider = ({ children }) => {
  const [config, dispatch] = useReducer(configReducer, baseInitialState, (initial) => {
    try {
      const localData = localStorage.getItem('global_wrf_config');
      return localData ? JSON.parse(localData) : initial;
    } catch (error) {
      console.error("Error reading config from localStorage:", error);
      return initial;
    }
  });

  // Persist to localStorage whenever config changes
  useEffect(() => {
    try {
      if (config) {
        const configString = JSON.stringify(config);
        // 调试日志 1
        console.log('Attempting to save to localStorage. Key: global_wrf_config. Value:', configString); 
        localStorage.setItem('global_wrf_config', configString);
        const writtenValue = localStorage.getItem('global_wrf_config');
        // 调试日志 2
        console.log('Value read back from localStorage:', writtenValue); 
        if (configString === writtenValue) {
          // 调试日志 3
          console.log('localStorage write successful and data matches!'); 
        } else {
          // 调试日志 4
          console.error('localStorage write FAILED or data mismatch!', {expected: configString, got: writtenValue}); 
        }
      } else {
        console.warn('Attempting to save null/undefined config to localStorage. Skipping.');
      }
    } catch (error) {
      // 捕获 localStorage 操作可能抛出的任何错误
      console.error("Error during localStorage operations:", error); 
    }
  }, [config]);

  const updateConfigSection = (section, data) => {
    dispatch({ type: 'UPDATE_CONFIG_SECTION', payload: { section, data } });
  };

  const loadConfig = (loadedConfig) => { // Function to load an entire config object
    dispatch({ type: 'SET_ENTIRE_CONFIG', payload: loadedConfig });
  };

  const resetConfig = () => {
    dispatch({ type: 'RESET_CONFIG' });
  };

  return (
    <ConfigContext.Provider value={{ config, updateConfigSection, loadConfig, resetConfig }}>
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