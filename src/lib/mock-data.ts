export interface CropScan {
  id: string;
  timestamp: string;
  cropType: string;
  scanType: 'Leaf Image' | 'Field Drone' | 'Satellite' | 'Field Photo';
  disease: string;
  status: 'Healthy' | 'Warning' | 'Danger';
  confidence: number;
  severity: number;
  fieldId: string;
  gps: [number, number];
  yieldImpact: number;
  analyst: string;
}

export interface WeatherData {
  temp: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  uvIndex: number;
  soilMoisture: number;
  soilTemp: number;
  diseaseRisks: {
    disease: string;
    risk: 'Low' | 'Moderate' | 'High';
    percentage: number;
  }[];
  forecast: {
    day: string;
    temp: number;
    humidity: number;
    rainfall: number;
    condition: 'Sunny' | 'Rainy' | 'Cloudy' | 'Stormy';
  }[];
}

export interface SatelliteMarker {
  id: string;
  gps: [number, number];
  type: 'Healthy' | 'Hotspot' | 'Water Stress' | 'Nutrient Deficient';
  crop: string;
  ndvi: number;
  size: number; // area in hectares
}

export interface AIInsight {
  title: string;
  description: string;
  type: 'alert' | 'recommendation' | 'info';
  timestamp: string;
  field: string;
  parameters: {
    pesticide?: string;
    fertilizer?: string;
    irrigation?: string;
    deficiency?: string;
    recoveryTime?: string;
  };
  references: string[];
}

export interface SampleDataset {
  id: string;
  name: string;
  imagesCount: number;
  classCount: number;
  accuracy: number;
  lastUpdated: string;
  size: string;
}

// Sample leaf cases to simulate Computer Vision disease overlays
export interface CropLeafCase {
  id: string;
  name: string;
  description: string;
  cropType: string;
  disease: string;
  status: 'Healthy' | 'Warning' | 'Danger';
  confidence: number;
  severity: number;
  yieldImpact: number;
  causes: string[];
  recommendations: {
    fertilizer: string;
    pesticide: string;
    water: string;
    preventive: string[];
  };
  references: string[];
}

export const CROP_SCANS: CropScan[] = [
  {
    id: "SCAN-2026-904",
    timestamp: "2026-07-03 14:32:10",
    cropType: "Zea mays (Corn)",
    scanType: "Leaf Image",
    disease: "Cercospora Leaf Spot (Gray Leaf Spot)",
    status: "Warning",
    confidence: 94.8,
    severity: 38.5,
    fieldId: "Field B-12",
    gps: [42.368, -83.352],
    yieldImpact: 12.0,
    analyst: "AI Autopilot",
  },
  {
    id: "SCAN-2026-903",
    timestamp: "2026-07-03 11:15:04",
    cropType: "Glycine max (Soybean)",
    scanType: "Field Drone",
    disease: "Phakopsora pachyrhizi (Asian Soybean Rust)",
    status: "Danger",
    confidence: 98.2,
    severity: 65.0,
    fieldId: "Field A-04",
    gps: [42.375, -83.340],
    yieldImpact: 28.5,
    analyst: "AI Autopilot",
  },
  {
    id: "SCAN-2026-902",
    timestamp: "2026-07-02 18:05:44",
    cropType: "Triticum aestivum (Wheat)",
    scanType: "Satellite",
    disease: "Puccinia graminis (Stem Rust)",
    status: "Danger",
    confidence: 89.1,
    severity: 72.3,
    fieldId: "Field C-09",
    gps: [42.362, -83.365],
    yieldImpact: 45.0,
    analyst: "AI Autopilot",
  },
  {
    id: "SCAN-2026-901",
    timestamp: "2026-07-02 09:22:15",
    cropType: "Zea mays (Corn)",
    scanType: "Field Photo",
    disease: "None (Healthy)",
    status: "Healthy",
    confidence: 99.6,
    severity: 0.0,
    fieldId: "Field B-10",
    gps: [42.370, -83.359],
    yieldImpact: 0.0,
    analyst: "S. Varma (Lab)",
  },
  {
    id: "SCAN-2026-900",
    timestamp: "2026-07-01 16:48:30",
    cropType: "Solanum tuberosum (Potato)",
    scanType: "Leaf Image",
    disease: "Phytophthora infestans (Late Blight)",
    status: "Danger",
    confidence: 97.4,
    severity: 82.1,
    fieldId: "Field D-01",
    gps: [42.382, -83.332],
    yieldImpact: 60.0,
    analyst: "AI Autopilot",
  },
  {
    id: "SCAN-2026-899",
    timestamp: "2026-06-30 10:14:55",
    cropType: "Zea mays (Corn)",
    scanType: "Field Drone",
    disease: "Bipolaris maydis (Southern Corn Leaf Blight)",
    status: "Warning",
    confidence: 91.5,
    severity: 24.8,
    fieldId: "Field B-12",
    gps: [42.367, -83.354],
    yieldImpact: 8.5,
    analyst: "AI Autopilot",
  },
  {
    id: "SCAN-2026-898",
    timestamp: "2026-06-29 08:30:12",
    cropType: "Glycine max (Soybean)",
    scanType: "Leaf Image",
    disease: "Septoria glycines (Brown Spot)",
    status: "Warning",
    confidence: 88.7,
    severity: 18.2,
    fieldId: "Field A-02",
    gps: [42.372, -83.348],
    yieldImpact: 5.0,
    analyst: "S. Varma (Lab)",
  },
  {
    id: "SCAN-2026-897",
    timestamp: "2026-06-28 14:02:11",
    cropType: "Triticum aestivum (Wheat)",
    scanType: "Satellite",
    disease: "None (Healthy)",
    status: "Healthy",
    confidence: 98.9,
    severity: 0.0,
    fieldId: "Field C-04",
    gps: [42.361, -83.360],
    yieldImpact: 0.0,
    analyst: "AI Autopilot",
  }
];

export const WEATHER_DATA: WeatherData = {
  temp: 24.5,
  humidity: 78.0,
  rainfall: 12.4, // mm in last 24h
  windSpeed: 14.8, // km/h
  uvIndex: 6,
  soilMoisture: 42.8, // % volumetric water content
  soilTemp: 21.2, // °C
  diseaseRisks: [
    { disease: "Late Blight (Phytophthora)", risk: "High", percentage: 88 },
    { disease: "Leaf Rust (Puccinia)", risk: "Moderate", percentage: 55 },
    { disease: "Gray Leaf Spot (Cercospora)", risk: "Low", percentage: 24 }
  ],
  forecast: [
    { day: "Mon", temp: 25, humidity: 76, rainfall: 4.2, condition: "Cloudy" },
    { day: "Tue", temp: 27, humidity: 72, rainfall: 0.0, condition: "Sunny" },
    { day: "Wed", temp: 24, humidity: 85, rainfall: 15.6, condition: "Stormy" },
    { day: "Thu", temp: 22, humidity: 82, rainfall: 8.4, condition: "Rainy" },
    { day: "Fri", temp: 23, humidity: 78, rainfall: 1.2, condition: "Cloudy" },
    { day: "Sat", temp: 25, humidity: 70, rainfall: 0.0, condition: "Sunny" },
    { day: "Sun", temp: 26, humidity: 68, rainfall: 0.0, condition: "Sunny" }
  ]
};

export const SATELLITE_MARKERS: SatelliteMarker[] = [
  { id: "MARKER-1", gps: [42.375, -83.340], type: "Hotspot", crop: "Soybean", ndvi: 0.38, size: 14.5 },
  { id: "MARKER-2", gps: [42.368, -83.352], type: "Water Stress", crop: "Corn", ndvi: 0.52, size: 22.1 },
  { id: "MARKER-3", gps: [42.362, -83.365], type: "Nutrient Deficient", crop: "Wheat", ndvi: 0.45, size: 18.0 },
  { id: "MARKER-4", gps: [42.382, -83.332], type: "Hotspot", crop: "Potato", ndvi: 0.31, size: 8.2 },
  { id: "MARKER-5", gps: [42.370, -83.359], type: "Healthy", crop: "Corn", ndvi: 0.81, size: 30.4 },
  { id: "MARKER-6", gps: [42.361, -83.360], type: "Healthy", crop: "Wheat", ndvi: 0.78, size: 12.0 }
];

export const AI_INSIGHTS: AIInsight[] = [
  {
    title: "Asian Soybean Rust Expansion Alert",
    description: "Satellite imagery and temperature curves indicate severe rust progression in the Northeast sectors of Field A-04. Visual inspection shows orange-brown pustules forming on bottom leaves.",
    type: "alert",
    timestamp: "2026-07-03 11:15:04",
    field: "Field A-04",
    parameters: {
      pesticide: "Triazole + Strobilurin Fungicide Cocktail",
      deficiency: "N/A",
      recoveryTime: "14 - 21 Days",
    },
    references: [
      "APS Journal: Phakopsora pachyrhizi Epidemiology (2024)",
      "USDA Rust Risk Guidelines (Doc-4022)"
    ]
  },
  {
    title: "Nitrogen Depletion Warning",
    description: "NDVI and red-edge spectral indices show general canopy chlorosis in Field B-12. Plant tissue analysis confirms a critical nitrogen level below 2.5%.",
    type: "recommendation",
    timestamp: "2026-07-02 14:20:00",
    field: "Field B-12",
    parameters: {
      fertilizer: "Liquid Urea-Ammonium Nitrate (UAN-32) at 45 lbs/acre",
      irrigation: "Slightly increase drip speed by 10% to aid absorption",
      deficiency: "Nitrogen (N)",
    },
    references: [
      "Journal of Precision Agriculture: Spectral N Sensors (2023)",
      "University Extension Guide: Corn Nutrient Needs"
    ]
  },
  {
    title: "Blight Disease Forecast Warning",
    description: "Elevated humidity (>80%) and persistent moderate temperatures forecast for Wednesday-Thursday represent extreme blight growth indices for Field D-01.",
    type: "alert",
    timestamp: "2026-07-03 08:00:00",
    field: "Field D-01",
    parameters: {
      pesticide: "Chlorothalonil or Mancozeb preventive cover spray",
      recoveryTime: "Prophylactic Action",
    },
    references: [
      "EPPO Global Database: Phytophthora Predictor Models"
    ]
  }
];

export const DATASETS: SampleDataset[] = [
  { id: "DS-CORN-01", name: "Zea Mays Diagnostic Database", imagesCount: 14200, classCount: 6, accuracy: 96.8, lastUpdated: "2026-06-25", size: "4.2 GB" },
  { id: "DS-SOY-04", name: "Glycine Max Leaf Rust Pathology", imagesCount: 8800, classCount: 4, accuracy: 98.2, lastUpdated: "2026-07-01", size: "2.8 GB" },
  { id: "DS-WHEAT-02", name: "Triticum Aestivum Rust Spectral", imagesCount: 22400, classCount: 8, accuracy: 94.1, lastUpdated: "2026-05-18", size: "8.6 GB" },
  { id: "DS-POTATO-01", name: "Solanum Late Blight Segmentations", imagesCount: 5200, classCount: 3, accuracy: 97.4, lastUpdated: "2026-06-12", size: "1.5 GB" }
];

export const LEAF_CASES: CropLeafCase[] = [
  {
    id: "case-corn-spot",
    name: "Corn Gray Leaf Spot (Sample)",
    description: "Corn leaf displaying rectangular tan-to-gray necrotic lesions bounded by parallel leaf veins. Typical of Cercospora zeae-maydis pathogen.",
    cropType: "Zea mays (Corn)",
    disease: "Gray Leaf Spot (Cercospora zeae-maydis)",
    status: "Warning",
    confidence: 94.8,
    severity: 38.5,
    yieldImpact: 12.0,
    causes: [
      "Infected crop residue left on soil surface from previous harvest.",
      "Extended periods of high relative humidity (>90%) and leaf wetness.",
      "Moderate to warm temperatures (24°C - 32°C)."
    ],
    recommendations: {
      fertilizer: "Apply potassium-rich nutrition to strengthen cell wall structures.",
      pesticide: "Group 3 (DMI) or Group 11 (QoI) Fungicide spray (e.g., Pyraclostrobin).",
      water: "Switch to morning overhead irrigation or subsurface drip irrigation to reduce foliar leaf wetness duration.",
      preventive: [
        "Select disease-resistant hybrid seeds next season.",
        "Perform deep tillage or crop rotation with soybeans for 1-2 seasons.",
        "Ensure adequate spacing between plants to facilitate air drainage."
      ]
    },
    references: [
      "Purdue Extension Guide: Gray Leaf Spot of Corn (BP-56-W)",
      "Compendium of Corn Diseases, Fourth Edition (APS Press)"
    ]
  },
  {
    id: "case-soy-rust",
    name: "Soybean Leaf Rust (Sample)",
    description: "Soybean leaf infected with Phakopsora pachyrhizi, showing dense clusters of small tan/brown lesions and pustules containing powdery urediniospores.",
    cropType: "Glycine max (Soybean)",
    disease: "Asian Soybean Rust (Phakopsora pachyrhizi)",
    status: "Danger",
    confidence: 98.2,
    severity: 65.0,
    yieldImpact: 28.5,
    causes: [
      "Spores transported via long-distance wind currents.",
      "Prolonged leaf wetness of 6-10 hours at temperatures between 15°C and 28°C.",
      "High plant density creating a damp microclimate canopy."
    ],
    recommendations: {
      fertilizer: "Standard N-P-K balancer, minimize high-dose nitrogen which stimulates lush, vulnerable foliage.",
      pesticide: "Triazole + Strobilurin premix (e.g., Priaxor or Trivapro) applied immediately.",
      water: "Maintain precise soil moisture; avoid overhead sprinkler systems completely during infection period.",
      preventive: [
        "Plant early-maturing cultivars to escape peak spore periods.",
        "Scout field border rows and lower leaves weekly starting at vegetative stage V2.",
        "Maintain clean borders free of alternative legume hosts like kudzu."
      ]
    },
    references: [
      "Iowa State Integrated Crop Management: Asian Soybean Rust Biology",
      "Phytopathology Journal: Spore dispersal dynamics of Phakopsora pachyrhizi (2025)"
    ]
  },
  {
    id: "case-potato-blight",
    name: "Potato Late Blight (Sample)",
    description: "Potato leaf exhibiting large dark green/black water-soaked lesions that spread rapidly, surrounded by a light yellow halo. White mold growth is present on the leaf underside.",
    cropType: "Solanum tuberosum (Potato)",
    disease: "Late Blight (Phytophthora infestans)",
    status: "Danger",
    confidence: 97.4,
    severity: 82.1,
    yieldImpact: 60.0,
    causes: [
      "Contaminated potato seed tubers or cull piles.",
      "Cool, wet weather (15°C - 21°C) with persistent fog, dew, or rain.",
      "Survival of oospores or sporangia in soil."
    ],
    recommendations: {
      fertilizer: "Suspend nitrogen applications; apply calcium chelate to enhance tuber skin integrity.",
      pesticide: "Systemic oomycete-targeted fungicide such as Mefenoxam or Fluopicolide.",
      water: "Stop irrigation immediately until rainfall stops and leaf surfaces dry.",
      preventive: [
        "Destroy cull piles and volunteer potatoes near fields.",
        "Implement a strict 3-year crop rotation pattern.",
        "Apply preventive copper-based fungicides before rain events in late spring."
      ]
    },
    references: [
      "Cornell Cooperative Extension: Phytophthora infestans Management Guide",
      "USDA Potato Late Blight Taskforce Bulletins (2024)"
    ]
  }
];
