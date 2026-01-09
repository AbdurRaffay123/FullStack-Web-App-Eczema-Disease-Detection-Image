"""
LLM Service - Uses Official Google Gemini API from AI Studio
https://aistudio.google.com/app
"""

import os
from typing import Optional
import requests
import json


class LLMService:
    """
    Service for generating human-friendly explanations using Official Google Gemini API
    API Key from: https://aistudio.google.com/app
    
    Supported models with VISION capabilities (for image analysis):
    - gemini-1.5-pro (BEST for accuracy - recommended for medical image analysis) ⭐ RECOMMENDED
    - gemini-1.5-flash (FAST - good balance of speed and accuracy)
    - gemini-2.0-flash-exp (Latest experimental - best performance, may have rate limits)
    
    NOTE: Gemma models (gemma-3-27b-it, etc.) are TEXT-ONLY and do NOT support vision/image analysis!
    For medical image analysis, gemini-1.5-pro provides the best accuracy.
    """
    
    def __init__(self, api_key: Optional[str] = None, model_name: str = "gemini-1.5-pro"):
        # Get API key from environment variable (official Google Gemini API key from AI Studio)
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.model_name = model_name
        # Official Google Gemini API endpoint (from Google AI Studio)
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"
    
    async def generate_explanation(
        self,
        eczema_probability: float,
        prediction_state: str,  # "Eczema", "Normal", or "Uncertain"
        severity: Optional[str] = None,
        image_bytes: Optional[bytes] = None,
        uncertainty_reason: Optional[str] = None
    ) -> tuple[str, Optional[bool], Optional[float]]:
        """
        Generate human-friendly explanation using LLM with vision analysis
        
        Args:
            eczema_probability: Custom model's eczema probability (0-1)
            prediction_state: Final prediction state ("Eczema", "Normal", or "Uncertain")
            severity: Severity level if eczema detected
            image_bytes: Original image bytes for Gemini vision analysis
            uncertainty_reason: Reason for uncertainty if prediction_state is "Uncertain"
        
        Returns:
            Tuple of (explanation, gemini_eczema_detected, gemini_confidence)
            - explanation: Human-friendly explanation string with uncertainty handling
            - gemini_eczema_detected: Gemini's assessment (True/False/None)
            - gemini_confidence: Gemini's confidence (0-1 or None)
        """
        try:
            # If no API key, return fallback explanation
            if not self.api_key:
                return (self._generate_fallback_explanation(eczema_probability, prediction_state, severity, uncertainty_reason), None, None)
            
            # Call Google Gemini API with image if available (for vision analysis)
            if image_bytes:
                result = await self._call_gemini_api_with_vision(image_bytes, eczema_probability, prediction_state, severity, uncertainty_reason)
                return result
            else:
                # Fallback to text-only if no image
                prompt = self._build_prompt(eczema_probability, prediction_state, severity, uncertainty_reason)
                explanation = await self._call_gemini_api(prompt)
                return (explanation, None, None)
        
        except Exception as e:
            print(f"Error generating LLM explanation: {e}")
            # Fallback to rule-based explanation
            return (self._generate_fallback_explanation(eczema_probability, prediction_state, severity, uncertainty_reason), None, None)
    
    def _build_prompt(
        self,
        eczema_probability: float,
        prediction_state: str,
        severity: Optional[str],
        uncertainty_reason: Optional[str] = None
    ) -> str:
        """Build prompt for LLM with uncertainty handling"""
        
        confidence_percent = int(eczema_probability * 100)
        
        if prediction_state == "Uncertain":
            prompt = f"""You are a helpful AI assistant explaining skin analysis results with uncertainty.

The AI model analyzed a skin image and found:
- Eczema probability: {confidence_percent}%
- Prediction state: Uncertain / Other Skin Condition
- Uncertainty reason: {uncertainty_reason or "Confidence falls in ambiguous range"}

Generate a brief, user-friendly explanation (3-4 sentences) that:
1. Explains that the image shows patterns that don't clearly match eczema or healthy skin
2. States that the system cannot confidently classify it
3. Mentions this may indicate a different skin condition (but DO NOT name specific diseases)
4. Emphasizes this is NOT a medical diagnosis
5. Strongly recommends consulting a healthcare professional
6. Avoids giving medical advice
7. Uses non-medical language

Example tone: "The image shows skin patterns that do not clearly match eczema or healthy skin, so the system cannot confidently classify it. This may indicate a different skin condition, but the system is only trained to detect eczema. Please consult a healthcare professional for proper evaluation."

Keep it professional, empathetic, and clear. Never name specific diseases other than eczema."""
        
        elif prediction_state == "Eczema" and severity:
            prompt = f"""You are a helpful AI assistant explaining skin analysis results. 

The AI model analyzed a skin image and found:
- Eczema probability: {confidence_percent}%
- Prediction: Eczema detected
- Severity level: {severity}

Generate a brief, user-friendly explanation (2-3 sentences) that:
1. Explains what the AI detected in simple terms
2. Mentions the confidence level appropriately
3. Explains the severity level if applicable
4. Emphasizes this is NOT a medical diagnosis
5. Avoids giving medical advice
6. Recommends consulting a healthcare professional

Keep it professional, empathetic, and clear. Do not use medical terminology unnecessarily."""
        
        else:  # Normal
            prompt = f"""You are a helpful AI assistant explaining skin analysis results.

The AI model analyzed a skin image and found:
- Eczema probability: {confidence_percent}%
- Prediction: No eczema detected

Generate a brief, user-friendly explanation (2-3 sentences) that:
1. Explains the result in simple terms
2. Mentions the confidence level appropriately
3. Emphasizes this is NOT a medical diagnosis
4. Avoids giving medical advice
5. Notes that other skin conditions may still be present

Keep it professional, empathetic, and clear."""
        
        return prompt
    
    async def _call_gemini_api_with_vision(
        self,
        image_bytes: bytes,
        eczema_probability: float,
        prediction_state: str,
        severity: Optional[str] = None,
        uncertainty_reason: Optional[str] = None
    ) -> tuple[str, Optional[bool], Optional[float]]:
        """
        Call Google Gemini API with vision (image analysis)
        Gemini will analyze the image directly and provide its own assessment
        This allows Gemini to correct the custom model's mistakes
        """
        try:
            import base64
            
            # Encode image to base64
            image_base64 = base64.b64encode(image_bytes).decode('utf-8')
            
            # Detect image MIME type
            import imghdr
            from io import BytesIO
            image_format = imghdr.what(None, h=image_bytes)
            mime_type_map = {
                'jpeg': 'image/jpeg',
                'jpg': 'image/jpeg',
                'png': 'image/png',
                'gif': 'image/gif',
                'webp': 'image/webp'
            }
            mime_type = mime_type_map.get(image_format, 'image/jpeg')
            
            # Enhanced prompt that asks Gemini to analyze the image AND provide its assessment
            # Updated to handle uncertainty state
            if prediction_state == "Uncertain":
                enhanced_prompt = f"""You are a dermatology AI assistant. The model is uncertain about this image.

MODEL ANALYSIS:
- Eczema probability: {int(eczema_probability * 100)}%
- Status: Uncertain
- Reason: {uncertainty_reason or "Confidence in ambiguous range"}

PERFORM A TWO-STAGE ANALYSIS:

**STAGE 1: Is this skin PATHOLOGICALLY abnormal?**
HEALTHY skin (return FALSE):
✓ Uniform skin tone, smooth texture
✓ Natural variations (freckles, moles, minor redness)
✓ No visible lesions, patches, or inflammation

DISEASED skin (proceed to Stage 2):
✗ Visible rash, lesions, or abnormal patches
✗ Scaling, crusting, or flaking
✗ Obvious inflammation or skin damage

**STAGE 2: If abnormal, is it ECZEMA?**
ECZEMA signs (return TRUE):
• Red, inflamed patches with scaling/dryness
• Visible scratch damage or lichenification
• Vesicles, crusting, or weeping areas
• Located in typical areas (folds, hands, face)

NOT eczema (return FALSE):
• Psoriasis (silvery scales, sharp borders)
• Ringworm (ring pattern)
• Healthy skin

DECISION RULES:
1. Healthy skin → FALSE
2. Clear eczema → TRUE
3. Other skin condition → FALSE
4. Cannot determine → null

IMPORTANT: Normal skin is NOT eczema. Only TRUE if clear pathological eczema signs.

JSON response:
{{
  "gemini_assessment": true/false/null,
  "gemini_confidence": 0.0-1.0,
  "explanation": "2-3 sentences. Recommend dermatologist consultation. NOT a diagnosis."
}}"""
            else:
                enhanced_prompt = f"""You are a dermatology AI assistant performing eczema detection.

MODEL ANALYSIS:
- Eczema probability from trained model: {int(eczema_probability * 100)}%
- Model result: {'Eczema detected' if prediction_state == 'Eczema' else 'No eczema detected'}
{f'- Estimated severity: {severity}' if severity else ''}

PERFORM A TWO-STAGE ANALYSIS:

**STAGE 1: Is this skin PATHOLOGICALLY abnormal?**
HEALTHY skin (return FALSE):
✓ Uniform skin tone (even if naturally darker or lighter)
✓ Smooth texture without lesions
✓ Natural skin variations (freckles, moles, beauty marks)
✓ Minor temporary redness (from pressure, temperature, or emotion)
✓ Normal skin folds and creases
✓ No visible inflammation, scaling, or patches

DISEASED skin (proceed to Stage 2):
✗ Visible rash, lesions, or abnormal patches
✗ Significant inflammation or swelling
✗ Scaling, crusting, or flaking skin
✗ Visible scratch marks or excoriations
✗ Oozing, weeping, or blistering areas
✗ Obvious skin discoloration beyond natural variation

**STAGE 2: If abnormal, is it ECZEMA specifically?**
ECZEMA characteristics (return TRUE):
• Red, inflamed patches (especially in skin folds, hands, face)
• Dry, scaly, or flaky skin patches
• Visible itching damage (scratch marks, raw areas)
• Lichenification (thickened, leathery skin from chronic scratching)
• Vesicles or small fluid-filled bumps
• Crusted or weeping areas from scratching
• Symmetric distribution (often affects both sides)

NOT ECZEMA - other conditions (return FALSE):
• Psoriasis: Silvery-white scales, sharply defined borders
• Ringworm: Clear ring-shaped pattern with central clearing
• Acne: Pimples, blackheads, whiteheads on face/back
• Sunburn: Uniform redness matching sun exposure
• Healthy skin with natural variations

DECISION RULES:
1. Healthy/normal skin → FALSE (confidence 0.8-0.95)
2. Clear eczema signs (inflammation + scaling/itching damage) → TRUE (confidence 0.7-0.95)
3. Skin condition but NOT eczema → FALSE (confidence 0.6-0.8)
4. Ambiguous/unclear → null (confidence 0.3-0.5)

IMPORTANT: Do NOT over-diagnose. Normal skin variations are NOT eczema.

Respond in EXACT JSON:
{{
  "gemini_assessment": true/false/null,
  "gemini_confidence": 0.0-1.0,
  "explanation": "2-3 sentences. State what you observe and why. This is NOT a medical diagnosis."
}}"""
            
            headers = {
                "x-goog-api-key": self.api_key,
                "Content-Type": "application/json"
            }
            
            # Gemini API payload with image
            payload = {
                "contents": [
                    {
                        "parts": [
                            {
                                "text": enhanced_prompt
                            },
                            {
                                "inline_data": {
                                    "mime_type": mime_type,
                                    "data": image_base64
                                }
                            }
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 300,
                }
            }
            
            # Call Google Gemini API with vision (with retry logic for 503 errors)
            api_url = f"{self.base_url}/models/{self.model_name}:generateContent"
            
            # Retry logic for 503 (overloaded) errors
            max_retries = 3
            retry_delay = 2  # seconds
            import asyncio
            response = None
            
            for attempt in range(max_retries):
                try:
                    response = requests.post(
                        api_url,
                        headers=headers,
                        json=payload,
                        timeout=30
                    )
                    
                    # If 503 error, retry with exponential backoff
                    if response.status_code == 503 and attempt < max_retries - 1:
                        wait_time = retry_delay * (2 ** attempt)  # Exponential backoff: 2s, 4s, 8s
                        print(f"⚠️ Gemini API overloaded (503). Retrying in {wait_time}s... (attempt {attempt + 1}/{max_retries})")
                        await asyncio.sleep(wait_time)
                        continue
                    
                    response.raise_for_status()
                    break  # Success, exit retry loop
                    
                except requests.exceptions.HTTPError as e:
                    if hasattr(e, 'response') and e.response and e.response.status_code == 503 and attempt < max_retries - 1:
                        wait_time = retry_delay * (2 ** attempt)
                        print(f"⚠️ Gemini API overloaded (503). Retrying in {wait_time}s... (attempt {attempt + 1}/{max_retries})")
                        await asyncio.sleep(wait_time)
                        continue
                    else:
                        raise  # Re-raise if not 503 or last attempt
                except Exception as e:
                    if attempt < max_retries - 1:
                        wait_time = retry_delay * (2 ** attempt)
                        print(f"⚠️ Gemini API error: {str(e)}. Retrying in {wait_time}s... (attempt {attempt + 1}/{max_retries})")
                        await asyncio.sleep(wait_time)
                    else:
                        raise
            
            if not response or response.status_code == 503:
                raise requests.exceptions.HTTPError(f"Gemini API still overloaded after {max_retries} attempts")
            
            result = response.json()
            
            # ============================================
            # GEMINI API RAW RESPONSE LOGGING
            # ============================================
            print("\n" + "-"*60)
            print("📡 GEMINI API RAW RESPONSE")
            print("-"*60)
            print(f"🔗 API URL: {api_url}")
            print(f"📦 Response Status: {response.status_code}")
            print(f"📄 Response Keys: {list(result.keys())}")
            if "candidates" in result:
                print(f"📋 Candidates Count: {len(result['candidates'])}")
            print("-"*60)
            
            # Extract the explanation from Gemini API response
            if "candidates" in result and len(result["candidates"]) > 0:
                candidate = result["candidates"][0]
                if "content" in candidate and "parts" in candidate["content"]:
                    parts = candidate["content"]["parts"]
                    if len(parts) > 0 and "text" in parts[0]:
                        gemini_text = parts[0]["text"].strip()
                        
                        print("\n" + "-"*60)
                        print("📝 GEMINI RAW TEXT RESPONSE")
                        print("-"*60)
                        print(f"📄 Full Text Length: {len(gemini_text)} characters")
                        print(f"📄 Text Preview: {gemini_text[:300]}..." if len(gemini_text) > 300 else f"📄 Full Text: {gemini_text}")
                        print("-"*60 + "\n")
                        
                        # Try to parse JSON response
                        try:
                            # Extract JSON from response (might be wrapped in markdown code blocks)
                            import re
                            json_match = re.search(r'\{[^{}]*"gemini_assessment"[^{}]*\}', gemini_text, re.DOTALL)
                            if json_match:
                                gemini_json = json.loads(json_match.group())
                                gemini_assessment_raw = gemini_json.get("gemini_assessment")
                                # Handle null/None values
                                if gemini_assessment_raw is None or str(gemini_assessment_raw).lower() == 'null':
                                    gemini_assessment = None
                                else:
                                    gemini_assessment = bool(gemini_assessment_raw)
                                gemini_confidence = gemini_json.get("gemini_confidence")
                                explanation = gemini_json.get("explanation", gemini_text)
                                
                                print("\n" + "-"*60)
                                print("✅ GEMINI PARSED JSON RESPONSE")
                                print("-"*60)
                                print(f"🎯 Assessment: {gemini_assessment}")
                                print(f"📊 Confidence: {gemini_confidence}")
                                print(f"💬 Explanation Length: {len(explanation)} characters")
                                print(f"📋 Full JSON: {gemini_json}")
                                print("-"*60 + "\n")
                                
                                return (explanation, gemini_assessment, gemini_confidence)
                        except:
                            pass
                        
                        # If JSON parsing fails, return text explanation
                        # Try to infer assessment from text
                        text_lower = gemini_text.lower()
                        gemini_assessment = None
                        gemini_confidence = None
                        
                        # Simple heuristics to detect if Gemini sees eczema
                        if any(word in text_lower for word in ['eczema', 'redness', 'inflammation', 'irritation', 'see signs', 'detect', 'present']):
                            if 'no eczema' not in text_lower and 'not see' not in text_lower:
                                gemini_assessment = True
                                gemini_confidence = 0.7
                        
                        return (gemini_text, gemini_assessment, gemini_confidence)
            
            raise ValueError("Unexpected API response format")
        
        except requests.exceptions.HTTPError as e:
            error_msg = f"Gemini API HTTP error: {e.response.status_code}"
            if e.response.text:
                try:
                    error_data = e.response.json()
                    error_msg += f" - {error_data.get('error', {}).get('message', 'Unknown error')}"
                except:
                    error_msg += f" - {e.response.text[:200]}"
            print(f"Gemini vision API call failed: {error_msg}")
            # Fallback to text-only API
            prompt = self._build_prompt(eczema_probability, prediction_state, severity, uncertainty_reason)
            explanation = await self._call_gemini_api(prompt)
            return (explanation, None, None)
        except Exception as e:
            print(f"Gemini vision API call failed: {e}")
            # Fallback to text-only API
            prompt = self._build_prompt(eczema_probability, prediction_state, severity, uncertainty_reason)
            explanation = await self._call_gemini_api(prompt)
            return (explanation, None, None)
    
    async def _call_gemini_api(self, prompt: str) -> str:
        """
        Call Google Gemini API directly
        """
        try:
            # Google Gemini API uses x-goog-api-key header
            headers = {
                "x-goog-api-key": self.api_key,
                "Content-Type": "application/json"
            }
            
            # Gemini API payload format
            payload = {
                "contents": [
                    {
                        "parts": [
                            {
                                "text": prompt
                            }
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 200,
                }
            }
            
            # Call Google Gemini API
            api_url = f"{self.base_url}/models/{self.model_name}:generateContent"
            response = requests.post(
                api_url,
                headers=headers,
                json=payload,
                timeout=30
            )
            response.raise_for_status()
            result = response.json()
            
            # Extract the explanation from Gemini API response
            if "candidates" in result and len(result["candidates"]) > 0:
                candidate = result["candidates"][0]
                if "content" in candidate and "parts" in candidate["content"]:
                    parts = candidate["content"]["parts"]
                    if len(parts) > 0 and "text" in parts[0]:
                        explanation = parts[0]["text"].strip()
                        return explanation
            
            raise ValueError("Unexpected API response format")
        
        except requests.exceptions.HTTPError as e:
            error_msg = f"Gemini API HTTP error: {e.response.status_code}"
            if e.response.text:
                try:
                    error_data = e.response.json()
                    error_msg += f" - {error_data.get('error', {}).get('message', 'Unknown error')}"
                except:
                    error_msg += f" - {e.response.text[:200]}"
            print(f"Gemini API call failed: {error_msg}")
            raise Exception(error_msg)
        except Exception as e:
            print(f"Gemini API call failed: {e}")
            raise
    
    def _generate_fallback_explanation(
        self,
        eczema_probability: float,
        prediction_state: str,
        severity: Optional[str] = None,
        uncertainty_reason: Optional[str] = None
    ) -> str:
        """Generate rule-based explanation as fallback with uncertainty handling"""
        
        confidence_percent = int(eczema_probability * 100)
        
        if prediction_state == "Uncertain":
            return (
                f"The AI analysis shows an ambiguous result ({confidence_percent}% probability). "
                f"The image shows skin patterns that do not clearly match eczema or healthy skin, "
                f"so the system cannot confidently classify it. {uncertainty_reason or 'Confidence falls in an ambiguous range.'} "
                f"This may indicate a different skin condition, but the system is only trained to detect eczema. "
                f"This is an AI assessment, not a medical diagnosis. Please consult a healthcare professional for proper evaluation."
            )
        elif prediction_state == "Eczema":
            if severity == "Severe":
                return (
                    f"The AI analysis indicates a high probability ({confidence_percent}%) "
                    f"of eczema patterns with severe characteristics. The image shows "
                    f"significant redness and texture changes. This is an AI assessment, "
                    f"not a medical diagnosis. Please consult a healthcare professional for proper medical advice."
                )
            elif severity == "Moderate":
                return (
                    f"The AI analysis indicates a moderate probability ({confidence_percent}%) "
                    f"of eczema patterns. The image shows moderate redness and texture "
                    f"irregularities consistent with eczema. This is an AI assessment, "
                    f"not a medical diagnosis. Please consult a healthcare professional for proper medical advice."
                )
            else:  # Mild
                return (
                    f"The AI analysis indicates a moderate probability ({confidence_percent}%) "
                    f"of mild eczema patterns. The image shows some characteristics that "
                    f"may resemble eczema. This is an AI assessment, not a medical diagnosis. "
                    f"Please consult a healthcare professional for proper medical advice."
                )
        else:  # Normal
            return (
                f"The AI analysis shows a low probability ({confidence_percent}%) of eczema "
                f"patterns. The image does not show strong indicators of eczema. "
                f"However, other skin conditions may still be present. "
                f"This is an AI assessment, not a medical diagnosis."
            )


