const { GoogleGenerativeAI } = require("@google/generative-ai");
const tesseract = require("node-tesseract-ocr");
const dotenv = require("dotenv");

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const tesseractConfig = {
    lang: "eng",
    oem: 1,
    psm: 3,
};

/**
 * Unified analyzer that performs extraction, factor identification, 
 * risk classification, and recommendations in a single Gemini API call.
 */
async function analyzeHealthProfile({ imageBuffer = null, imageMimeType = null, manualData = null } = {}) {
    if (!apiKey || !genAI) {
        return { status: "error", reason: "GEMINI_API_KEY not configured" };
    }

    let inputContext = "";
    let ocrText = "";
    let parts = [];

    if (imageBuffer) {
        try {
            ocrText = await tesseract.recognize(imageBuffer, tesseractConfig);
            inputContext = `RAW OCR TEXT FROM MEDICAL REPORT (FOR CONTEXT):\n${ocrText}`;

            // Add image part for multimodal analysis
            parts.push({
                inlineData: {
                    data: imageBuffer.toString("base64"),
                    mimeType: imageMimeType || "image/jpeg"
                }
            });
        } catch (error) {
            console.error("OCR Warning (falling back to image-only):", error.message);
            inputContext = "IMAGE PROVIDED (OCR FAILED)";
            parts.push({
                inlineData: {
                    data: imageBuffer.toString("base64"),
                    mimeType: imageMimeType || "image/jpeg"
                }
            });
        }
    } else if (manualData) {
        inputContext = `MANUAL USER DATA:\n${JSON.stringify(manualData, null, 2)}`;
    } else {
        return { status: "error", reason: "No input provided" };
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
You are a highly accurate medical information extraction and health risk assessment system.

The input contains ${imageBuffer ? "an image of a medical report and its OCR text" : "manual user data"}. 

TASKS:
1. Extraction: Extract age, smoker status, exercise frequency, and diet.
   - Guardrail: If 3 or more fields are missing, set status to "incomplete_profile".
2. Factor Extraction: Identify health risk factors from the extracted data.
3. Risk Classification: Compute risk level, score (0-100), and rationale.

OUTPUT FORMAT:
Return ONLY a valid JSON object with the following structure:
{
  "step1": {
    "answers": {
      "age": number or null,
      "smoker": boolean or null,
      "exercise": "rarely/occasionally/regularly/athlete" or null,
      "diet": "string describing diet" or null
    },
    "missing_fields": ["list", "of", "missing", "fields"],
    "confidence": number (0-1)
  },
  "step1_guardrail": {
    "status": "ok" or "incomplete_profile",
    "reason": null or ">50% fields missing"
  },
  "step2": {
    "factors": ["factor1", "factor2"],
    "confidence": number (0-1)
  },
  "step3": {
    "risk_level": "low/moderate/high",
    "score": number (0-100),
    "rationale": ["point 1", "point 2"]
  },
  "recommendations": ["short rec 1", "short rec 2"]
}

========================
INPUT CONTEXT:
${inputContext}
========================

No markdown, no explanations.
`;

        parts.push(prompt);

        const result = await model.generateContent(parts);
        const response = await result.response;
        let responseText = response.text().trim();

        // Safety cleanup in case model wraps JSON
        responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

        const parsedResult = JSON.parse(responseText);

        // Map internal steps to the final expected output
        const finalOutput = {
            status: parsedResult.step1_guardrail?.status === "incomplete_profile" ? "incomplete_profile" : "ok",
            risk_level: parsedResult.step3?.risk_level || "unknown",
            factors: parsedResult.step2?.factors || [],
            recommendations: parsedResult.recommendations || [],
            developer_info: {
                step1_extraction: parsedResult.step1,
                step2_factor_extraction: parsedResult.step2,
                step3_risk_classification: parsedResult.step3,
                guardrail: parsedResult.step1_guardrail,
                ocr_text: imageBuffer ? ocrText : null,
                input_mode: imageBuffer ? "image/ocr" : "manual"
            }
        };

        if (finalOutput.status === "incomplete_profile") {
            finalOutput.reason = parsedResult.step1_guardrail?.reason || ">50% fields missing";
        }

        return finalOutput;

    } catch (error) {
        if (error instanceof SyntaxError) {
            return {
                status: "error",
                reason: "Model did not return valid JSON",
                raw_response: error.message
            };
        }
        return { status: "error", reason: `Unified analysis failed: ${error.message}` };
    }
}

module.exports = { analyzeHealthProfile };
