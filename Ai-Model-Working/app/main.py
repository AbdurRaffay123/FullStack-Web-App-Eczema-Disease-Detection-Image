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
from app.services.uncertainty_detector import UncertaintyDetector
from app.services.llm_service import LLMService
from app.schemas.response import AnalysisResponse, ErrorResponse
from app.utils.image_processor import ImageProcessor

# Load environment variables
load_dotenv()

# Initialize services (loaded once at startup)
model_service = None
relevance_detector = None
severity_estimator = None
uncertainty_detector = None
llm_service = None
image_processor = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown"""
    global model_service, relevance_detector, severity_estimator, uncertainty_detector, llm_service, image_processor
    
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
        uncertainty_detector = UncertaintyDetector()  # NEW: Uncertainty detection service
        
        # Official Google Gemini API key from AI Studio (https://aistudio.google.com/app)
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        # Available VISION models: gemini-1.5-pro (best accuracy), gemini-1.5-flash (fast), gemini-2.0-flash-exp (latest)
        # IMPORTANT: Gemma models do NOT support vision! Use Gemini models for image analysis.
        gemini_model = os.getenv("GEMINI_MODEL", "gemini-1.5-pro")
        llm_service = LLMService(gemini_api_key, gemini_model)
        
        image_processor = ImageProcessor()
        
        print("✅ All services initialized successfully")
        print("✅ Uncertainty detection enabled")
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
    
    RESTRUCTURED INFERENCE PIPELINE (STRICT ORDER):
    1. Image validation (format, size)
    2. Human skin / face relevance check (FIXED: accepts faces)
    3. Model inference (binary)
    4. Confidence band evaluation
    5. OOD / uncertainty detection
    6. Final decision mapping (Eczema | Normal | Uncertain)
    7. Explanation generation (LLM-assisted with uncertainty handling)
    
    Returns:
        AnalysisResponse with prediction: "Eczema" | "Normal" | "Uncertain"
    """
    try:
        # ============================================
        # STEP 1: Image Validation (format, size)
        # ============================================
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
        
        # ============================================
        # STEP 2: Human Skin / Face Relevance Check
        # FIXED: Now accepts face images and all human skin areas
        # ============================================
        is_relevant, relevance_reason = await relevance_detector.check_relevance(processed_image)
        
        if not is_relevant:
            return AnalysisResponse(
                relevant=False,
                prediction="Normal",  # Not relevant = Normal (not eczema)
                eczema_detected=False,
                confidence=0.0,
                message=relevance_reason,
                reasoning="Image does not appear to contain human skin.",
                disclaimer="This is an AI-based assessment and not a medical diagnosis."
            )
        
        # ============================================
        # STEP 3: Model Inference (Binary)
        # ============================================
        if model_service is None or not model_service.is_loaded():
            raise HTTPException(
                status_code=503,
                detail="Model service is not available. Please ensure the model file is placed in the models/ directory."
            )
        
        prediction_result = await model_service.predict(processed_image)
        eczema_probability = float(prediction_result["eczema_probability"])
        
        # ============================================
        # MODEL OUTPUT LOGGING
        # ============================================
        print("\n" + "="*60)
        print("🤖 MODEL OUTPUT")
        print("="*60)
        print(f"📊 Eczema Probability: {eczema_probability:.4f} ({eczema_probability*100:.2f}%)")
        print(f"📋 Raw Prediction Result: {prediction_result}")
        print("="*60 + "\n")
        
        # ============================================
        # STEP 4: Confidence Band Evaluation
        # ============================================
        confidence_band = uncertainty_detector.get_confidence_band(eczema_probability)
        
        # ============================================
        # STEP 5: OOD / Uncertainty Detection
        # ============================================
        is_uncertain, uncertainty_reason, adjusted_confidence = await uncertainty_detector.evaluate_uncertainty(
            processed_image,
            eczema_probability,
            prediction_result
        )
        
        # ============================================
        # STEP 6: Final Decision Mapping
        # Three-state prediction: Eczema | Normal | Uncertain
        # ============================================
        if is_uncertain:
            # Route to "Uncertain / Other Skin Condition" state
            prediction_state = "Uncertain"
            final_confidence = adjusted_confidence
            final_eczema_detected = False  # Uncertain is not eczema
            severity = None  # No severity for uncertain cases
        else:
            # High confidence cases: route to Eczema or Normal
            if eczema_probability >= uncertainty_detector.high_confidence_threshold:
                prediction_state = "Eczema"
                final_confidence = eczema_probability
                final_eczema_detected = True
                # Estimate severity for eczema cases
                severity = await severity_estimator.estimate_severity(
                    processed_image,
                    eczema_probability,
                    prediction_result
                )
            elif eczema_probability <= uncertainty_detector.low_confidence_threshold:
                prediction_state = "Normal"
                final_confidence = 1.0 - eczema_probability  # Confidence for "Normal"
                final_eczema_detected = False
                severity = None
            else:
                # Medium confidence: route to Uncertain (safety fallback)
                prediction_state = "Uncertain"
                final_confidence = 0.5
                final_eczema_detected = False
                severity = None
                uncertainty_reason = "Confidence falls in ambiguous range between high and low thresholds."
        
        # ============================================
        # STEP 7: Explanation Generation (LLM-Assisted)
        # Handles uncertainty explanations
        # ============================================
        explanation, gemini_assessment, gemini_confidence = await llm_service.generate_explanation(
            eczema_probability=eczema_probability,
            prediction_state=prediction_state,
            severity=severity,
            image_bytes=image_bytes,
            uncertainty_reason=uncertainty_reason if prediction_state == "Uncertain" else None
        )
        
        # ============================================
        # GEMINI OUTPUT LOGGING
        # ============================================
        print("\n" + "="*60)
        print("🧠 GEMINI OUTPUT")
        print("="*60)
        print(f"🔍 Gemini Assessment: {gemini_assessment}")
        print(f"📊 Gemini Confidence: {gemini_confidence}")
        print(f"💬 Explanation: {explanation[:200]}..." if explanation and len(explanation) > 200 else f"💬 Explanation: {explanation}")
        print("="*60 + "\n")
        
        # ============================================
        # GEMINI OVERRIDE LOGIC
        # Trust Gemini for distinguishing eczema from OTHER skin conditions
        # The model was trained on eczema vs healthy skin, so it may misclassify
        # other skin diseases as eczema. Gemini helps correct this.
        # ============================================
        
        if gemini_assessment is not None:
            # ============================================
            # SMART OVERRIDE LOGIC
            # Combines model probability with Gemini's visual analysis
            # ============================================
            
            print(f"\n📊 DECISION INPUTS:")
            print(f"   Model probability: {eczema_probability:.2%}")
            print(f"   Model state: {prediction_state}")
            print(f"   Gemini assessment: {'Eczema' if gemini_assessment else 'Not Eczema'}")
            print(f"   Gemini confidence: {gemini_confidence:.2f}" if gemini_confidence else "   Gemini confidence: N/A")
            
            # CASE 1: Model says Eczema (>=60% probability)
            if prediction_state == "Eczema":
                # Trust the model - it was trained specifically for this
                # Only override if Gemini is VERY confident it's not eczema (rare)
                if gemini_assessment == False and gemini_confidence and gemini_confidence >= 0.9:
                    print("\n⚠️ GEMINI OVERRIDE: Model detected eczema but Gemini very confident it's not")
                    prediction_state = "Normal"
                    final_confidence = gemini_confidence
                    final_eczema_detected = False
                    severity = None
                # Otherwise, keep the model's Eczema prediction
                    
            # CASE 2: Model says Normal (<20% probability)
            elif prediction_state == "Normal":
                # Model thinks it's normal, but check if Gemini sees eczema
                if gemini_assessment == True:
                    # Gemini detected eczema - trust Gemini more for eczema detection
                    # Lower threshold to catch more eczema cases
                    if gemini_confidence and gemini_confidence >= 0.70 and eczema_probability >= 0.15:
                        print("\n✅ GEMINI DETECTED ECZEMA (model gave low probability)")
                        print(f"   Model: {eczema_probability:.2%}, Gemini: {gemini_confidence:.2%}")
                        prediction_state = "Eczema"
                        final_confidence = gemini_confidence
                        final_eczema_detected = True
                        severity = await severity_estimator.estimate_severity(
                            processed_image,
                            gemini_confidence,
                            {"eczema_probability": gemini_confidence}
                        )
                    elif gemini_confidence and gemini_confidence >= 0.80:
                        # High Gemini confidence, even if model was very low
                        print("\n✅ GEMINI DETECTED ECZEMA (high confidence override)")
                        prediction_state = "Eczema"
                        final_confidence = gemini_confidence
                        final_eczema_detected = True
                        severity = await severity_estimator.estimate_severity(
                            processed_image,
                            gemini_confidence,
                            {"eczema_probability": gemini_confidence}
                        )
                # If Gemini also says normal (False), keep Normal
                    
            # CASE 3: Model is Uncertain (20-35% probability)
            elif prediction_state == "Uncertain":
                # For uncertain cases, trust Gemini more - lower threshold
                if gemini_assessment == True and gemini_confidence and gemini_confidence >= 0.65:
                    print("\n✅ GEMINI RESOLVED UNCERTAINTY: Detected eczema")
                    print(f"   Model: {eczema_probability:.2%}, Gemini: {gemini_confidence:.2%}")
                    prediction_state = "Eczema"
                    final_confidence = gemini_confidence
                    final_eczema_detected = True
                    severity = await severity_estimator.estimate_severity(
                        processed_image,
                        gemini_confidence,
                        {"eczema_probability": gemini_confidence}
                    )
                elif gemini_assessment == False and gemini_confidence and gemini_confidence >= 0.70:
                    print("\n✅ GEMINI RESOLVED UNCERTAINTY: Not eczema")
                    prediction_state = "Normal"
                    final_confidence = gemini_confidence
                    final_eczema_detected = False
                    severity = None
        
        # ============================================
        # FALLBACK: When Gemini fails, be more conservative for borderline cases
        # ============================================
        if gemini_assessment is None and prediction_state == "Normal" and 0.20 <= eczema_probability < 0.40:
            # Gemini failed but model gave borderline probability (20-40%)
            # Be conservative: mark as Uncertain rather than Normal (might be eczema)
            print(f"\n⚠️ GEMINI FAILED - Conservative fallback: Borderline probability ({eczema_probability:.2%}) marked as Uncertain")
            prediction_state = "Uncertain"
            final_confidence = 0.5
            final_eczema_detected = False
            severity = None
            uncertainty_reason = "Gemini analysis unavailable. Model probability is in borderline range (20-40%)."
        
        # Build reasoning string
        reasoning_parts = []
        
        # Check if Gemini overrode the model
        gemini_overrode = gemini_assessment is not None and (
            (gemini_assessment == False and eczema_probability >= 0.6) or  # Model said eczema, Gemini said no
            (gemini_assessment == True and eczema_probability <= 0.4)      # Model said normal, Gemini said yes
        )
        
        if gemini_overrode:
            if prediction_state == "Normal" and gemini_assessment == False:
                reasoning_parts.append("Vision analysis indicates this is NOT eczema.")
                reasoning_parts.append("The image may show a different skin condition or healthy skin.")
            elif prediction_state == "Eczema" and gemini_assessment == True:
                reasoning_parts.append("Vision analysis confirmed eczema detection.")
        elif prediction_state == "Uncertain":
            reasoning_parts.append(f"Uncertainty detected: {uncertainty_reason or 'Confidence in ambiguous range'}.")
        else:
            reasoning_parts.append(f"Confidence band: {confidence_band}.")
            if prediction_state == "Eczema":
                reasoning_parts.append(f"High confidence eczema detection ({int(final_confidence * 100)}%).")
            else:
                reasoning_parts.append(f"No eczema detected ({int(final_confidence * 100)}% confidence).")
        
        reasoning = " ".join(reasoning_parts)
        
        # ============================================
        # FINAL DECISION LOGGING
        # ============================================
        print("\n" + "="*60)
        print("✅ FINAL DECISION")
        print("="*60)
        print(f"🎯 Prediction State: {prediction_state}")
        print(f"📊 Final Confidence: {final_confidence:.4f} ({final_confidence*100:.2f}%)")
        print(f"🔴 Eczema Detected: {final_eczema_detected}")
        print(f"📈 Severity: {severity if severity else 'N/A'}")
        print(f"💭 Reasoning: {reasoning[:150]}..." if len(reasoning) > 150 else f"💭 Reasoning: {reasoning}")
        print("="*60 + "\n")
        
        # ============================================
        # Build Final Response
        # ============================================
        return AnalysisResponse(
            relevant=True,
            prediction=prediction_state,
            eczema_detected=final_eczema_detected,
            confidence=round(final_confidence, 2),
            severity=severity,
            explanation=explanation,
            reasoning=reasoning,
            message=None if prediction_state != "Uncertain" else "The image shows patterns that cannot be confidently classified as eczema or normal skin.",
            disclaimer="This is an AI-based assessment and not a medical diagnosis. Please consult a healthcare professional for proper medical advice."
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

