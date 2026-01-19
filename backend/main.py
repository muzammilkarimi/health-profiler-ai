from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from unified_analyzer import analyze_health_profile

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/analyze")
async def analyze(
    name: str = Form(""),
    age: Optional[int] = Form(None),
    smoker: bool = Form(False),
    exercise: str = Form("rarely"),
    diet: str = Form(""),
    health_notes: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None)
):
    if image:
        # Unified Analysis (Image/OCR path)
        contents = await image.read()
        result = analyze_health_profile(image_bytes=contents)
    else:
        # Unified Analysis (Manual path)
        form_data = {
            "name": name,
            "age": age,
            "smoker": smoker,
            "exercise": exercise,
            "diet": diet,
            "health_notes": health_notes
        }
        result = analyze_health_profile(manual_data=form_data)
    
    return result

@app.get("/")
def read_root():
    return {"message": "Health Profiler API is running"}
