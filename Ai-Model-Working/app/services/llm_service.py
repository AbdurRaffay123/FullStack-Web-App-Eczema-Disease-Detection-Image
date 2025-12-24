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
    
    Supported models (from Google AI Studio - instruction-tuned versions):
    - gemma-3-27b-it (default - higher rate limits, 0/30 used)
    - gemma-3-12b-it (alternative)
    - gemma-3-4b-it (smaller, faster)
    - gemma-3-2b-it (smallest)
    - gemma-3-1b-it (tiny)
    - gemini-2.5-flash (alternative, may have rate limits)
    """
    
    def __init__(self, api_key: Optional[str] = None, model_name: str = "gemma-3-27b-it"):
        # Get API key from environment variable (official Google Gemini API key from AI Studio)
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.model_name = model_name
        # Official Google Gemini API endpoint (from Google AI Studio)
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"
    
    async def generate_explanation(
        self,
        eczema_probability: float,
        is_eczema: bool,
        severity: Optional[str] = None,
        image_bytes: Optional[bytes] = None
    ) -> tuple[str, Optional[bool], Optional[float]]:
        """
        Generate human-friendly explanation using LLM with vision analysis
        
        Args:
            eczema_probability: Custom model's eczema probability (0-1)
            is_eczema: Whether custom model detected eczema
            severity: Severity level if eczema detected
            image_bytes: Original image bytes for Gemini vision analysis
        
        Returns:
            Tuple of (explanation, gemini_eczema_detected, gemini_confidence)
            - explanation: Human-friendly explanation string
            - gemini_eczema_detected: Gemini's assessment (True/False/None)
            - gemini_confidence: Gemini's confidence (0-1 or None)
        """
        try:
            # If no API key, return fallback explanation
            if not self.api_key:
                return (self._generate_fallback_explanation(eczema_probability, is_eczema, severity), None, None)
            
            # Call Google Gemini API with image if available (for vision analysis)
            if image_bytes:
                result = await self._call_gemini_api_with_vision(image_bytes, eczema_probability, is_eczema, severity)
                return result
            else:
                # Fallback to text-only if no image
                prompt = self._build_prompt(eczema_probability, is_eczema, severity)
                explanation = await self._call_gemini_api(prompt)
                return (explanation, None, None)
        
        except Exception as e:
            print(f"Error generating LLM explanation: {e}")
            # Fallback to rule-based explanation
            return self._generate_fallback_explanation(eczema_probability, is_eczema, severity)
    
    def _build_prompt(
        self,
        eczema_probability: float,
        is_eczema: bool,
        severity: Optional[str]
    ) -> str:
        """Build prompt for LLM"""
        
        confidence_percent = int(eczema_probability * 100)
        
        if is_eczema and severity:
            prompt = f"""You are a helpful AI assistant explaining skin analysis results. 

The AI model analyzed a skin image and found:
- Eczema probability: {confidence_percent}%
- Severity level: {severity}

Generate a brief, user-friendly explanation (2-3 sentences) that:
1. Explains what the AI detected in simple terms
2. Mentions the confidence level appropriately
3. Explains the severity level if applicable
4. Emphasizes this is NOT a medical diagnosis
5. Avoids giving medical advice

Keep it professional, empathetic, and clear. Do not use medical terminology unnecessarily."""
        else:
            prompt = f"""You are a helpful AI assistant explaining skin analysis results.

The AI model analyzed a skin image and found:
- Eczema probability: {confidence_percent}%
- Result: No strong eczema patterns detected

Generate a brief, user-friendly explanation (2-3 sentences) that:
1. Explains the result in simple terms
2. Mentions the confidence level appropriately
3. Emphasizes this is NOT a medical diagnosis
4. Avoids giving medical advice

Keep it professional, empathetic, and clear."""
        
        return prompt
    
    async def _call_gemini_api_with_vision(
        self,
        image_bytes: bytes,
        eczema_probability: float,
        is_eczema: bool,
        severity: Optional[str] = None
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
            enhanced_prompt = f"""You are analyzing a skin image for eczema detection.

A custom trained AI model has analyzed this image and provided:
- Eczema probability: {int(eczema_probability * 100)}%
- Detection result: {'Eczema detected' if is_eczema else 'No eczema detected'}
{f'- Severity: {severity}' if severity else ''}

CRITICAL: The custom model may have errors. Please:
1. Analyze the image yourself carefully
2. Look for signs of eczema: redness, inflammation, scaling, dryness, patches, irritation
3. Provide your own assessment

Respond in this EXACT JSON format:
{{
  "gemini_assessment": true/false,  // Your assessment: true if you see eczema, false if not
  "gemini_confidence": 0.0-1.0,     // Your confidence (0.0 to 1.0)
  "explanation": "Your explanation here"  // 3-4 sentences describing what you see, comparing with model, emphasizing NOT a diagnosis
}}

Be honest and accurate. If you see clear eczema signs that the model missed, say so."""
            
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
            
            # Call Google Gemini API with vision
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
                        gemini_text = parts[0]["text"].strip()
                        
                        # Try to parse JSON response
                        try:
                            # Extract JSON from response (might be wrapped in markdown code blocks)
                            import re
                            json_match = re.search(r'\{[^{}]*"gemini_assessment"[^{}]*\}', gemini_text, re.DOTALL)
                            if json_match:
                                gemini_json = json.loads(json_match.group())
                                gemini_assessment = gemini_json.get("gemini_assessment")
                                gemini_confidence = gemini_json.get("gemini_confidence")
                                explanation = gemini_json.get("explanation", gemini_text)
                                
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
            prompt = self._build_prompt(eczema_probability, is_eczema, severity)
            explanation = await self._call_gemini_api(prompt)
            return (explanation, None, None)
        except Exception as e:
            print(f"Gemini vision API call failed: {e}")
            # Fallback to text-only API
            prompt = self._build_prompt(eczema_probability, is_eczema, severity)
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
        is_eczema: bool,
        severity: Optional[str] = None
    ) -> str:
        """Generate rule-based explanation as fallback"""
        
        confidence_percent = int(eczema_probability * 100)
        
        if is_eczema:
            if severity == "Severe":
                return (
                    f"The AI analysis indicates a high probability ({confidence_percent}%) "
                    f"of eczema patterns with severe characteristics. The image shows "
                    f"significant redness and texture changes. This is an AI assessment, "
                    f"not a medical diagnosis."
                )
            elif severity == "Moderate":
                return (
                    f"The AI analysis indicates a moderate probability ({confidence_percent}%) "
                    f"of eczema patterns. The image shows moderate redness and texture "
                    f"irregularities consistent with eczema. This is an AI assessment, "
                    f"not a medical diagnosis."
                )
            else:  # Mild
                return (
                    f"The AI analysis indicates a moderate probability ({confidence_percent}%) "
                    f"of mild eczema patterns. The image shows some characteristics that "
                    f"may resemble eczema. This is an AI assessment, not a medical diagnosis."
                )
        else:
            return (
                f"The AI analysis shows a low probability ({confidence_percent}%) of eczema "
                f"patterns. The image does not show strong indicators of eczema. "
                f"This is an AI assessment, not a medical diagnosis."
            )


