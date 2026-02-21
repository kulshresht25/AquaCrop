import time
import joblib
import firebase_admin
from firebase_admin import credentials, db

# ---------- FIREBASE INIT ----------
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred, {
    "databaseURL": "https://aquacrop-d2c9c-default-rtdb.firebaseio.com"
})

# ---------- LOAD ML ----------
model = joblib.load("irrigation_need_model.pkl")
encoders = joblib.load("encoders.pkl")

USER_ID = "user_001"

# ---------- ENCODER ----------
def encode(col, val):
    return encoders[col].transform([val.strip().upper()])[0]

# ---------- IRRIGATION LEVEL ----------
def irrigation_level(sensor):
    moisture = sensor["soil_moisture"]

    if moisture > 65:
        return "LOW"
    elif 35 <= moisture <= 65:
        return "MEDIUM"
    else:
        return "HIGH"

# ---------- IRRIGATION TYPE ----------
def irrigation_type(config):
    soil = config["soil"]
    source = config["water_source"]

    if source == "RAINWATER":
        return "RAINFED"

    if soil == "SANDY":
        return "DRIP"

    if soil == "LOAMY":
        return "SPRINKLER"

    if soil == "CLAY":
        return "CANAL"

    return "SPRINKLER"

print("🤖 Smart Irrigation Advisory Service Started")

# ---------- MAIN LOOP ----------
while True:
    try:
        sensor = db.reference(f"sensor_data/{USER_ID}").get()
        cfg = db.reference(f"farm_config/{USER_ID}").get()

        if not sensor or not cfg:
            time.sleep(5)
            continue

        X = [[
            encode("SOIL", cfg["soil"]),
            sensor["soil_moisture"],
            sensor["temperature"],
            sensor["humidity"],
            encode("CROP", cfg["crop"]),
            encode("GROWTH_STAGE", cfg["growth_stage"]),
            encode("SEASON", cfg["season"]),
            encode("WATER_SOURCE", cfg["water_source"]),
            cfg["field_area"],
            encode("REGION", cfg["region"])
        ]]

        # ML decision
        irrigation_needed = bool(model.predict(X)[0])

        # Advisory outputs
        level = irrigation_level(sensor)
        itype = irrigation_type(cfg) if irrigation_needed else "NONE"

        # ---------- FIREBASE UPDATE ----------
        db.reference(f"ml_predictions/{USER_ID}").set({
            "irrigation_needed": irrigation_needed,
            "irrigation_level": level,
            "irrigation_type": itype,
            "timestamp": int(time.time())
        })

        # ---------- CMD OUTPUT ----------
        print(
            f"Irrigation Needed: {irrigation_needed} | "
            f"Level: {level} | "
            f"Type: {itype}"
        )

    except Exception as e:
        print("⚠ Prediction error:", e)

    time.sleep(5)