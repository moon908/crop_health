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

    // Exclude large base64 image strings from JSON report download for network size efficiency
    const cleanResult = Object.fromEntries(
      Object.entries(result).filter(([key]) => !key.endsWith("_base64"))
    );

    const filename = `Crop_Report_${dateStr}_${id}.json`;
    return new NextResponse(JSON.stringify(cleanResult, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { detail: `Failed to compile JSON data: ${error.message}` },
      { status: 500 }
    );
  }
}
