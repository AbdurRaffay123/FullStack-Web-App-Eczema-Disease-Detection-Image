"""
Response Schemas for API
Updated to support three-state prediction: Eczema | Normal | Uncertain
"""

from pydantic import BaseModel, Field
from typing import Optional, Literal


class AnalysisResponse(BaseModel):
    """
    Standard analysis response with three-state prediction
    
    Prediction states:
    - "Eczema": High confidence eczema detected
    - "Normal": High confidence no eczema
    - "Uncertain": Ambiguous or OOD input (other skin conditions, low confidence, pattern mismatch)
    """
    relevant: bool = Field(..., description="Whether image is relevant (human skin)")
    prediction: Literal["Eczema", "Normal", "Uncertain"] = Field(
        ...,
        description="Final prediction state: Eczema, Normal, or Uncertain"
    )
    eczema_detected: bool = Field(
        ...,
        description="Legacy field: True if prediction is 'Eczema', False otherwise"
    )
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score (0-1)")
    severity: Optional[str] = Field(
        None,
        description="Severity level: Mild, Moderate, or Severe (only when prediction is 'Eczema')"
    )
    explanation: Optional[str] = Field(
        None,
        description="LLM-generated explanation with uncertainty handling"
    )
    message: Optional[str] = Field(None, description="Additional message")
    reasoning: Optional[str] = Field(
        None,
        description="Detailed reasoning for the prediction, including uncertainty explanation"
    )
    disclaimer: str = Field(
        default="This is an AI-based assessment and not a medical diagnosis.",
        description="Safety disclaimer"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "relevant": True,
                "prediction": "Eczema",
                "eczema_detected": True,
                "confidence": 0.87,
                "severity": "Moderate",
                "explanation": "The image shows skin patterns that moderately resemble eczema based on redness and texture.",
                "reasoning": "High confidence detection with consistent visual features.",
                "disclaimer": "This is an AI-based assessment and not a medical diagnosis."
            }
        }


class ErrorResponse(BaseModel):
    """Error response schema"""
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Detailed error information")





