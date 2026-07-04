export interface BoundingBox {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  w: number; // percentage 0-100
  h: number; // percentage 0-100
  label: string;
  confidence: number;
}

export interface PredictionProb {
  disease: string;
  probability: number;
}

export interface AIAnalysisResult {
  id: string;
  timestamp: string;
  crop_info: {
    crop_type: string;
    growth_stage: string;
    leaf_condition: string;
    overall_health: number; // 0-100
  };
  disease_analysis: {
    disease_detected: string;
    scientific_name: string;
    confidence_score: number; // 0-100
    severity_level: 'Low' | 'Medium' | 'High' | 'Critical';
    probability: number;
    top_5_predictions: PredictionProb[];
  };
  visual_findings: {
    spots: number;
    yellowing: number;
    dry_areas: number;
    mold: number;
    pest_damage: number;
    nutrient_deficiency: number;
  };
  ai_explanation: string;
  recommendations: {
    immediate_action: string;
    fungicide_pesticide: string;
    watering: string;
    fertilizer: string;
    soil_management: string;
    prevention_methods: string;
    monitoring_frequency: string;
  };
  original_image_base64: string;
  mask_image_base64: string;
  heatmap_image_base64: string;
  bounding_boxes: BoundingBox[];
  
  // Compatibility fields for the rest of the application to prevent breakage
  name: string;
  description: string;
  cropType: string;
  disease: string;
  status: 'Healthy' | 'Warning' | 'Danger';
  confidence: number;
  severity: number;
  yieldImpact: number;
  causes: string[];
  references: string[];
}
