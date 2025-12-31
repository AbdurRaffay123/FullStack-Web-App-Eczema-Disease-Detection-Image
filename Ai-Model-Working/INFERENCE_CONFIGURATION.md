# Inference Configuration & Uncertainty Detection

This document describes the confidence banding and uncertainty detection configuration for the eczema detection AI system.

## 🎯 Core Design Principles

1. **Never force binary decisions when confidence is ambiguous**
2. **OOD (Out-of-Distribution) inputs must be handled explicitly**
3. **Human face skin is valid input**
4. **Model ≠ Diagnosis**
5. **Uncertainty is a first-class output**

## 📊 Confidence Banding

The system uses three confidence bands to route predictions:

### Configuration (Environment Variables)

All thresholds are configurable via environment variables:

```bash
# High confidence threshold (default: 0.75)
# Predictions above this are routed to "Eczema" or "Normal"
HIGH_CONFIDENCE_THRESHOLD=0.75

# Low confidence threshold (default: 0.25)
# Predictions below this are routed to "Normal"
LOW_CONFIDENCE_THRESHOLD=0.25

# Uncertainty band boundaries (default: 0.35 - 0.65)
# Predictions in this range are routed to "Uncertain"
UNCERTAINTY_BAND_LOWER=0.35
UNCERTAINTY_BAND_UPPER=0.65

# Texture variance thresholds for OOD detection
TEXTURE_VARIANCE_LOW=50.0      # Below this = abnormal (too smooth)
TEXTURE_VARIANCE_HIGH=2000.0   # Above this = abnormal (too complex)

# Pattern mismatch detection threshold
CONFIDENCE_TEXTURE_MISMATCH=0.3  # If confidence-texture similarity < this, route to Uncertain
```

### Decision Logic

```
IF confidence >= HIGH_CONFIDENCE_THRESHOLD (0.75):
    → Route to "Eczema" (if probability > 0.5) or "Normal" (if probability < 0.5)
    
ELIF confidence <= LOW_CONFIDENCE_THRESHOLD (0.25):
    → Route to "Normal"
    
ELIF confidence in UNCERTAINTY_BAND (0.35 - 0.65):
    → Route to "Uncertain / Other Skin Condition"
    
ELSE:
    → Apply uncertainty detection heuristics
```

## 🔍 Uncertainty Detection Heuristics

The system routes to "Uncertain" state when ANY of these conditions are met:

### 1. Confidence Band Evaluation
- Confidence falls in mid-range (35% - 65%)
- Ambiguous between eczema and normal

### 2. Feature Variance Analysis
- Texture variance is abnormal (too smooth or too complex)
- Indicates OOD (Out-of-Distribution) input
- May represent different skin condition

### 3. Pattern Mismatch Detection
- High confidence (>75%) but low texture similarity (<30%)
- Visual patterns don't match eczema characteristics
- Likely false positive for other skin disease

### 4. Visual Feature Consistency
- Confidence and visual strength are misaligned
- High confidence + low visual indicators = inconsistent
- Low confidence + high visual indicators = inconsistent

## 🎨 Three-State Prediction System

### State 1: "Eczema"
- **Trigger**: High confidence (≥75%) AND probability > 0.5 AND passes uncertainty checks
- **Severity**: Estimated (Mild, Moderate, Severe)
- **Confidence**: High (≥75%)
- **Use Case**: Clear eczema patterns detected

### State 2: "Normal"
- **Trigger**: High confidence (≥75%) AND probability ≤ 0.5 OR low confidence (≤25%)
- **Severity**: None
- **Confidence**: High for "no eczema"
- **Use Case**: Clear healthy skin or low eczema probability

### State 3: "Uncertain / Other Skin Condition"
- **Trigger**: 
  - Confidence in mid-range (35% - 65%), OR
  - Abnormal texture variance, OR
  - Pattern mismatch detected, OR
  - Feature inconsistency
- **Severity**: None
- **Confidence**: Adjusted to 0.5 (neutral)
- **Use Case**: 
  - Ambiguous patterns
  - Possible other skin condition
  - OOD input
  - Low confidence

## 🔧 Relevance Detection (Fixed)

### Accepts:
- ✅ Face skin
- ✅ Arms
- ✅ Legs
- ✅ Neck
- ✅ Torso
- ✅ All human skin areas

### Rejects:
- ❌ Non-human images
- ❌ Non-skin images
- ❌ Images with insufficient skin content (<10% skin pixels)

### Thresholds:
- **Minimum skin percentage**: 10% (reduced from 15% to accept faces)
- **Edge density range**: 0.03 - 0.5 (expanded for face features)
- **Variance threshold**: 50 (reduced from 100 for smoother face skin)

## 📝 API Response Format

```json
{
  "relevant": true,
  "prediction": "Eczema" | "Normal" | "Uncertain",
  "eczema_detected": true | false,
  "confidence": 0.87,
  "severity": "Moderate" | null,
  "explanation": "LLM-generated explanation...",
  "reasoning": "Confidence band: high. High confidence eczema detection (87%).",
  "message": null | "Uncertainty message...",
  "disclaimer": "This is an AI-based assessment and not a medical diagnosis..."
}
```

## 🚀 Inference Pipeline (Strict Order)

1. **Image Validation** (format, size)
2. **Human Skin / Face Relevance Check** (accepts faces)
3. **Model Inference** (binary prediction)
4. **Confidence Band Evaluation**
5. **OOD / Uncertainty Detection**
6. **Final Decision Mapping** (Eczema | Normal | Uncertain)
7. **Explanation Generation** (LLM-assisted with uncertainty handling)

## ⚙️ Tuning Recommendations

### For Stricter Uncertainty Detection:
```bash
HIGH_CONFIDENCE_THRESHOLD=0.80
LOW_CONFIDENCE_THRESHOLD=0.20
UNCERTAINTY_BAND_LOWER=0.30
UNCERTAINTY_BAND_UPPER=0.70
```

### For More Lenient Uncertainty Detection:
```bash
HIGH_CONFIDENCE_THRESHOLD=0.70
LOW_CONFIDENCE_THRESHOLD=0.30
UNCERTAINTY_BAND_LOWER=0.40
UNCERTAINTY_BAND_UPPER=0.60
```

## 🔒 Safety Rules

1. **Never show "eczema" when confidence is ambiguous**
2. **Never block valid human images** (especially faces)
3. **Never imply medical certainty**
4. **Always prefer Uncertain over wrong prediction**
5. **Never name specific diseases** (other than eczema)

## 📚 References

- Uncertainty detection: `app/services/uncertainty_detector.py`
- Relevance detection: `app/services/relevance_detector.py`
- Main pipeline: `app/main.py`
- Response schema: `app/schemas/response.py`

