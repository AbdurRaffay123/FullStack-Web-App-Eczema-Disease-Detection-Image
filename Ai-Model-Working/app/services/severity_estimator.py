"""
Severity Estimator - Estimates eczema severity based on visual features
"""

import cv2
import numpy as np
from typing import Dict, Any, Optional


class SeverityEstimator:
    """
    Estimates eczema severity (Mild, Moderate, Severe)
    Based on heuristics: probability, redness, affected area, texture
    """
    
    def __init__(self):
        # Severity thresholds
        self.mild_threshold = 0.5
        self.moderate_threshold = 0.7
        self.severe_threshold = 0.85
    
    async def estimate_severity(
        self,
        image: np.ndarray,
        eczema_probability: float,
        prediction_result: Dict[str, Any]
    ) -> str:
        """
        Estimate severity level based on multiple factors
        
        Args:
            image: Preprocessed image (RGB, may be normalized 0-1 or uint8 0-255)
            eczema_probability: Model's eczema probability (0-1)
            prediction_result: Full prediction result dictionary
        
        Returns:
            Severity level: "Mild", "Moderate", or "Severe"
        """
        try:
            # Ensure image is in correct format (uint8, 0-255 range)
            if image.dtype != np.uint8:
                # Convert float (0-1) to uint8 (0-255)
                if image.max() <= 1.0:
                    image = (image * 255).astype(np.uint8)
                else:
                    image = image.astype(np.uint8)
            
            # Ensure image has 3 channels
            if len(image.shape) != 3 or image.shape[2] != 3:
                # If grayscale, convert to RGB
                if len(image.shape) == 2:
                    image = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)
                else:
                    raise ValueError(f"Unexpected image shape: {image.shape}")
            
            # Convert RGB to BGR for OpenCV
            bgr_image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
            
            # Factor 1: Model confidence
            confidence_score = eczema_probability
            
            # Factor 2: Redness intensity (eczema often shows redness)
            redness_score = self._calculate_redness(bgr_image)
            
            # Factor 3: Affected area estimation
            affected_area_score = self._estimate_affected_area(bgr_image)
            
            # Factor 4: Texture irregularity
            texture_score = self._calculate_texture_irregularity(bgr_image)
            
            # Combine factors with weights
            # Higher weights for model confidence and redness
            combined_score = (
                confidence_score * 0.4 +
                redness_score * 0.3 +
                affected_area_score * 0.2 +
                texture_score * 0.1
            )
            
            # Determine severity based on combined score
            if combined_score >= self.severe_threshold:
                return "Severe"
            elif combined_score >= self.moderate_threshold:
                return "Moderate"
            else:
                return "Mild"
        
        except Exception as e:
            print(f"Error estimating severity: {e}")
            # Fallback to probability-based estimation
            if eczema_probability >= 0.85:
                return "Severe"
            elif eczema_probability >= 0.70:
                return "Moderate"
            else:
                return "Mild"
    
    def _calculate_redness(self, bgr_image: np.ndarray) -> float:
        """
        Calculate redness intensity in the image
        Returns normalized score (0-1)
        """
        try:
            # Convert to HSV
            hsv = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2HSV)
            
            # Red color range in HSV (red wraps around)
            # Lower red range
            lower_red1 = np.array([0, 50, 50])
            upper_red1 = np.array([10, 255, 255])
            mask1 = cv2.inRange(hsv, lower_red1, upper_red1)
            
            # Upper red range
            lower_red2 = np.array([170, 50, 50])
            upper_red2 = np.array([180, 255, 255])
            mask2 = cv2.inRange(hsv, lower_red2, upper_red2)
            
            red_mask = cv2.bitwise_or(mask1, mask2)
            red_pixel_count = np.sum(red_mask > 0)
            total_pixels = bgr_image.shape[0] * bgr_image.shape[1]
            
            # Normalize to 0-1 range
            redness_ratio = red_pixel_count / total_pixels
            return min(redness_ratio * 3, 1.0)  # Scale up and cap at 1.0
        
        except Exception as e:
            print(f"Error calculating redness: {e}")
            return 0.5  # Default moderate redness
    
    def _estimate_affected_area(self, bgr_image: np.ndarray) -> float:
        """
        Estimate the percentage of image showing affected skin
        Returns normalized score (0-1)
        """
        try:
            # Ensure image is uint8
            if bgr_image.dtype != np.uint8:
                if bgr_image.max() <= 1.0:
                    bgr_image = (bgr_image * 255).astype(np.uint8)
                else:
                    bgr_image = bgr_image.astype(np.uint8)
            
            # Convert to grayscale
            gray = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2GRAY)
            
            # Ensure grayscale is uint8 (should be, but double-check)
            if gray.dtype != np.uint8:
                if gray.max() <= 1.0:
                    gray = (gray * 255).astype(np.uint8)
                else:
                    gray = gray.astype(np.uint8)
            
            # Use adaptive threshold to find irregular areas
            # Eczema often shows texture variations
            adaptive_thresh = cv2.adaptiveThreshold(
                gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                cv2.THRESH_BINARY_INV, 11, 2
            )
            
            # Find contours of irregular areas
            contours, _ = cv2.findContours(
                adaptive_thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
            )
            
            if len(contours) == 0:
                return 0.3  # Default moderate
            
            # Calculate total area of contours
            total_area = sum(cv2.contourArea(c) for c in contours)
            image_area = bgr_image.shape[0] * bgr_image.shape[1]
            
            affected_ratio = total_area / image_area
            return min(affected_ratio * 2, 1.0)  # Scale and cap at 1.0
        
        except Exception as e:
            print(f"Error estimating affected area: {e}")
            return 0.5  # Default moderate
    
    def _calculate_texture_irregularity(self, bgr_image: np.ndarray) -> float:
        """
        Calculate texture irregularity (eczema often shows rough texture)
        Returns normalized score (0-1)
        """
        try:
            # Ensure image is uint8
            if bgr_image.dtype != np.uint8:
                if bgr_image.max() <= 1.0:
                    bgr_image = (bgr_image * 255).astype(np.uint8)
                else:
                    bgr_image = bgr_image.astype(np.uint8)
            
            # Convert to grayscale
            gray = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2GRAY)
            
            # Ensure grayscale is uint8
            if gray.dtype != np.uint8:
                if gray.max() <= 1.0:
                    gray = (gray * 255).astype(np.uint8)
                else:
                    gray = gray.astype(np.uint8)
            
            # Calculate Local Binary Pattern (LBP) variance
            # Higher variance indicates more texture irregularity
            lbp = self._local_binary_pattern(gray)
            texture_variance = np.var(lbp)
            
            # Normalize (typical range: 0-1000, normalize to 0-1)
            normalized_variance = min(texture_variance / 1000.0, 1.0)
            
            return normalized_variance
        
        except Exception as e:
            print(f"Error calculating texture irregularity: {e}")
            return 0.5  # Default moderate
    
    def _local_binary_pattern(self, image: np.ndarray, radius: int = 1, n_points: int = 8) -> np.ndarray:
        """
        Compute Local Binary Pattern for texture analysis
        Simplified version
        """
        try:
            h, w = image.shape
            lbp = np.zeros_like(image)
            
            for i in range(radius, h - radius):
                for j in range(radius, w - radius):
                    center = image[i, j]
                    code = 0
                    
                    # Check 8 neighbors
                    neighbors = [
                        image[i-1, j-1], image[i-1, j], image[i-1, j+1],
                        image[i, j+1], image[i+1, j+1], image[i+1, j],
                        image[i+1, j-1], image[i, j-1]
                    ]
                    
                    for k, neighbor in enumerate(neighbors):
                        if neighbor >= center:
                            code |= (1 << k)
                    
                    lbp[i, j] = code
            
            return lbp
        
        except Exception as e:
            print(f"Error computing LBP: {e}")
            return np.zeros_like(image)


