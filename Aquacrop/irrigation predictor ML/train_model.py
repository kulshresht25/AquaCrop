import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
import joblib

# Load dataset
df = pd.read_csv("irrigation_prediction.csv")

# Rename columns to internal standard
COLUMN_MAP = {
    "Soil_Type": "SOIL",
    "Soil_Moisture": "SOIL_MOISTURE",
    "Temperature_C": "TEMP",
    "Humidity": "HUMIDITY",
    "Crop_Type": "CROP",
    "Crop_Growth_Stage": "GROWTH_STAGE",
    "Season": "SEASON",
    "Water_Source": "WATER_SOURCE",
    "Field_Area_hectare": "FIELD_AREA",
    "Region": "REGION",
    "Irrigation_Need": "IRRIGATION_NEEDED"
}
df = df.rename(columns=COLUMN_MAP)

# Categorical columns
cat_cols = [
    "SOIL", "CROP", "GROWTH_STAGE",
    "SEASON", "WATER_SOURCE", "REGION"
]

# Normalize & encode
encoders = {}
for col in cat_cols:
    df[col] = df[col].astype(str).str.strip().str.upper()
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    encoders[col] = le

# Features & target
X = df[
    [
        "SOIL",
        "SOIL_MOISTURE",
        "TEMP",
        "HUMIDITY",
        "CROP",
        "GROWTH_STAGE",
        "SEASON",
        "WATER_SOURCE",
        "FIELD_AREA",
        "REGION"
    ]
]
y = df["IRRIGATION_NEEDED"]

# Train classifier
model = RandomForestClassifier(
    n_estimators=500,
    random_state=42
)
model.fit(X, y)

# Save artifacts
joblib.dump(model, "irrigation_need_model.pkl")
joblib.dump(encoders, "encoders.pkl")

print("✅ Irrigation-Need ML Model Trained Successfully")