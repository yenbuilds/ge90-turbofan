# GE90 Turbofan Engine Viewer

A 3D visualization of a GE90-style turbofan engine built with Three.js. This project provides an interactive model of a high-bypass turbofan engine, featuring animated spools, throttle control, and orbit controls for exploration.

**Note:** This is a simplified, artistic representation and not an accurate engineering model.

## Features

- Interactive 3D model with orbit controls
- Throttle slider to control engine speed
- Animated N1 (low-pressure) and N2 (high-pressure) spools
- Real-time display of N1 and N2 percentages
- Responsive design

## Components Modeled

- **Fan and Low-Pressure Compressor (N1 spool)**
- **High-Pressure Compressor (N2 spool)**
- **Combustor**
- **High-Pressure Turbine (N2 spool)**
- **Low-Pressure Turbine (N1 spool)**
- **Nacelle and exhaust**

## Getting Started

### Prerequisites

- A modern web browser with WebGL support
- A local web server (required for ES modules)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ge90-turbofan.git
   cd ge90-turbofan
   ```

2. Start a local web server. For example, using Python:
   ```bash
   python3 -m http.server 8000
   ```

3. Open your browser and navigate to `http://localhost:8000`

### Usage

- Use the mouse to orbit around the engine
- Scroll to zoom in/out
- Adjust the throttle slider to change engine speed
- Watch the N1 and N2 percentages update in real-time

## Technical Details

- Built with Three.js using ES modules from CDN
- No build process required
- Uses WebGL for hardware-accelerated rendering
- Responsive canvas that adapts to window size

## Future Improvements

- Add sound effects synchronized with engine speed
- Implement more accurate engine physics
- Add cross-section view
- Include performance metrics display
- Mobile touch controls optimization

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the GE90 turbofan engine
- Built using the Three.js library
