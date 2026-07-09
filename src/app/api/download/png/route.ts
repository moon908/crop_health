import { NextRequest, NextResponse } from "next/server";
import jpeg from "jpeg-js";
import { PNG } from "pngjs";
import { ANALYSIS_CACHE, IMAGE_CACHE } from "@/lib/api-cache";

// Helper to draw bounding box borders directly on raw Uint8Array/Buffer pixel data
function drawBoundingBox(
  width: number,
  height: number,
  data: Uint8Array | Buffer,
  x: number,
  y: number,
  w: number,
  h: number,
  color: [number, number, number],
  thickness: number
) {
  // Clamps coordinates to keep pixels inside image boundaries
  const clamp = (val: number, max: number) => Math.max(0, Math.min(max - 1, val));

  for (let t = 0; t < thickness; t++) {
    // Top and Bottom Horizontal Lines
    for (let cx = x; cx < x + w; cx++) {
      const clampedX = clamp(cx, width);

      // Top line pixel
      const topY = clamp(y + t, height);
      const topIdx = (topY * width + clampedX) * 4;
      data[topIdx] = color[0];
      data[topIdx + 1] = color[1];
      data[topIdx + 2] = color[2];

      // Bottom line pixel
      const bottomY = clamp(y + h - 1 - t, height);
      const bottomIdx = (bottomY * width + clampedX) * 4;
      data[bottomIdx] = color[0];
      data[bottomIdx + 1] = color[1];
      data[bottomIdx + 2] = color[2];
    }

    // Left and Right Vertical Lines
    for (let cy = y; cy < y + h; cy++) {
      const clampedY = clamp(cy, height);

      // Left line pixel
      const leftX = clamp(x + t, width);
      const leftIdx = (clampedY * width + leftX) * 4;
      data[leftIdx] = color[0];
      data[leftIdx + 1] = color[1];
      data[leftIdx + 2] = color[2];

      // Right line pixel
      const rightX = clamp(x + w - 1 - t, width);
      const rightIdx = (clampedY * width + rightX) * 4;
      data[rightIdx] = color[0];
      data[rightIdx + 1] = color[1];
      data[rightIdx + 2] = color[2];
    }
  }
}

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id || !ANALYSIS_CACHE[id] || !IMAGE_CACHE[id]) {
      return NextResponse.json(
        { detail: `Diagnostic report ID '${id || ""}' or raw image data not found.` },
        { status: 404 }
      );
    }

    const result = ANALYSIS_CACHE[id];
    const rawImageBuffer = IMAGE_CACHE[id];
    const dateStr = result.timestamp.split(" ")[0]; // "2026-07-04"

    // 1. Decode original image bytes
    let decoded: { width: number; height: number; data: Buffer | Uint8Array };
    
    if (rawImageBuffer[0] === 0xff && rawImageBuffer[1] === 0xd8 && rawImageBuffer[2] === 0xff) {
      decoded = jpeg.decode(rawImageBuffer, { useTArray: true });
    } else {
      decoded = PNG.sync.read(rawImageBuffer);
    }

    const { width, height, data } = decoded;

    // 2. Setup standard pngjs PNG instance
    const png = new PNG({ width, height });
    
    // Copy original pixels to the new PNG data buffer
    // PNG data matches flat RGBA layout exactly
    png.data.set(data);

    // 3. Draw bounding boxes on pixels
    const boxes = result.bounding_boxes || [];
    const thickness = Math.max(3, Math.round(width * 0.006));
    const redColor: [number, number, number] = [239, 68, 68]; // #ef4444

    for (const box of boxes) {
      // Map percentage boxes back to original coordinates
      const bx = Math.round((box.x * width) / 100.0);
      const by = Math.round((box.y * height) / 100.0);
      const bw = Math.round((box.w * width) / 100.0);
      const bh = Math.round((box.h * height) / 100.0);

      drawBoundingBox(width, height, png.data, bx, by, bw, bh, redColor, thickness);
    }

    // 4. Encode back to PNG buffer
    const outputBuffer = PNG.sync.write(png);

    // 5. Send file download response
    const filename = `Crop_Report_${dateStr}_${id}.png`;
    return new NextResponse(outputBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });

  } catch (error: any) {
    console.error("PNG download Route Error:", error);
    return NextResponse.json(
      { detail: `Failed to compile labeled PNG overlay: ${error.message}` },
      { status: 500 }
    );
  }
}
