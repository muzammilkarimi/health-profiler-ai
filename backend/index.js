const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { analyzeHealthProfile } = require("./unifiedAnalyzer");

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer setup for file uploads
const upload = multer({ storage: multer.memoryStorage() });

app.post("/api/analyze", upload.single("image"), async (req, res) => {
    try {
        const { name, age, smoker, exercise, diet, health_notes } = req.body;
        const imageBuffer = req.file ? req.file.buffer : null;

        let result;
        if (imageBuffer) {
            // Unified Analysis (Image/OCR path)
            result = await analyzeHealthProfile({
                imageBuffer,
                imageMimeType: req.file.mimetype
            });
        } else {
            // Unified Analysis (Manual path)
            const formData = {
                name: name || "",
                age: age ? parseInt(age) : null,
                smoker: smoker === "true" || smoker === true,
                exercise: exercise || "rarely",
                diet: diet || "",
                health_notes: health_notes || null
            };
            result = await analyzeHealthProfile({ manualData: formData });
        }

        res.json(result);
    } catch (error) {
        console.error("Analysis error:", error);
        res.status(500).json({ status: "error", reason: error.message });
    }
});

app.get("/", (req, res) => {
    res.json({ message: "Health Profiler API is running" });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
