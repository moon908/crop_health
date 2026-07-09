import { NextRequest, NextResponse } from "next/server";
import { CropAnalyzer } from "@/lib/crop-analyzer";
import { ANALYSIS_CACHE, IMAGE_CACHE } from "@/lib/api-cache";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const cropHint = (formData.get("crop_hint") as string) || "auto";

    if (!file) {
      return NextResponse.json(
        { detail: "No foliar image file was provided in the upload request." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Run the TypeScript vegetative indices analyzer
    const result = CropAnalyzer.analyzeImage(buffer, cropHint);

    // Save outputs in-memory for download endpoints
    const id = result.id;
    ANALYSIS_CACHE[id] = result;
    IMAGE_CACHE[id] = buffer;

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("AI analyze Route Error:", error);
    const msg = error.message || "Foliar scanning failed due to compute error.";
    const status = error.message?.includes("detected") ? 400 : 500;
    
    return NextResponse.json({ detail: msg }, { status });
  }
}
