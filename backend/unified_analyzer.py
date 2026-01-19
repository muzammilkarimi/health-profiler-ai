import google.generativeai as genai
import os
import json
import io
import PIL.Image
import pytesseract
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)


def analyze_health_profile(image_bytes: bytes = None, manual_data: dict = None):
    """
    Unified analyzer that performs extraction, factor identification, 
    risk classification, and recommendations in a single Gemini API call.
    """
    if not api_key:
        return {"status": "error", "reason": "GEMINI_API_KEY not configured"}

    input_context = ""
    ocr_text = ""

    if image_bytes:
        try:
            img = PIL.Image.open(io.BytesIO(image_bytes))
            ocr_text = pytesseract.image_to_string(img)
            input_context = f"RAW OCR TEXT FROM MEDICAL REPORT:\n{ocr_text}"
        except Exception as e:
            return {"status": "error", "reason": f"OCR failed: {str(e)}"}

    elif manual_data:
        input_context = f"MANUAL USER DATA:\n{json.dumps(manual_data, indent=2)}"

    else:
        return {"status": "error", "reason": "No input provided"}

    try:
        model = genai.GenerativeModel("gemini-flash-latest")

        prompt = f"""
You are a highly accurate medical information extraction and health risk assessment system.

The input may contain noisy OCR text. You must:
- Extract only information clearly supported by the input
- Never hallucinate unknown values
- If unsure, use null or "unknown"
- Be conservative and evidence-based

========================
INPUT DATA:
{input_context}
========================

FIELDS TO EXTRACT:
Return values only from these allowed options:
and make sure age can be agz and it's handwritten so handle the possiblities of words:

- age: number OR null
- smoker: "yes", "no", or "unknown"
- exercise: "sedentary", "moderate", "active", or "unknown"
- diet: "poor", "average", "healthy", or "unknown"

TASKS:
1. Extract the above four fields into raw_extraction.
2. If 3 or more fields are missing (null or unknown), return:
   {{
     "status": "incomplete_profile",
     "reason": ">50% fields missing"
   }}
3. If sufficient data exists:
   - Identify 3–4 health risk factors (each 1–3 words)
   - Classify risk_level as "low", "moderate", or "high"
   - Provide 3–4 short recommendations (each 3–5 words)

OUTPUT RULES:
- Return ONLY valid JSON
- No markdown
- No explanations
- No extra commentary

VALID OUTPUT FORMAT (if sufficient data):
{{
  "risk_level": "low/moderate/high",
  "factors": ["short factor 1", "short factor 2"],
  "recommendations": ["short rec 1", "short rec 2"],
  "raw_extraction": {{
    "age": value_or_null,
    "smoker": "yes/no/unknown",
    "exercise": "sedentary/moderate/active/unknown",
    "diet": "poor/average/healthy/unknown"
  }},
  "status": "ok"
}}
"""

        response = model.generate_content(prompt)
        response_text = response.text.strip()

        # Safety cleanup in case model wraps JSON
        response_text = response_text.replace("```json", "").replace("```", "").strip()

        result = json.loads(response_text)

        # Attach developer info
        result["developer_info"] = {
            "ocr_text": ocr_text if image_bytes else None,
            "input_mode": "image/ocr" if image_bytes else "manual",
            "extracted_data": result.get("raw_extraction", {})
        }

        return result

    except json.JSONDecodeError:
        return {
            "status": "error",
            "reason": "Model did not return valid JSON",
            "raw_response": response_text
        }

    except Exception as e:
        return {"status": "error", "reason": f"Unified analysis failed: {str(e)}"}
