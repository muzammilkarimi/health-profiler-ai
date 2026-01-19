# Health Profiler AI 🏥

An intelligent, full-stack application that analyzes medical reports and lifestyle data using OCR and Generative AI to provide health risk insights and personalized recommendations. Built for speed, accuracy, and developer transparency.

## � Live Demo
- **Web UI**: [http://15.207.110.144](http://15.207.110.144)
- **API Endpoint**: `http://15.207.110.144:8000/api/analyze`

## �🚀 Features

- **Multimodal AI Analysis**: Combines raw OCR text and direct image analysis using the **gemini-flash-latest** model for high-accuracy extraction.
- **Unified Logic Pipeline**: A single round-trip API call processes multiple logical steps:
  1. **Information Extraction**: Age, smoker status, exercise, and diet.
  2. **Smart Guardrails**: Automatically detects incomplete profiles to prevent unreliable risk scoring.
  3. **Factor Extraction**: Identifies specific lifestyle and physiological risk factors.
  4. **Risk Classification**: Categorizes health profile as Low, Moderate, or High risk with a numerical score (0-100).
- **Developer Transparency**: Interactive UI displays the raw JSON output for every step of the AI's reasoning process.
- **Dual Input Modes**: Support for manual data entry or direct medical report image uploads.
- **Production Ready**: Containerized with Docker and orchestrated with Nginx.

## 🛠️ Technology Stack

- **Frontend**: React (Vite) + Vanilla CSS (Custom Glassmorphic Design)
- **Backend**: Node.js (Express)
- **AI/ML Engine**: Google Generative AI (`gemini-flash-latest`)
- **OCR Engine**: Tesseract (via `node-tesseract-ocr`)
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx (serving frontend and proxying API)

## 🏗️ Architecture

The app uses a **Unified Analyzer** pattern. Instead of chaining multiple LLM calls which increases latency and cost, it uses a complex structured prompt to force the **gemini-flash-latest** model (rather than the 1.5 variant) to return a multi-step JSON object. 

1. **Client**: React frontend sends `multipart/form-data` to the backend.
2. **Backend**: Express handles the request, uses `multer` for image processing, and `Tesseract` for initial OCR context.
3. **AI Layer**: A single prompt containing the OCR text and/or the image is sent to the `gemini-flash-latest` model.
4. **Validation**: The backend parses the structured JSON response and applies final guardrail logic before returning it to the user.

## 📋 Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/) installed.
- A **Google Gemini API Key**. Get it from the [Google AI Studio](https://aistudio.google.com/app/apikey).

## ⚙️ Local Setup

1. **Clone the repository**:
   ```bash
   git clone <repo_url>
   cd health-profiler-ai
   ```

2. **Configure Environment**:
   Create a `.env` file in the `backend/` directory:
   ```env
   GEMINI_API_KEY=your_google_gemini_api_key_here
   ```

3. **Launch with Docker**:
   Use the provided convenience scripts:
   ```bash
   chmod +x start.sh
   ./start.sh
   ```

4. **Access the Application**:
   - Web UI: `http://localhost`
   - API Docs: `http://localhost:8000` (Direct access to backend)

## 📡 API Documentation

### `POST /api/analyze`

Analyzes a health profile based on manual input or a medical report image.

**Request Type:** `multipart/form-data`

**Parameters:**
- `image` (Optional): File upload of a medical report (JPG/PNG).
- `name`: Full name of the user.
- `age`: User's age.
- `smoker`: "true" or "false".
- `exercise`: "rarely", "occasionally", "regularly", or "athlete".
- `diet`: String description of diet.
- `health_notes` (Optional): Any additional context.

### 🧪 Sample Requests (curl)

#### 1. Manual Data Analysis
```bash
curl -X POST http://localhost:8000/api/analyze \
  -F "name=John Doe" \
  -F "age=45" \
  -F "smoker=true" \
  -F "exercise=rarely" \
  -F "diet=High sugar and processed foods" \
  -F "health_notes=Occasional chest pain"
```

#### 2. Image Report Analysis
```bash
curl -X POST http://15.207.110.144:8000/api/analyze \
  -F "image=@test.png"
```

### 📦 Example Response
```json
{
  "status": "ok",
  "risk_level": "low",
  "factors": [
    "Non-smoker status (positive health factor)",
    "Low baseline age risk (Age 25)",
    "Adherence to a specific, restrictive diet (Keto diet)"
  ],
  "recommendations": [
    "Determine and record exercise frequency to complete the health profile.",
    "Monitor lipid profile (cholesterol) due to the high-fat composition of the Keto diet.",
    "Ensure adequate intake of fiber and micronutrients while following the dietary plan."
  ],
  "developer_info": {
    "step1_extraction": {
      "answers": { "age": 25, "smoker": false, "exercise": null, "diet": "Keto diet" },
      "missing_fields": ["exercise"],
      "confidence": 1
    },
    "step2_factor_extraction": {
      "factors": [...],
      "confidence": 1
    },
    "step3_risk_classification": {
      "risk_level": "low",
      "score": 20,
      "rationale": [...]
    },
    "guardrail": { "status": "ok", "reason": null },
    "ocr_text": "...",
    "input_mode": "image/ocr"
  }
}
```

## ☁️ AWS EC2 Deployment

To deploy this on an AWS EC2 instance (Ubuntu):

```bash
# 1. Update and install Docker
sudo apt update && install docker.io docker-compose -y
sudo usermod -aG docker $USER && newgrp docker

# 2. Clone and Setup
git clone <repo_url>
cd health-profiler-ai
echo "GEMINI_API_KEY=your_key" > backend/.env

# 3. Start Production Stack
chmod +x start.sh
./start.sh
```

---
*Disclaimer: This application is for educational purposes and provides non-diagnostic information only. Always consult a healthcare professional for medical advice.*
