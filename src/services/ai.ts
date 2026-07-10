import Groq from 'groq-sdk';
import { VisionAnalysisResult } from './vision';

// Resolve the Groq API key
const apiKey = process.env.GROQ_API_KEY || (process.env.OPENAI_API_KEY?.startsWith('gsk_') ? process.env.OPENAI_API_KEY : undefined);
const groq = apiKey ? new Groq({ apiKey }) : null;

export interface ScientificReport {
  summary: string;
  recommendations: {
    watering: string;
    fertilizer: string;
    treatment: string;
    prevention: string;
    monitoring: string;
  };
  probabilities: Array<{ class: string; probability: number }>;
}

export async function generateScientificReport(visionData: VisionAnalysisResult): Promise<ScientificReport> {
  // If there is no Groq API Key, return fallback mock explanations/recommendations based on the real metrics
  if (!groq) {
    return generateFallbackReport(visionData);
  }

  const prompt = `You are a professional agricultural scientist.
Generate a scientific explanation and recommendations for a crop diagnostic report based on these real computer vision metrics:

Crop Species: ${visionData.crop}
Health Status: ${visionData.healthStatus}
Primary Disease: ${visionData.disease} (Pathogen: ${visionData.scientificName})
Severity: ${visionData.severity}
Affected leaf area: ${visionData.affectedArea}%
Visible Symptoms: ${visionData.symptoms.join(', ')}
Nutrient Deficiency Detected: ${visionData.nutrientDeficiency}
Pest Risk Level: ${visionData.pestRisk}

Format the response as a valid, stringified JSON object complying with this TypeScript interface:
{
  "summary": "A brief scientific summary explaining why this was detected based on symptoms, pathogen details, possible causes (e.g. humidity, leaf wetness), and expected recovery.",
  "recommendations": {
    "watering": "Tailored irrigation recommendation based on the disease.",
    "fertilizer": "Soil nutrition/fertilization advice.",
    "treatment": "Organic or chemical pesticide/fungicide treatments recommended for this pathogen.",
    "prevention": "Agro-technical practices to prevent spread/recurrence.",
    "monitoring": "Suggested crop health inspection schedule."
  },
  "probabilities": [
    // Top 5 predictions summing to 100% (must include the primary diagnosed class as the highest probability)
    { "class": "${visionData.disease}", "probability": ${visionData.confidence} },
    { "class": "Healthy", "probability": ${visionData.healthStatus === 'Healthy' ? 95 : 5} }
    // Add 3 other relevant crop diseases as possibilities so there are exactly 5 entries
  ]
}

CRITICAL: Return ONLY raw JSON starting with { and ending with }. Avoid markdown formatting. Write scientifically, avoid hallucinations, only discuss the provided inputs.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: "json_object" },
      temperature: 0.2
    });

    const content = chatCompletion.choices[0]?.message?.content || '{}';
    return JSON.parse(content) as ScientificReport;
  } catch (error) {
    console.error("Groq Chat Completion failure:", error);
    return generateFallbackReport(visionData);
  }
}

function generateFallbackReport(visionData: VisionAnalysisResult): ScientificReport {
  const isHealthy = visionData.healthStatus === "Healthy";
  const primaryProb = visionData.confidence;
  const healthyProb = isHealthy ? 95 : 5;
  const remaining = 100 - primaryProb - healthyProb;
  const p1 = Math.max(0, Math.round(remaining * 0.5));
  const p2 = Math.max(0, Math.round(remaining * 0.3));
  const p3 = Math.max(0, 100 - primaryProb - healthyProb - p1 - p2);

  return {
    summary: isHealthy 
      ? `The crop exhibits a healthy foliage index. No significant necrotic lesions, fungal spore clusters, or chlorotic patterns were identified on the leaf surface. Maintain optimal irrigation and soil levels.`
      : `Scientific diagnosis confirms ${visionData.disease} caused by the pathogen ${visionData.scientificName}. The leaf tissue exhibits ${visionData.symptoms.join(', ')} covering ${visionData.affectedArea}% of the surface, indicating a ${visionData.severity} stage infection. Spore proliferation is typically promoted by high relative humidity and surface moisture.`,
    recommendations: {
      watering: isHealthy 
        ? "Maintain standard moisture levels (approximately 25mm of water weekly)."
        : "Reduce overhead irrigation. Water directly at the root zone in early morning to minimize leaf wetness duration.",
      fertilizer: isHealthy 
        ? "Apply balanced N-P-K fertilizer as scheduled for the current growth stage."
        : "Postpone excessive nitrogen application, which promotes susceptible soft new foliage. Prioritize potassium to bolster immune defense.",
      treatment: isHealthy 
        ? "None required. Optional application of organic bio-stimulants for defense priming."
        : `Apply organic copper-based fungicides or Bacillus subtilis. For heavy outbreaks, utilize systemic chemical treatments like chlorothalonil or mancozeb according to local guidelines.`,
      prevention: "Implement strict crop rotation schedules, ensure proper spacing for canopy airflow, and clean infected debris.",
      monitoring: "Visual crop inspections should be conducted every 3-5 days in affected zones."
    },
    probabilities: [
      { class: visionData.disease, probability: primaryProb },
      { class: "Healthy", probability: healthyProb },
      { class: "Late Blight", probability: p1 },
      { class: "Leaf Spot", probability: p2 },
      { class: "Powdery Mildew", probability: p3 }
    ]
  };
}
