# AI-Powered Eczema Detection System: Technical Documentation and Research Paper

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Architecture and Components](#architecture-and-components)
4. [AI Models Used](#ai-models-used)
5. [Complete Workflow](#complete-workflow)
6. [Technical Implementation Details](#technical-implementation-details)
7. [Safety and Ethical Considerations](#safety-and-ethical-considerations)
8. [Results and Output Format](#results-and-output-format)
9. [Performance and Limitations](#performance-and-limitations)
10. [Conclusion](#conclusion)

---

## Executive Summary

This document describes an AI-powered eczema detection system that combines deep learning computer vision models with large language models (LLMs) to analyze skin images and provide assessments. The system uses a custom-trained EfficientNet model for initial detection and Google's Gemini AI model for validation and explanation generation. The system is designed as a microservice that can be integrated into healthcare applications, providing users with preliminary skin condition assessments while emphasizing that results are not medical diagnoses.

**Key Features:**
- Automated eczema pattern detection in skin images
- Severity estimation (Mild, Moderate, Severe)
- Human-readable explanations using AI
- Safety checks to ensure only relevant images are analyzed
- Non-diagnostic language and disclaimers

---

## System Overview

### Purpose
The system is designed to assist users in preliminary assessment of skin conditions, specifically focusing on eczema detection. It serves as a tool for awareness and early detection, encouraging users to seek professional medical advice when needed.

### Technology Stack
- **Framework**: FastAPI (Python web framework)
- **Deep Learning**: TensorFlow/Keras
- **Computer Vision**: OpenCV, PIL (Python Imaging Library)
- **Large Language Model**: Google Gemini API (Gemma-3-27B-IT model)
- **Image Processing**: NumPy, OpenCV
- **API Communication**: RESTful API with JSON responses

### System Type
Microservice architecture - a standalone service that can be called by other applications (mobile apps, web applications, etc.) to analyze images.

---

## Architecture and Components

The system consists of five main components that work together:

### 1. **Image Processor** (`image_processor.py`)
   - **Purpose**: Prepares images for AI model analysis
   - **Function**: Converts uploaded images to the format required by the AI model
   - **Process**: 
     - Validates image format and size
     - Converts to RGB color format
     - Resizes to 224x224 pixels (standard size for EfficientNet)
     - Normalizes pixel values to 0-1 range

### 2. **Relevance Detector** (`relevance_detector.py`)
   - **Purpose**: Ensures only relevant images (human skin) are analyzed
   - **Function**: Uses computer vision techniques to detect if the image contains human skin
   - **Method**: 
     - Analyzes skin color ranges in HSV color space
     - Checks image texture and complexity
     - Verifies edge density (skin has characteristic patterns)
   - **Safety Feature**: Prevents analysis of irrelevant images (objects, animals, etc.)

### 3. **Model Service** (`model_service.py`)
   - **Purpose**: Loads and runs the deep learning model
   - **Model**: EfficientNet-based eczema detection model (`eczema_detector_efficientnet.h5`)
   - **Function**: 
     - Loads the pre-trained model at startup
     - Processes images through the neural network
     - Outputs probability scores (0-1) indicating likelihood of eczema

### 4. **Severity Estimator** (`severity_estimator.py`)
   - **Purpose**: Estimates the severity level of detected eczema
   - **Function**: Analyzes multiple visual features to determine severity
   - **Factors Considered**:
     - Model confidence score (40% weight)
     - Redness intensity (30% weight)
     - Affected area percentage (20% weight)
     - Texture irregularity (10% weight)
   - **Output**: Categorizes as "Mild", "Moderate", or "Severe"

### 5. **LLM Service** (`llm_service.py`)
   - **Purpose**: Generates human-readable explanations
   - **Model**: Google Gemini API (Gemma-3-27B-IT)
   - **Function**: 
     - Analyzes the image directly using vision capabilities
     - Validates or corrects the custom model's assessment
     - Generates natural language explanations
     - Provides confidence scores from its own analysis

---

## AI Models Used

### 1. EfficientNet Model (Custom Trained)

**Model Type**: Convolutional Neural Network (CNN)
**Architecture**: EfficientNet-B0 or similar variant
**Purpose**: Primary eczema detection

**Technical Details**:
- **Input Size**: 224x224 pixels RGB images
- **Output**: Binary classification (eczema probability: 0.0 to 1.0)
- **Training**: Pre-trained on eczema dataset (specific training details depend on model source)
- **File Format**: Keras/TensorFlow H5 format
- **File Location**: `models/eczema_detector_efficientnet.h5`

**Why EfficientNet?**
- EfficientNet is a family of models designed for efficiency and accuracy
- Provides good balance between model size and performance
- Widely used in medical image analysis
- Can run efficiently on standard hardware

**How It Works**:
1. The model receives a preprocessed 224x224 RGB image
2. Multiple convolutional layers extract features (edges, textures, patterns)
3. The network learns to recognize eczema-related visual patterns:
   - Redness and inflammation
   - Scaling and dryness
   - Texture irregularities
   - Color variations
4. Final layer outputs a probability score indicating likelihood of eczema

### 2. Google Gemini (Gemma-3-27B-IT)

**Model Type**: Large Language Model (LLM) with Vision Capabilities
**Provider**: Google AI Studio
**Model Name**: `gemma-3-27b-it` (27 billion parameters, instruction-tuned)
**Purpose**: Validation, correction, and explanation generation

**Technical Details**:
- **API**: Google Generative Language API
- **Capabilities**: 
  - Text generation
  - Image analysis (vision)
  - Natural language understanding
- **Input**: Can receive both text prompts and images
- **Output**: Natural language explanations and assessment scores

**Why Gemini?**
- Advanced vision capabilities to analyze images directly
- Can validate and correct the custom model's predictions
- Generates human-friendly explanations
- Instruction-tuned for better following of prompts
- Provides additional confidence assessment

**How It Works**:
1. Receives the original image and the custom model's prediction
2. Analyzes the image directly using its vision capabilities
3. Compares its assessment with the custom model's prediction
4. Can correct errors if the custom model missed eczema or made false positives
5. Generates natural language explanation describing what it sees

**Alternative Models Available**:
- `gemma-3-12b-it` (12B parameters - smaller, faster)
- `gemma-3-4b-it` (4B parameters - compact)
- `gemma-3-2b-it` (2B parameters - lightweight)
- `gemini-2.5-flash` (Google's flash model)

---

## Complete Workflow

### Step-by-Step Process Flow

```
User Uploads Image
        ↓
[Step 1] Image Validation & Preprocessing
        ↓
[Step 2] Relevance Detection (Skin Detection)
        ↓
[Step 3] Custom Model Prediction (EfficientNet)
        ↓
[Step 4] Severity Estimation
        ↓
[Step 5] Gemini Vision Analysis & Validation
        ↓
[Step 6] Result Fusion (Combine both assessments)
        ↓
[Step 7] Generate Explanation
        ↓
[Step 8] Return Structured Response
```

### Detailed Workflow Explanation

#### **Step 1: Image Validation & Preprocessing**

**What Happens**:
- System receives image file from user
- Validates file type (must be image: JPEG, PNG, etc.)
- Validates file size (maximum 10MB)
- Reads image bytes into memory

**Image Processing**:
- Converts image to RGB format (standard color format)
- Resizes to 224x224 pixels (required by EfficientNet model)
- Normalizes pixel values from 0-255 range to 0-1 range
- Ensures image is in correct format for AI model

**Why This Matters**: 
- Consistent input format ensures reliable model predictions
- Standardization allows the model to work with images from different sources
- Normalization helps the neural network process the data correctly

#### **Step 2: Relevance Detection (Skin Detection)**

**What Happens**:
- System checks if the uploaded image contains human skin
- Uses computer vision techniques (not AI model) to detect skin

**Detection Method**:
1. **Skin Color Detection**:
   - Converts image to HSV color space (better for color detection)
   - Identifies pixels matching human skin color ranges
   - Calculates percentage of skin-colored pixels

2. **Texture Analysis**:
   - Analyzes edge density (skin has characteristic edge patterns)
   - Checks image complexity (not too smooth, not too complex)
   - Calculates image variance (ensures sufficient detail)

3. **Decision Criteria**:
   - At least 15% of image must be skin-colored
   - Edge density between 5% and 40%
   - Image variance above 100 (ensures detail)

**If Image is Not Relevant**:
- Returns early response indicating image doesn't appear to be human skin
- Suggests user upload a clear photo of affected skin area
- Does not proceed to model analysis

**Why This Matters**:
- Prevents wasting computational resources on irrelevant images
- Ensures only appropriate images are analyzed
- Improves user experience by catching errors early

#### **Step 3: Custom Model Prediction (EfficientNet)**

**What Happens**:
- Preprocessed image is fed into the EfficientNet model
- Model processes image through multiple neural network layers
- Model outputs probability score

**Model Processing**:
1. **Feature Extraction**:
   - Convolutional layers identify visual patterns
   - Lower layers detect edges and basic shapes
   - Higher layers detect complex patterns (redness, texture, scaling)

2. **Pattern Recognition**:
   - Model compares image features to learned eczema patterns
   - Identifies characteristics associated with eczema:
     - Redness and inflammation
     - Dryness and scaling
     - Texture irregularities
     - Color variations

3. **Probability Calculation**:
   - Final layer outputs probability between 0.0 and 1.0
   - 0.0 = Very unlikely to be eczema
   - 1.0 = Very likely to be eczema
   - Threshold: >0.5 = Eczema detected

**Output**:
- `eczema_probability`: Float value (0.0 to 1.0)
- `normal_probability`: 1.0 - eczema_probability
- Raw prediction values for further analysis

**Why This Matters**:
- Provides initial assessment based on learned patterns
- Fast and efficient processing
- Foundation for further analysis

#### **Step 4: Severity Estimation**

**What Happens** (only if eczema is detected):
- System analyzes visual features to estimate severity
- Combines multiple factors into severity score

**Factors Analyzed**:

1. **Model Confidence** (40% weight):
   - Higher probability = higher confidence
   - Direct indicator of model certainty

2. **Redness Intensity** (30% weight):
   - Converts image to HSV color space
   - Identifies red-colored pixels (inflammation indicator)
   - Calculates percentage of red pixels
   - More redness = higher severity

3. **Affected Area** (20% weight):
   - Uses adaptive thresholding to find irregular areas
   - Identifies contours of affected regions
   - Calculates percentage of image showing affected skin
   - Larger affected area = higher severity

4. **Texture Irregularity** (10% weight):
   - Calculates Local Binary Pattern (LBP) variance
   - Measures texture roughness
   - Eczema often shows rough, irregular texture
   - Higher variance = higher severity

**Severity Calculation**:
- Combined score = (confidence × 0.4) + (redness × 0.3) + (area × 0.2) + (texture × 0.1)
- **Severe**: Combined score ≥ 0.85
- **Moderate**: Combined score ≥ 0.70
- **Mild**: Combined score < 0.70

**Why This Matters**:
- Provides actionable information beyond simple detection
- Helps users understand condition severity
- Guides appropriate response (mild vs. severe)

#### **Step 5: Gemini Vision Analysis & Validation**

**What Happens**:
- Original image is sent to Google Gemini API
- Gemini analyzes image directly using its vision capabilities
- Gemini provides its own assessment

**Gemini's Process**:
1. **Direct Image Analysis**:
   - Gemini receives the original image (not preprocessed)
   - Uses its vision model to analyze visual features
   - Identifies eczema-related patterns independently

2. **Comparison with Custom Model**:
   - Receives custom model's prediction and probability
   - Compares its assessment with custom model's assessment
   - Can identify discrepancies

3. **Error Correction**:
   - If Gemini sees eczema but custom model missed it → Trusts Gemini
   - If both agree → Uses weighted average
   - If Gemini disagrees with custom model → Adjusts confidence

**Gemini Output**:
- `gemini_assessment`: Boolean (True/False/None)
- `gemini_confidence`: Float (0.0 to 1.0)
- `explanation`: Natural language description

**Why This Matters**:
- Provides validation layer (two independent assessments)
- Can catch errors made by custom model
- More reliable final assessment
- Better user trust

#### **Step 6: Result Fusion**

**What Happens**:
- System combines assessments from both models
- Makes final decision based on agreement/disagreement

**Fusion Logic**:

**Case 1: Both Models Agree (Eczema Detected)**
- Final detection: Eczema detected
- Final confidence: Weighted average favoring Gemini
- Formula: `(custom_probability × 0.4) + (gemini_confidence × 0.6)`

**Case 2: Custom Model Missed, Gemini Detected**
- Final detection: Eczema detected (trust Gemini)
- Final confidence: Gemini's confidence (or 0.7 default)
- Reason: Gemini has vision capabilities, custom model may have missed subtle signs

**Case 3: Custom Model Detected, Gemini Disagrees**
- Final detection: May be adjusted based on combined confidence
- Final confidence: Weighted average (custom × 0.3 + gemini × 0.7)
- If combined confidence < 0.5: Final detection = No eczema

**Case 4: Both Agree (No Eczema)**
- Final detection: No eczema
- Final confidence: 1.0 - custom_probability

**Why This Matters**:
- Combines strengths of both models
- Reduces false positives and false negatives
- More accurate final assessment

#### **Step 7: Generate Explanation**

**What Happens**:
- Gemini generates human-readable explanation
- Explanation describes what was detected
- Includes confidence level and severity (if applicable)
- Emphasizes non-diagnostic nature

**Explanation Content**:
- What the AI detected (in simple terms)
- Confidence level explanation
- Severity level (if eczema detected)
- Comparison between models (if relevant)
- Clear statement that this is not a medical diagnosis

**Example Explanation**:
> "The AI analysis indicates a moderate probability (75%) of eczema patterns. The image shows redness and texture irregularities consistent with moderate eczema. Both the custom model and Gemini vision analysis detected similar patterns. This is an AI assessment, not a medical diagnosis. Please consult a healthcare professional for proper medical advice."

**Why This Matters**:
- Makes technical results understandable
- Builds user trust through transparency
- Emphasizes safety and limitations

#### **Step 8: Return Structured Response**

**What Happens**:
- System formats all results into structured JSON response
- Includes all relevant information
- Adds safety disclaimers

**Response Structure**:
```json
{
  "relevant": true,
  "eczema_detected": true,
  "confidence": 0.87,
  "severity": "Moderate",
  "explanation": "The AI analysis indicates...",
  "disclaimer": "This is an AI-based assessment and not a medical diagnosis..."
}
```

**Response Fields**:
- `relevant`: Whether image contained human skin
- `eczema_detected`: Final detection result (True/False)
- `confidence`: Confidence score (0.0 to 1.0)
- `severity`: Severity level if eczema detected (Mild/Moderate/Severe)
- `explanation`: Human-readable explanation
- `disclaimer`: Safety disclaimer

---

## Technical Implementation Details

### API Endpoints

#### 1. Health Check Endpoint
- **URL**: `GET /health`
- **Purpose**: Check if service is running and model is loaded
- **Response**: Service status and model availability

#### 2. Analyze Endpoint
- **URL**: `POST /analyze`
- **Purpose**: Main analysis endpoint
- **Input**: Image file (multipart/form-data)
- **Output**: AnalysisResponse JSON

### Error Handling

**Image Validation Errors**:
- Invalid file type → 400 Bad Request
- File too large → 400 Bad Request
- Invalid image format → 400 Bad Request

**Model Errors**:
- Model not loaded → 503 Service Unavailable
- Prediction failure → 500 Internal Server Error

**API Errors**:
- Gemini API failure → Falls back to rule-based explanation
- Network errors → Returns error message

### Performance Considerations

**Model Loading**:
- Model loads once at startup (not per request)
- Reduces latency for subsequent requests
- Memory efficient

**Image Processing**:
- Asynchronous processing for better performance
- Efficient preprocessing pipeline
- Optimized for standard image sizes

**API Calls**:
- Gemini API calls are asynchronous
- Timeout set to 30 seconds
- Fallback mechanisms prevent complete failure

### Security Features

1. **Input Validation**: All inputs validated before processing
2. **File Size Limits**: Maximum 10MB file size
3. **Image Format Validation**: Only standard image formats accepted
4. **Error Handling**: Comprehensive error handling prevents crashes
5. **Non-Diagnostic Language**: All outputs emphasize non-diagnostic nature

---

## Safety and Ethical Considerations

### Safety Features

1. **Relevance Detection**:
   - Ensures only human skin images are analyzed
   - Prevents misuse on inappropriate images
   - Protects user privacy

2. **Non-Diagnostic Language**:
   - All outputs clearly state "not a medical diagnosis"
   - Explanations avoid medical terminology
   - Emphasizes need for professional consultation

3. **Confidence Scores**:
   - Provides uncertainty information
   - Users understand limitations
   - Not presented as certainties

4. **Disclaimers**:
   - Every response includes safety disclaimer
   - Clear statement about limitations
   - Encourages professional medical advice

5. **Error Handling**:
   - Graceful degradation if services fail
   - Fallback explanations available
   - No silent failures

### Ethical Considerations

1. **Not a Replacement for Medical Care**:
   - System explicitly states it's not a diagnosis
   - Encourages professional consultation
   - Serves as preliminary assessment tool

2. **Transparency**:
   - Users understand AI is being used
   - Confidence scores show uncertainty
   - Explanation describes what AI detected

3. **Privacy**:
   - Images processed temporarily
   - No permanent storage mentioned
   - Secure API communication

4. **Bias Mitigation**:
   - Uses multiple models for validation
   - Can detect and correct errors
   - Reduces single-model bias

---

## Results and Output Format

### Success Response Format

**When Eczema is Detected**:
```json
{
  "relevant": true,
  "eczema_detected": true,
  "confidence": 0.87,
  "severity": "Moderate",
  "explanation": "The AI analysis indicates a moderate probability (87%) of eczema patterns. The image shows redness and texture irregularities consistent with moderate eczema. Both the custom model and Gemini vision analysis detected similar patterns. This is an AI assessment, not a medical diagnosis. Please consult a healthcare professional for proper medical advice.",
  "disclaimer": "This is an AI-based assessment and not a medical diagnosis. Please consult a healthcare professional for proper medical advice."
}
```

**When No Eczema is Detected**:
```json
{
  "relevant": true,
  "eczema_detected": false,
  "confidence": 0.85,
  "message": "No strong eczema patterns detected in the image.",
  "explanation": "The AI analysis shows a low probability (15%) of eczema patterns. The image does not show strong indicators of eczema. This is an AI assessment, not a medical diagnosis.",
  "disclaimer": "This is an AI-based assessment and not a medical diagnosis."
}
```

**When Image is Not Relevant**:
```json
{
  "relevant": false,
  "eczema_detected": false,
  "confidence": 0.0,
  "message": "Uploaded image does not appear to be human skin. Reasons: insufficient skin-colored pixels (8.2%). Please upload a clear photo of affected skin area.",
  "disclaimer": "This is an AI-based assessment and not a medical diagnosis."
}
```

### Confidence Score Interpretation

- **0.0 - 0.3**: Very low confidence (unlikely eczema)
- **0.3 - 0.5**: Low confidence (possibly eczema)
- **0.5 - 0.7**: Moderate confidence (likely eczema)
- **0.7 - 0.85**: High confidence (very likely eczema)
- **0.85 - 1.0**: Very high confidence (strongly indicates eczema)

### Severity Levels

- **Mild**: Early stage, minor symptoms, low impact
- **Moderate**: Noticeable symptoms, moderate impact, may need attention
- **Severe**: Significant symptoms, high impact, professional consultation recommended

---

## Performance and Limitations

### Performance Metrics

**Processing Time** (approximate):
- Image preprocessing: < 100ms
- Relevance detection: < 200ms
- Model prediction: < 500ms
- Severity estimation: < 300ms
- Gemini API call: 1-3 seconds
- **Total**: ~2-4 seconds per image

**Accuracy Considerations**:
- Custom model accuracy depends on training data
- Gemini provides validation layer
- Combined approach improves reliability
- Not validated against clinical gold standard

### Limitations

1. **Not a Medical Diagnosis**:
   - System is for preliminary assessment only
   - Cannot replace professional medical evaluation
   - May have false positives and false negatives

2. **Image Quality Dependency**:
   - Requires clear, well-lit images
   - Poor image quality affects accuracy
   - May not work well with blurry or dark images

3. **Skin Tone Considerations**:
   - Model trained on specific datasets
   - May have varying accuracy across skin tones
   - Relevance detection uses general skin color ranges

4. **Severity Estimation**:
   - Based on visual features only
   - Not based on clinical severity scales
   - Heuristic-based, not medically validated

5. **Model Limitations**:
   - Custom model may miss subtle cases
   - May have false positives
   - Requires good training data

6. **API Dependencies**:
   - Requires internet for Gemini API
   - API rate limits may apply
   - Service unavailable if API fails

### Future Improvements

1. **Model Enhancement**:
   - Train on more diverse datasets
   - Include more skin tones
   - Improve accuracy through better training

2. **Severity Estimation**:
   - Use clinically validated severity scales
   - Incorporate more visual features
   - Improve accuracy

3. **Explanation Quality**:
   - More detailed explanations
   - Include specific visual findings
   - Better user education

4. **Performance**:
   - Optimize processing pipeline
   - Reduce API call latency
   - Improve caching strategies

---

## Conclusion

This AI-powered eczema detection system represents a combination of deep learning computer vision and large language models to provide preliminary skin condition assessments. The system uses a custom-trained EfficientNet model for initial detection, validated and enhanced by Google's Gemini vision model, with comprehensive safety features and non-diagnostic language throughout.

**Key Achievements**:
- Automated eczema pattern detection
- Severity estimation based on visual features
- Human-readable explanations using AI
- Safety checks and relevance detection
- Dual-model validation for improved accuracy

**Important Notes**:
- This system is designed for preliminary assessment only
- It is NOT a replacement for professional medical diagnosis
- Users should always consult healthcare professionals for proper medical advice
- The system emphasizes its limitations and non-diagnostic nature

**Research Contribution**:
This system demonstrates how combining specialized deep learning models with general-purpose vision-language models can improve accuracy and provide better user experience in healthcare-related AI applications. The dual-model approach, with validation and error correction capabilities, represents a practical approach to improving reliability in medical image analysis applications.

---

## References and Technical Details

### Model Specifications

**EfficientNet Model**:
- Architecture: EfficientNet-B0 or similar
- Input: 224×224×3 RGB images
- Output: Binary classification probability
- Framework: TensorFlow/Keras
- Format: H5 (Keras SavedModel)

**Gemini Model**:
- Model: Gemma-3-27B-IT (27 billion parameters)
- Provider: Google AI Studio
- API: Google Generative Language API v1beta
- Capabilities: Text generation, vision analysis
- Endpoint: `https://generativelanguage.googleapis.com/v1beta`

### Dependencies

- FastAPI 0.104.1
- TensorFlow ≥2.16.1, <2.21.0
- NumPy ≥1.24.0, <2.0.0
- OpenCV ≥4.8.0
- Pillow 10.1.0
- Requests ≥2.31.0
- Pydantic ≥2.5.0

### System Requirements

- Python 3.8+
- Minimum 4GB RAM (for model loading)
- Internet connection (for Gemini API)
- GPU optional (CPU works but slower)

---

**Document Version**: 1.0  
**Last Updated**: 2025  
**Author**: Research Team  
**Contact**: [Your Contact Information]

---

*This document is intended for research and educational purposes. The system described is not a medical device and should not be used as a replacement for professional medical diagnosis or treatment.*

