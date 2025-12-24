"""
Response Schemas for API
"""

from pydantic import BaseModel, Field
from typing import Optional


class AnalysisResponse(BaseModel):
    """Standard analysis response"""
    relevant: bool = Field(..., description="Whether image is relevant (human skin)")
    eczema_detected: bool = Field(..., description="Whether eczema is detected")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score (0-1)")
    severity: Optional[str] = Field(None, description="Severity level: Mild, Moderate, or Severe")
    explanation: Optional[str] = Field(None, description="LLM-generated explanation")
    message: Optional[str] = Field(None, description="Additional message")
    disclaimer: str = Field(
        default="This is an AI-based assessment and not a medical diagnosis.",
        description="Safety disclaimer"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "relevant": True,
                "eczema_detected": True,
                "confidence": 0.87,
                "severity": "Moderate",
                "explanation": "The image shows skin patterns that moderately resemble eczema based on redness and texture.",
                "disclaimer": "This is an AI-based assessment and not a medical diagnosis."
            }
        }


class ErrorResponse(BaseModel):
    """Error response schema"""
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Detailed error information")


