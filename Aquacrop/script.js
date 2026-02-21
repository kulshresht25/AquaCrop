/* ================= FIREBASE CONFIG ================= */
firebase.initializeApp({
  apiKey: "AIzaSyCPWc3EQs00wW1GetgTSLlC1UsfcBF7kC4",
  databaseURL: "https://aquacrop-d2c9c-default-rtdb.firebaseio.com",
});

const db = firebase.database();
let userId = "user_001";

/* ================= SENSOR DATA ================= */
db.ref("sensor_data/" + userId).on("value", snap => {
  const d = snap.val();
  if (!d) return;

  temp.innerText = d.temperature ?? "--";
  soilVal.innerText = d.soil_moisture ?? "--";
  light.innerText = d.light ?? "--";
  flow.innerText = d.flow_rate ?? "--";

  updateCharts(d.flow_rate ?? 0, d.soil_moisture ?? 0);
});

/* ================= PUMP STATUS ================= */
db.ref("irrigation_status/" + userId + "/pump")
  .on("value", snap => pump.innerText = snap.val() ?? "--");

/* ================= ML PREDICTION ================= */
db.ref("ml_predictions/" + userId).on("value", snap => {
  const d = snap.val();
  if (!d) return;

  mlLevel.innerText = d.irrigation_level ?? "--";
  mlType.innerText = d.irrigation_type ?? "--";
});

/* ================= SAVE CONFIG ================= */
function saveConfig() {
  db.ref("farm_config/" + userId).set({
    crop: crop.value,
    growth_stage: growth_stage.value,
    soil: soil.value,
    region: region.value,
    season: season.value,
    field_area: parseFloat(field_area.value),
    water_source: water_source.value
  }).then(() => alert("Configuration saved"));
}

/* ================= LOAD CONFIG ================= */
db.ref("farm_config/" + userId).on("value", snap => {
  const c = snap.val();
  if (!c) return;

  crop.value = c.crop;
  growth_stage.value = c.growth_stage;
  soil.value = c.soil;
  region.value = c.region;
  season.value = c.season;
  field_area.value = c.field_area;
  water_source.value = c.water_source;
});

/* ================= PUMP CONTROL ================= */
function setPump(state) {
  db.ref("irrigation_status/" + userId).set({ pump: state });
}

/* ================= FARM SELECT ================= */
function selectFarm(id) {
  userId = id;
  location.reload();
}

/* ================= CHARTS ================= */
const flowCtx = document.getElementById("flowChart").getContext("2d");
const soilCtx = document.getElementById("soilChart").getContext("2d");

let flowData = {
  labels: [],
  datasets: [{
    label: "Flow Rate (L/min)",
    data: [],
    borderColor: "blue",
    fill: false
  }]
};

let flowChart = new Chart(flowCtx, {
  type: "line",
  data: flowData,
  options: { responsive: true }
});

let soilChart = new Chart(soilCtx, {
  type: "pie",
  data: {
    labels: ["Dry", "Optimal", "Wet"],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ["red", "green", "blue"]
    }]
  }
});

/* ================= LANGUAGE LABELS ================= */
const LANG = {
  en: {
    title: "AquaCrop Smart Irrigation",
    cfg: "Farm Configuration",
    crop: "Crop Type",
    growth: "Crop Growth Stage",
    soil: "Soil Type",
    region: "Region",
    season: "Season",
    area: "Field Area (hectare)",
    water: "Water Source",
    save: "Save Configuration",
    sensors: "Live Sensor Data",
    temp: "Temperature",
    soilM: "Soil Moisture",
    light: "Light",
    flow: "Flow Rate",
    pump: "Pump",
    ml: "ML Prediction",
    irrNeed: "Irrigation Need",
    irrType: "Irrigation Type",
    analytics: "Data Analysis",
    on: "ON",
    off: "OFF"
  },
  hi: {
    title: "एक्वाक्रॉप स्मार्ट सिंचाई",
    cfg: "खेत की जानकारी",
    crop: "फसल प्रकार",
    growth: "फसल अवस्था",
    soil: "मिट्टी का प्रकार",
    region: "क्षेत्र",
    season: "मौसम",
    area: "खेत का क्षेत्र (हेक्टेयर)",
    water: "पानी का स्रोत",
    save: "सेटिंग सहेजें",
    sensors: "लाइव सेंसर डेटा",
    temp: "तापमान",
    soilM: "मिट्टी की नमी",
    light: "रोशनी",
    flow: "पानी का प्रवाह",
    pump: "पंप",
    ml: "एमएल पूर्वानुमान",
    irrNeed: "सिंचाई आवश्यकता",
    irrType: "सिंचाई प्रकार",
    analytics: "डेटा विश्लेषण",
    on: "चालू",
    off: "बंद"
  },
  mr: {
    title: "एक्वाक्रॉप स्मार्ट सिंचन",
    cfg: "शेत माहिती",
    crop: "पिकाचा प्रकार",
    growth: "पिकाची अवस्था",
    soil: "मातीचा प्रकार",
    region: "प्रदेश",
    season: "हंगाम",
    area: "शेती क्षेत्र (हेक्टर)",
    water: "पाण्याचा स्रोत",
    save: "सेटिंग जतन करा",
    sensors: "थेट सेन्सर डेटा",
    temp: "तापमान",
    soilM: "मातीतील ओलावा",
    light: "प्रकाश",
    flow: "पाण्याचा प्रवाह",
    pump: "पंप",
    ml: "एमएल अंदाज",
    irrNeed: "सिंचन गरज",
    irrType: "सिंचन प्रकार",
    analytics: "डेटा विश्लेषण",
    on: "चालू",
    off: "बंद"
  }
};

/* ================= DROPDOWN OPTIONS ================= */
const OPTIONS = {
  en: {
    crop: { Wheat:"Wheat", Rice:"Rice", Maize:"Maize", Sugarcane:"Sugarcane", Cotton:"Cotton", Potato:"Potato" },
    growth: { Sowing:"Sowing", Vegetative:"Vegetative", Flowering:"Flowering", Harvest:"Harvest" },
    soil: { Sandy:"Sandy", Loamy:"Loamy", Clay:"Clay", Silty:"Silty" },
    region: { Central:"Central", North:"North", South:"South", East:"East", West:"West" },
    season: { Rabi:"Rabi", Kharif:"Kharif", Zaid:"Zaid" },
    water: { Groundwater:"Groundwater", River:"River", Rainwater:"Rainwater", Reservoir:"Reservoir" }
  },
  hi: {
    crop: { Wheat:"गेहूं", Rice:"चावल", Maize:"मक्का", Sugarcane:"गन्ना", Cotton:"कपास", Potato:"आलू" },
    growth: { Sowing:"बुवाई", Vegetative:"विकास अवस्था", Flowering:"फूल अवस्था", Harvest:"कटाई" },
    soil: { Sandy:"रेतीली", Loamy:"दोमट", Clay:"चिकनी", Silty:"गादयुक्त" },
    region: { Central:"मध्य", North:"उत्तर", South:"दक्षिण", East:"पूर्व", West:"पश्चिम" },
    season: { Rabi:"रबी", Kharif:"खरीफ", Zaid:"ज़ायद" },
    water: { Groundwater:"भूजल", River:"नदी", Rainwater:"वर्षा जल", Reservoir:"जलाशय" }
  },
  mr: {
    crop: { Wheat:"गहू", Rice:"तांदूळ", Maize:"मका", Sugarcane:"ऊस", Cotton:"कापूस", Potato:"बटाटा" },
    growth: { Sowing:"पेरणी", Vegetative:"वाढ अवस्था", Flowering:"फुल अवस्था", Harvest:"कापणी" },
    soil: { Sandy:"वालुकामय", Loamy:"दुमट", Clay:"चिकण", Silty:"गाळयुक्त" },
    region: { Central:"मध्य", North:"उत्तर", South:"दक्षिण", East:"पूर्व", West:"पश्चिम" },
    season: { Rabi:"रब्बी", Kharif:"खरीप", Zaid:"झायद" },
    water: { Groundwater:"भूजल", River:"नदी", Rainwater:"पावसाचे पाणी", Reservoir:"जलाशय" }
  }
};

/* ================= LANGUAGE HANDLER ================= */
function translateSelect(id, map) {
  const sel = document.getElementById(id);
  [...sel.options].forEach(opt => {
    if (map[opt.value]) opt.textContent = map[opt.value];
  });
}

function setLanguage(l) {
  const t = LANG[l];

  appTitle.innerText = "🌱 " + t.title;
  cfgTitle.innerText = "⚙ " + t.cfg;

  lblCrop.innerText = t.crop;
  lblgrow.innerText = t.growth;
  lblSoil.innerText = t.soil;
  lblRegion.innerText = t.region;
  lblSeason.innerText = t.season;
  lblArea.innerText = t.area;
  lblWater.innerText = t.water;

  saveBtn.innerText = "💾 " + t.save;

  sensorTitle.innerText = "📟 " + t.sensors;
  txtTemp.innerText = "🌡 " + t.temp;
  txtSoil.innerText = "🌾 " + t.soilM;
  txtLight.innerText = "☀ " + t.light;
  txtFlow.innerText = "🚰 " + t.flow;
  txtPump.innerText = "🔌 " + t.pump;

  mlTitle.innerText = "🤖 " + t.ml;
  lblIrrNeed.innerText = t.irrNeed + ":";
  lblIrrType.innerText = t.irrType + ":";

  anaTitle.innerText = "📊 " + t.analytics;

  document.querySelector(".on").innerText = t.on;
  document.querySelector(".off").innerText = t.off;

  translateSelect("crop", OPTIONS[l].crop);
  translateSelect("growth_stage", OPTIONS[l].growth);
  translateSelect("soil", OPTIONS[l].soil);
  translateSelect("region", OPTIONS[l].region);
  translateSelect("season", OPTIONS[l].season);
  translateSelect("water_source", OPTIONS[l].water);
}

/* ================= CHART UPDATE ================= */
function updateCharts(flow, soil) {
  const time = new Date().toLocaleTimeString();

  flowData.labels.push(time);
  flowData.datasets[0].data.push(flow);

  if (flowData.labels.length > 8) {
    flowData.labels.shift();
    flowData.datasets[0].data.shift();
  }

  flowChart.update();

  soilChart.data.datasets[0].data = [
    soil < 40 ? 1 : 0,
    soil >= 40 && soil <= 70 ? 1 : 0,
    soil > 70 ? 1 : 0
  ];
  soilChart.update();
} 