import { NextRequest, NextResponse } from "next/server";
import { ANALYSIS_CACHE } from "@/lib/api-cache";

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id || !ANALYSIS_CACHE[id]) {
      return NextResponse.json(
        { detail: `Analysis report ID '${id || ""}' not found in active session cache.` },
        { status: 404 }
      );
    }

    const result = ANALYSIS_CACHE[id];
    const dateStr = result.timestamp.split(" ")[0]; // "2026-07-04"

    const rows = [
      ["Report ID", result.id],
      ["Timestamp", result.timestamp],
      ["Crop Type", result.crop_info.crop_type],
      ["Overall Health Score", result.crop_info.overall_health],
      ["Disease Detected", result.disease_analysis.disease_detected],
      ["Scientific Name", result.disease_analysis.scientific_name],
      ["Model Confidence (%)", result.disease_analysis.confidence_score],
      ["Severity Level", result.disease_analysis.severity_level],
      ["Severity Percentage (%)", result.severity],
      [],
      ["Recommendation Parameter", "Action Plan Guidelines"],
      ["Immediate Action", result.recommendations.immediate_action],
      ["Fungicide/Pesticide", result.recommendations.fungicide_pesticide],
      ["Watering", result.recommendations.watering],
      ["Fertilizer", result.recommendations.fertilizer],
      ["Soil Management", result.recommendations.soil_management],
      ["Prevention Methods", result.recommendations.prevention_methods],
      ["Monitoring Frequency", result.recommendations.monitoring_frequency]
    ];

    // Standard RFC 4180 CSV escaping helper
    const csvContent = rows
      .map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
      .join("\r\n");

    const filename = `Crop_Report_${dateStr}_${id}.csv`;
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { detail: `Failed to compile CSV data: ${error.message}` },
      { status: 500 }
    );
  }
}
