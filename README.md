# Health Profiler AI 🏥

An intelligent, full-stack application that analyzes medical reports and lifestyle data using OCR and Generative AI to provide health risk insights and personalized recommendations.

## 🚀 Features
- **OCR Integration**: Extract text from medical reports using Tesseract.
- **AI Analysis**: Single-call unified analysis via **Google Gemini**.
- **Risk Profiling**: Automatic risk level classification (Low/Moderate/High).
- **Consolidated API**: All steps (Extraction -> Factors -> Risk -> Recs) processed in one round-trip.
- **Production Ready**: Multi-stage Docker builds and Nginx orchestration.

## 🛠️ Technology Stack
- **Frontend**: React (Vite) + Vanilla CSS
- **Backend**: FastAPI (Python)
- **AI/ML**: Google Generative AI (Gemini 2.0 Flash) & Pytesseract
- **Deployment**: Docker & Docker Compose

## 📋 Prerequisites
- Docker & Docker Compose installed.
- A Google Gemini API Key.

## ⚙️ Local Setup
1. Clone the repository.
2. Create a `backend/.env` file and add your key:
   ```env
   GEMINI_API_KEY=your_key_here
   ```
3. Run the application:
   ```bash
   chmod +x start.sh
   ./start.sh
   ```
4. Access the app at `http://localhost`.

## ☁️ AWS EC2 Deployment
Connect to your EC2 instance and run:

```bash
# 1. Install Docker
sudo apt update && sudo apt install docker.io docker-compose -y
sudo usermod -aG docker $USER && newgrp docker

# 2. Deploy
git clone <repo_url>
cd health-profiler-ai
echo "GEMINI_API_KEY=your_key" > backend/.env
chmod +x start.sh
./start.sh
```

---
*Disclaimer: This application is for educational purposes and provides non-diagnostic information only.*
