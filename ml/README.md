# RouteSafe AI — Machine Learning Risk Module

## Overview
The **RouteSafe AI ML Module** complements rule-based corridor hazard weighting with a machine-learned predictive regression engine. The system predicts an overall risk score ($0–100$) for pedestrian corridors based on situational hazard attributes, environmental weather telemetry, and temporal factors.

> **CRITICAL DISCLAIMER**  
> **All location, hazard, and ML training data used in this demo are strictly synthetic and intended for demonstration purposes.**  
> Do not claim real-world prediction accuracy.

---

## Directory Architecture
```
ml/
├── dataset.py        # Synthetic dataset generator with multi-factor interactions
├── model.py          # Scikit-learn Pipeline (ColumnTransformer + RandomForestRegressor)
├── train.py          # Model fitting, evaluation (MAE, RMSE, R²), and artifact serialization
├── predictor.py      # Runtime inference engine with explainability and fallback
├── synthetic_safety_dataset.csv  # Generated synthetic training corpus
├── route_risk_model.joblib       # Serialized trained model pipeline
└── README.md         # Documentation and methodology
```

---

## Model Specification
- **Algorithm**: `RandomForestRegressor`
  - `n_estimators`: 100
  - `max_depth`: 10
  - `min_samples_split`: 4
  - `min_samples_leaf`: 2
  - `random_state`: 42
- **Preprocessor**:
  - `StandardScaler` on continuous hazard scores (`accident_risk`, `flood_risk`, `traffic_risk`, `lighting_risk`, `road_condition`)
  - `OneHotEncoder` on contextual categories (`weather_condition`, `time_of_day`, `day_type`)
- **Target Variable**: Continuous Risk Score ($0–100$)
  - $0–30$: **LOW RISK** (Green)
  - $31–60$: **MEDIUM RISK** (Yellow)
  - $61–100$: **HIGH RISK** (Red)

---

## Feature Attributes
| Feature | Type | Range / Values | Description |
|---|---|---|---|
| `accident_risk` | Continuous | 0 – 100 | Historical vehicle-pedestrian collision incidence |
| `flood_risk` | Continuous | 0 – 100 | Topographic drainage and underpass inundation vulnerability |
| `traffic_risk` | Continuous | 0 – 100 | Peak vehicular congestion and vehicle speed metrics |
| `lighting_risk` | Continuous | 0 – 100 | Lux photometer deficit and broken streetlight frequency |
| `road_condition` | Continuous | 0 – 100 | Pavement roughness, open potholes, and sidewalk degradation |
| `weather_condition` | Categorical | Clear, Rain, Heavy Rain, Fog | Atmospheric weather state |
| `time_of_day` | Categorical | Morning, Afternoon, Evening, Night | Diurnal temporal window |
| `day_type` | Categorical | Weekday, Weekend | Transit traffic pattern classification |

---

## Training & Running
To train the model:
```bash
python3 -m ml.train
```

To test inference:
```python
from ml.predictor import predict_route_risk

result = predict_route_risk(
    accident_risk=30.0,
    flood_risk=75.0,
    traffic_risk=45.0,
    lighting_risk=60.0,
    road_condition=40.0,
    weather_condition="Heavy Rain",
    time_of_day="Night",
    day_type="Weekday"
)
print("Predicted ML Risk Score:", result["ml_score"])
print("Primary Contributor:", result["primary_contributor"])
```
