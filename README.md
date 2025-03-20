# WRF Model Setup GUI Tool

A graphical user interface tool for configuring and setting up WRF (Weather Research and Forecasting) model simulations.

## Features

- Configure simulation time period
- Set up domains with nested grids
- Choose map projections
- Select physics parameterization schemes
- Configure meteorological data sources
- Generate namelist files and run scripts

## Requirements

- Python 3.6 or higher
- Required Python packages:
  - tkinter
  - tkcalendar
  - numpy
  - matplotlib (for visualization)
  - netCDF4 (for data processing)
  - cdsapi (for ERA5 data)
  - xarray (for data analysis)
  - wrf-python (for post-processing)

## Installation

1. Clone or download this repository
2. Install required packages:pip install tkcalendar numpy matplotlib netCDF4 cdsapi xarray wrf-python

## Usage

1. Run the main program:python wrf_gui_main.py
2. Configure your WRF simulation using the GUI tabs:
- Set simulation period
- Configure domain and nesting
- Select physics options
- Choose data source
- Set paths and other settings

3. Save your configuration for future use

4. Generate the namelist files and run scripts

5. Download meteorological data using the generated download script

6. Run the WRF simulation using the generated run script

## Tabs Description

1. **Simulation Period**: Set the start and end dates/times for your simulation
2. **Domain Setup**: Configure domain size, resolution, nesting, and map projection
3. **Physics Options**: Select physics parameterization schemes
4. **Data Source**: Choose meteorological data source
5. **Settings**: Configure paths and API keys
6. **Summary**: View a summary of all settings

## License

This software is provided as-is under the MIT License.

## Acknowledgments

- WRF model developers at NCAR/UCAR
- The Python community for the excellent libraries

## Contact

For issues or suggestions, please open an issue on the GitHub repository.