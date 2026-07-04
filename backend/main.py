import io
import os
import tempfile
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from PIL import Image, ImageDraw, ImageFont

from analyzer import CropHealthModel
from report_generator import ReportGenerator

app = FastAPI(title="AI Crop Health Analysis Backend")

# Enable CORS for Next.js app running on localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all hosts in local development environment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global caches (in-memory db)
ANALYSIS_CACHE = {}
IMAGE_CACHE = {}

@app.on_event("startup")
def create_sample_images():
    samples_dir = os.path.join("..", "public", "samples")
    os.makedirs(samples_dir, exist_ok=True)
    
    # 1. Corn Gray Leaf Spot sample (rectangular brown spots)
    if not os.path.exists(os.path.join(samples_dir, "corn-spot.jpg")):
        img = Image.new("RGB", (300, 300), (240, 240, 240))
        draw = ImageDraw.Draw(img)
        # Draw elongated leaf
        draw.polygon([(150, 20), (190, 150), (150, 280), (110, 150)], fill=(34, 197, 94))
        # Draw rectangular brown/gray spots
        draw.rectangle([140, 80, 150, 100], fill=(139, 92, 26))
        draw.rectangle([155, 120, 165, 140], fill=(139, 92, 26))
        draw.rectangle([130, 160, 145, 185], fill=(120, 110, 90))
        img.save(os.path.join(samples_dir, "corn-spot.jpg"))
        
    # 2. Soybean Leaf Rust sample (dense tiny brown pustules)
    if not os.path.exists(os.path.join(samples_dir, "soy-rust.jpg")):
        img = Image.new("RGB", (300, 300), (240, 240, 240))
        draw = ImageDraw.Draw(img)
        # Draw oval leaf
        draw.ellipse([80, 50, 220, 250], fill=(34, 197, 94))
        # Draw tiny brown pustules
        for px, py in [(120, 100), (130, 105), (125, 120), (150, 140), (160, 135), (145, 160), (135, 180), (170, 170), (155, 190)]:
            draw.ellipse([px-3, py-3, px+3, py+3], fill=(100, 50, 10))
            draw.ellipse([px-5, py-5, px+5, py+5], outline=(234, 179, 8), width=1) # yellow halo
        img.save(os.path.join(samples_dir, "soy-rust.jpg"))
        
    # 3. Potato Late Blight sample (large dark spots with white mold outline)
    if not os.path.exists(os.path.join(samples_dir, "potato-blight.jpg")):
        img = Image.new("RGB", (300, 300), (240, 240, 240))
        draw = ImageDraw.Draw(img)
        # Draw potato leaf shape
        draw.ellipse([90, 60, 210, 240], fill=(34, 197, 94))
        # Draw large dark spots
        draw.ellipse([120, 100, 160, 140], fill=(30, 30, 30))
        # Draw white mold ring
        draw.ellipse([118, 98, 162, 142], outline=(220, 220, 220), width=2)
        
        draw.ellipse([140, 160, 175, 195], fill=(30, 30, 30))
        draw.ellipse([138, 158, 177, 197], outline=(220, 220, 220), width=2)
        img.save(os.path.join(samples_dir, "potato-blight.jpg"))

    # 4. Tomato Early Blight sample (brown target spots and yellowing)
    if not os.path.exists(os.path.join(samples_dir, "tomato-blight.jpg")):
        img = Image.new("RGB", (300, 300), (240, 240, 240))
        draw = ImageDraw.Draw(img)
        # Draw serrated tomato leaf shape
        draw.ellipse([100, 80, 200, 220], fill=(34, 197, 94))
        # Draw yellowing areas (chlorosis)
        draw.ellipse([120, 110, 180, 190], fill=(234, 179, 8))
        # Draw target spot inside yellowing
        draw.ellipse([140, 130, 160, 150], fill=(120, 70, 20))
        draw.ellipse([143, 133, 157, 147], fill=(234, 179, 8))
        draw.ellipse([146, 136, 154, 144], fill=(120, 70, 20))
        img.save(os.path.join(samples_dir, "tomato-blight.jpg"))


@app.post("/api/analyze")
async def analyze_crop_image(
    file: UploadFile = File(...),
    crop_hint: str = Form("auto")
):
    try:
        # Read uploaded image bytes
        image_bytes = await file.read()
        
        # Process image using analyzer model
        result = CropHealthModel.analyze_image(image_bytes, crop_hint)
        
        # Save to memory cache for download retrieval
        report_id = result["id"]
        ANALYSIS_CACHE[report_id] = result
        IMAGE_CACHE[report_id] = image_bytes
        
        # Return complete details
        return result
    except ValueError as val_err:
        # User-facing input error (e.g. invalid format or no leaf detected)
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as ex:
        # Internal model error
        raise HTTPException(status_code=500, detail=f"AI inference pipeline failure: {str(ex)}")


@app.get("/api/download/pdf")
async def download_pdf_report(id: str):
    if id not in ANALYSIS_CACHE:
        raise HTTPException(status_code=404, detail=f"Diagnostic report ID {id} not found in active session cache.")
    
    result = ANALYSIS_CACHE[id]
    
    # Generate temporary PDF file
    fd, pdf_temp_path = tempfile.mkstemp(suffix=".pdf")
    os.close(fd)
    
    try:
        ReportGenerator.generate_pdf(result, pdf_temp_path)
        
        # Format filename according to specification: Crop_Report_YYYY-MM-DD_ID.pdf
        date_str = result["timestamp"].split(" ")[0] # "2026-07-04"
        filename = f"Crop_Report_{date_str}_{id}.pdf"
        
        return FileResponse(
            pdf_temp_path,
            media_type="application/pdf",
            filename=filename
        )
    except Exception as ex:
        if os.path.exists(pdf_temp_path):
            os.remove(pdf_temp_path)
        raise HTTPException(status_code=500, detail=f"Failed to compile PDF report: {str(ex)}")


@app.get("/api/download/csv")
async def download_csv_report(id: str):
    if id not in ANALYSIS_CACHE:
        raise HTTPException(status_code=404, detail=f"Diagnostic report ID {id} not found in active session cache.")
    
    result = ANALYSIS_CACHE[id]
    
    # Generate temporary CSV file
    fd, csv_temp_path = tempfile.mkstemp(suffix=".csv")
    os.close(fd)
    
    try:
        ReportGenerator.generate_csv(result, csv_temp_path)
        
        date_str = result["timestamp"].split(" ")[0]
        filename = f"Crop_Report_{date_str}_{id}.csv"
        
        return FileResponse(
            csv_temp_path,
            media_type="text/csv",
            filename=filename
        )
    except Exception as ex:
        if os.path.exists(csv_temp_path):
            os.remove(csv_temp_path)
        raise HTTPException(status_code=500, detail=f"Failed to compile CSV file: {str(ex)}")


@app.get("/api/download/json")
async def download_json_report(id: str):
    if id not in ANALYSIS_CACHE:
        raise HTTPException(status_code=404, detail=f"Diagnostic report ID {id} not found in active session cache.")
    
    result = ANALYSIS_CACHE[id]
    
    # Generate temporary JSON file
    fd, json_temp_path = tempfile.mkstemp(suffix=".json")
    os.close(fd)
    
    try:
        ReportGenerator.generate_json(result, json_temp_path)
        
        date_str = result["timestamp"].split(" ")[0]
        filename = f"Crop_Report_{date_str}_{id}.json"
        
        return FileResponse(
            json_temp_path,
            media_type="application/json",
            filename=filename
        )
    except Exception as ex:
        if os.path.exists(json_temp_path):
            os.remove(json_temp_path)
        raise HTTPException(status_code=500, detail=f"Failed to serialize JSON report: {str(ex)}")


@app.get("/api/download/png")
async def download_png_analysis(id: str):
    if id not in ANALYSIS_CACHE or id not in IMAGE_CACHE:
        raise HTTPException(status_code=404, detail=f"Diagnostic report ID {id} or original image data not found.")
    
    result = ANALYSIS_CACHE[id]
    image_bytes = IMAGE_CACHE[id]
    
    try:
        # Load original image
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        draw = ImageDraw.Draw(img)
        w, h = img.size
        
        # Draw bounding boxes directly on the high-resolution image
        for box in result["bounding_boxes"]:
            # Map percentages to original dimensions
            bx = (box["x"] * w) / 100.0
            by = (box["y"] * h) / 100.0
            bw = (box["w"] * w) / 100.0
            bh = (box["h"] * h) / 100.0
            
            # Thick red bounding box rectangle
            draw.rectangle([bx, by, bx + bw, by + bh], outline=(239, 68, 68), width=max(2, int(w * 0.005)))
            
            # Draw label banner
            font_size = max(10, int(w * 0.02))
            try:
                # Fallback to default if unable to load standard font
                font = ImageFont.load_default()
            except IOError:
                font = None
                
            text = f"{box['label']} ({box['confidence']}%)"
            draw.text((bx + 5, by + 5), text, fill=(239, 68, 68))
            
        # Save as high-res PNG file
        png_io = io.BytesIO()
        img.save(png_io, format="PNG")
        png_io.seek(0)
        
        date_str = result["timestamp"].split(" ")[0]
        filename = f"Crop_Report_{date_str}_{id}.png"
        
        return StreamingResponse(
            png_io,
            media_type="image/png",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as ex:
        raise HTTPException(status_code=500, detail=f"Failed to generate PNG overlay: {str(ex)}")

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "engine": "Aetheria Crop Health AI", "model_version": "ResNet-50 v4.1"}
