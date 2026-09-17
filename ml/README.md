# RouteSafe AI — Machine Learning (ML) & Risk Intelligence

This module provides the machine learning foundation, synthetic dataset generation, and risk prediction algorithms for RouteSafe AI.

## Architecture

```
ml/
├── risk_model.py          # Predictive risk scoring & explainable AI module
├── synthetic_generator.py # Synthetic campus safety dataset generator
└── README.md              # ML documentation and feature explanations
```

## Features & Mathematical Modeling

1. **Multi-Factor Gradient Features**:
   - `accident_history`: Historical crash and near-miss frequency per 100 meters.
   - `flood_elevation_vulnerability`: Topographical elevation and drainage choke point analysis.
   - `traffic_congestion_index`: Real-time vehicular flow and intersection density.
   - `lux_lighting_deficiency`: Nighttime illumination ratings and Blue-Light pillar proximity.
   - `surface_roughness_potholes`: Pavement roughness and bike lane obstacle counts.

2. **Adverse Weather Non-Linear Coupling**:
   - In heavy rain scenarios, flooding vulnerability does not scale linearly; it triggers high surge factors across low-lying underpasses.
   - The ML model integrates non-linear penalties for combined wet-surface and low-lighting conditions.

3. **Synthetic Dataset Protocol**:
   - All dataset records are generated based on a realistic synthetic college campus transit network.
   - **Important Disclaimer**: All coordinates, incident reports, and risk figures are synthetic demo data created for demonstration and testing purposes; they do not represent real-world municipal safety databases.
