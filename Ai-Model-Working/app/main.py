"""
FastAPI Main Application
AI Microservice for Eczema Detection
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn
import os
from dotenv import load_dotenv

from app.services.model_service import ModelService
from app.services.relevance_detector import RelevanceDetector
from app.services.severity_estimator import SeverityEstimator
from app.services.llm_service import LLMService
from app.schemas.response import AnalysisResponse, ErrorResponse
from app.utils.image_processor import ImageProcessor

# Load environment variables
load_dotenv()

# Initialize services (loaded once at startup)
model_service = None
relevance_detector = None
severity_estimator = None
llm_service = None
image_processor = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown"""
    global model_service, relevance_detector, severity_estimator, llm_service, image_processor
    
    # Startup
    try:
        # Try to load model (optional - service can run without it)
        model_path = os.getenv("MODEL_PATH", "models/eczema_detector_efficientnet.h5")
        if os.path.exists(model_path):
            print(f"Loading model from {model_path}...")
            model_service = ModelService(model_path)
            await model_service.load_model()
            print("✅ Model loaded successfully")
        else:
            print(f"⚠️  Warning: Model file not found at {model_path}")
            print("⚠️  Service will start but model inference will be unavailable.")
            print("⚠️  Please place your model file at: models/eczema_detector_efficientnet.h5")
            model_service = None
        
        # Initialize other services (always available)
        relevance_detector = RelevanceDetector()
        severity_estimator = SeverityEstimator()
        
        # Official Google Gemini API key from AI Studio (https://aistudio.google.com/app)
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        # Available models: gemma-3-27b-it, gemma-3-12b-it, gemma-3-4b-it, gemma-3-2b-it, gemma-3-1b-it, gemini-2.5-flash
        gemini_model = os.getenv("GEMINI_MODEL", "gemma-3-27b-it")
        llm_service = LLMService(gemini_api_key, gemini_model)
        
        image_processor = ImageProcessor()
        
        print("✅ All services initialized successfully")
    except Exception as e:
        print(f"❌ Error initializing services: {e}")
        # Don't raise - allow service to start even if some services fail
        print("⚠️  Service will continue with limited functionality")
    
    yield
    
    # Shutdown (if needed)
    print("Shutting down services...")


# Initialize FastAPI app with lifespan
app = FastAPI(
    title="Eczema Detection AI Service",
    description="AI-powered eczema detection with LLM reasoning and severity estimation",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    model_status = False
    if model_service is not None:
        model_status = model_service.is_loaded()
    
    return {
        "status": "healthy",
        "service": "eczema-detection-ai",
        "model_loaded": model_status,
        "model_path": os.getenv("MODEL_PATH", "models/eczema_detector_efficientnet.h5"),
        "model_exists": os.path.exists(os.getenv("MODEL_PATH", "models/eczema_detector_efficientnet.h5"))
    }


@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_image(file: UploadFile = File(...)):
    """
    Analyze uploaded image for eczema detection
    
    Flow:
    1. Validate and preprocess image
    2. Check image relevance (human skin detection)
    3. Run eczema prediction if relevant
    4. Estimate severity if eczema detected
    5. Generate LLM explanation
    6. Return structured response
    """
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=400,
                detail="Invalid file type. Please upload an image file."
            )
        
        # Read image
        image_bytes = await file.read()
        
        # Process image
        processed_image = await image_processor.process_image(image_bytes)
        
        if processed_image is None:
            raise HTTPException(
                status_code=400,
                detail="Failed to process image. Please ensure it's a valid image file."
            )
        
        # Step 1: Check image relevance
        is_relevant, relevance_reason = await relevance_detector.check_relevance(processed_image)
        
        if not is_relevant:
            return AnalysisResponse(
                relevant=False,
                eczema_detected=False,
                confidence=0.0,
                message=relevance_reason,
                disclaimer="This is an AI-based assessment and not a medical diagnosis."
            )
        
        # Step 2: Run eczema prediction (check if model is loaded)
        if model_service is None or not model_service.is_loaded():
            raise HTTPException(
                status_code=503,
                detail="Model service is not available. Please ensure the model file is placed in the models/ directory."
            )
        
        prediction_result = await model_service.predict(processed_image)
        
        eczema_probability = float(prediction_result["eczema_probability"])
        is_eczema = eczema_probability > 0.5  # Threshold can be adjusted
        
        # Step 3: Estimate severity if eczema detected
        severity = None
        if is_eczema:
            severity = await severity_estimator.estimate_severity(
                processed_image,
                eczema_probability,
                prediction_result
            )
        
        # Step 4: Generate LLM explanation with vision analysis
        # Pass original image bytes so Gemini can analyze the image directly
        # This allows Gemini to correct the custom model's mistakes
        explanation, gemini_eczema_detected, gemini_confidence = await llm_service.generate_explanation(
            eczema_probability=eczema_probability,
            is_eczema=is_eczema,
            severity=severity,
            image_bytes=image_bytes  # Pass original image for Gemini vision analysis
        )
        
        # Step 5: Use Gemini's assessment to correct custom model if needed
        # If Gemini sees eczema but custom model doesn't, trust Gemini (it has vision)
        # If both agree, use custom model's probability
        # If Gemini doesn't provide assessment, use custom model
        
        final_eczema_detected = is_eczema
        final_confidence = eczema_probability
        
        if gemini_eczema_detected is not None:
            # Gemini provided its own assessment
            if gemini_eczema_detected and not is_eczema:
                # Gemini sees eczema but custom model missed it - trust Gemini
                final_eczema_detected = True
                final_confidence = gemini_confidence if gemini_confidence else 0.7
                print(f"⚠️  Custom model missed eczema, but Gemini detected it. Using Gemini's assessment.")
            elif not gemini_eczema_detected and is_eczema:
                # Gemini doesn't see eczema but custom model detected it - use weighted average
                # Trust Gemini more but consider custom model
                final_confidence = (eczema_probability * 0.3) + (gemini_confidence if gemini_confidence else 0.3)
                if final_confidence < 0.5:
                    final_eczema_detected = False
                print(f"⚠️  Custom model detected eczema, but Gemini disagrees. Using combined assessment.")
            elif gemini_eczema_detected and is_eczema:
                # Both agree - use weighted average favoring Gemini
                final_confidence = (eczema_probability * 0.4) + (gemini_confidence if gemini_confidence else eczema_probability * 0.6)
                final_eczema_detected = True
        
        # Step 6: Re-estimate severity if final detection changed
        final_severity = severity
        if final_eczema_detected and not is_eczema:
            # Gemini detected eczema but custom model didn't - estimate severity
            final_severity = await severity_estimator.estimate_severity(
                processed_image,
                final_confidence,
                {"eczema_probability": final_confidence}
            )
        
        # Step 7: Build response
        if final_eczema_detected:
            return AnalysisResponse(
                relevant=True,
                eczema_detected=True,
                confidence=round(final_confidence, 2),
                severity=final_severity,
                explanation=explanation,
                disclaimer="This is an AI-based assessment and not a medical diagnosis. Please consult a healthcare professional for proper medical advice."
            )
        else:
            return AnalysisResponse(
                relevant=True,
                eczema_detected=False,
                confidence=round(1 - final_confidence, 2),
                message="No strong eczema patterns detected in the image.",
                explanation=explanation,
                disclaimer="This is an AI-based assessment and not a medical diagnosis."
            )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error analyzing image: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Eczema Detection AI Service",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "analyze": "/analyze (POST)"
        }
    }


if __name__ == "__main__":
    host = os.getenv("FASTAPI_HOST", "0.0.0.0")
    port = int(os.getenv("FASTAPI_PORT", 8000))
    
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=True
    )

