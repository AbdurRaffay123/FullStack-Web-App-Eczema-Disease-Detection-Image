# AI Model Working - Eczema Detection Microservice

FastAPI microservice for eczema detection using TensorFlow/Keras models with LLM reasoning.

## 🏗️ Architecture

```
Ai-Model-Working/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application
│   ├── schemas/
│   │   └── response.py         # Pydantic response models
│   ├── services/
│   │   ├── model_service.py    # TensorFlow model loading & inference
│   │   ├── relevance_detector.py # Image relevance detection
│   │   ├── severity_estimator.py # Severity estimation
│   │   └── llm_service.py      # Bytez SDK + Gemma LLM
│   └── utils/
│       └── image_processor.py   # Image preprocessing
├── models/                      # Model files directory
│   └── eczema_detector_efficientnet.h5
├── requirements.txt
├── .env.example
├── Dockerfile
└── README.md
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd Ai-Model-Working
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Place Model File

Place your `eczema_detector_efficientnet.h5` model file in:
```
Ai-Model-Working/models/eczema_detector_efficientnet.h5
```

### 4. Run Service

```bash
python -m app.main
# Or
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Service will be available at: `http://localhost:8000`

## 📡 API Endpoints

### Health Check
```
GET /health
```

### Analyze Image
```
POST /analyze
Content-Type: multipart/form-data

Body: file (image file)
```

**Response:**
```json
{
  "relevant": true,
  "eczema_detected": true,
  "confidence": 0.87,
  "severity": "Moderate",
  "explanation": "The image shows skin patterns that moderately resemble eczema...",
  "disclaimer": "This is an AI-based assessment and not a medical diagnosis."
}
```

## 🔌 Integration with Node.js Backend

The Node.js backend can call this service:

```javascript
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

async function analyzeImage(imagePath) {
  const form = new FormData();
  form.append('file', fs.createReadStream(imagePath));
  
  const response = await axios.post(
    'http://localhost:8000/analyze',
    form,
    { headers: form.getHeaders() }
  );
  
  return response.data;
}
```

## 🐳 Docker Support

```bash
docker build -t eczema-ai-service .
docker run -p 8000:8000 eczema-ai-service
```

## ⚙️ Configuration

Environment variables (`.env`):
- `FASTAPI_HOST`: Host (default: 0.0.0.0)
- `FASTAPI_PORT`: Port (default: 8000)
- `MODEL_PATH`: Path to model file
- `MODEL_INPUT_SIZE`: Input size (default: 224)
- `BYTEZ_API_KEY`: Bytez API key for LLM
- `BYTEZ_MODEL`: Model name (default: google/gemma-3-27b-it)

## 🛡️ Safety Features

- ✅ Image relevance detection (human skin only)
- ✅ Non-diagnostic language
- ✅ Confidence scores (not certainties)
- ✅ Safety disclaimers
- ✅ No medical advice

## 📝 Notes

- Model loads once at startup for performance
- All image processing is async
- LLM explanations are optional (fallback available)
- Severity estimation uses heuristics, not medical diagnosis













