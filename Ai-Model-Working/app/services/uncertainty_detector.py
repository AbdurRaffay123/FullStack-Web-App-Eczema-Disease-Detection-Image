"""
Uncertainty Detector - Detects OOD inputs and ambiguous predictions
Handles cases where model confidence is unreliable or patterns don't match training distribution
"""

import cv2
import numpy as np
from typing import Dict, Any, Tuple
import os


class UncertaintyDetector:
    """
    Detects uncertainty and out-of-distribution (OOD) inputs
    
    Purpose:
    - Prevents false positives for other skin diseases
    - Identifies ambiguous confidence ranges
    - Detects pattern mismatches
    - Routes uncertain cases to "Uncertain / Other Skin Condition" state
    """
    
    def __init__(self):
        # Confidence banding thresholds (configurable via environment)
        # These define when to route to "Uncertain" state
        # RELAXED: Lower high threshold to trust model more
        self.high_confidence_threshold = float(os.getenv("HIGH_CONFIDENCE_THRESHOLD", "0.60"))  # Was 0.75
        self.low_confidence_threshold = float(os.getenv("LOW_CONFIDENCE_THRESHOLD", "0.40"))    # Was 0.25
        self.uncertainty_band_lower = float(os.getenv("UNCERTAINTY_BAND_LOWER", "0.40"))        # Was 0.35
        self.uncertainty_band_upper = float(os.getenv("UNCERTAINTY_BAND_UPPER", "0.60"))        # Was 0.65
        
        # Feature variance thresholds for OOD detection
        # RELAXED: Wider acceptable range
        self.texture_variance_threshold_low = float(os.getenv("TEXTURE_VARIANCE_LOW", "10.0"))   # Was 50.0
        self.texture_variance_threshold_high = float(os.getenv("TEXTURE_VARIANCE_HIGH", "5000.0"))  # Was 2000.0
        
        # Pattern mismatch detection thresholds
        # RELAXED: Higher threshold means less sensitive to mismatches
        self.confidence_texture_mismatch_threshold = float(os.getenv("CONFIDENCE_TEXTURE_MISMATCH", "0.15"))  # Was 0.3
        
        # Minimum factors required to trigger uncertainty
        self.min_uncertainty_factors = int(os.getenv("MIN_UNCERTAINTY_FACTORS", "2"))  # NEW: Require multiple factors
    
    async def evaluate_uncertainty(
        self,
        image: np.ndarray,
        eczema_probability: float,
        prediction_result: Dict[str, Any]
    ) -> Tuple[bool, str, float]:
        """
        Evaluate if prediction should be routed to "Uncertain" state
        
        Args:
            image: Preprocessed image (RGB, normalized or uint8)
            eczema_probability: Model's eczema probability (0-1)
            prediction_result: Full prediction result dictionary
        
        Returns:
            Tuple of (is_uncertain, reason, adjusted_confidence)
            - is_uncertain: True if should route to Uncertain state
            - reason: Explanation for uncertainty
            - adjusted_confidence: Confidence score adjusted for uncertainty
        """
        try:
            # Ensure image is in correct format
            if image.dtype != np.uint8:
                if image.max() <= 1.0:
                    image_uint8 = (image * 255).astype(np.uint8)
                else:
                    image_uint8 = image.astype(np.uint8)
            else:
                image_uint8 = image
            
            # Ensure 3 channels
            if len(image_uint8.shape) != 3 or image_uint8.shape[2] != 3:
                if len(image_uint8.shape) == 2:
                    image_uint8 = cv2.cvtColor(image_uint8, cv2.COLOR_GRAY2RGB)
                else:
                    # If can't process, default to uncertain
                    return True, "Image format not suitable for uncertainty analysis", 0.5
            
            # Convert RGB to BGR for OpenCV
            bgr_image = cv2.cvtColor(image_uint8, cv2.COLOR_RGB2BGR)
            
            # Factor 1: Confidence Band Evaluation
            # If confidence falls in mid-range, it's ambiguous
            confidence_in_uncertainty_band = (
                self.uncertainty_band_lower <= eczema_probability <= self.uncertainty_band_upper
            )
            
            # Factor 2: Feature Variance Analysis
            # OOD inputs often have abnormal texture variance
            texture_variance = self._calculate_texture_variance(bgr_image)
            abnormal_variance = (
                texture_variance < self.texture_variance_threshold_low or
                texture_variance > self.texture_variance_threshold_high
            )
            
            # Factor 3: Pattern Mismatch Detection
            # High confidence but low texture similarity suggests mismatch
            texture_similarity = self._calculate_texture_similarity(bgr_image, eczema_probability)
            pattern_mismatch = (
                eczema_probability > self.high_confidence_threshold and
                texture_similarity < self.confidence_texture_mismatch_threshold
            )
            
            # Factor 4: Visual Feature Consistency
            # Check if visual features align with confidence level
            feature_consistency = self._check_feature_consistency(bgr_image, eczema_probability)
            
            # Decision Logic: Route to Uncertain only if MULTIPLE conditions are met
            # This prevents over-aggressive uncertainty detection
            uncertainty_factors = []
            
            # Factor weights (higher = more significant)
            if confidence_in_uncertainty_band:
                uncertainty_factors.append(("confidence falls in ambiguous range", 2))  # Weight 2 - very significant
            
            if abnormal_variance:
                uncertainty_factors.append(("texture patterns are inconsistent", 1))  # Weight 1
            
            if pattern_mismatch:
                uncertainty_factors.append(("visual patterns don't match eczema", 1))  # Weight 1
            
            if not feature_consistency:
                uncertainty_factors.append(("visual features inconsistent with confidence", 1))  # Weight 1
            
            # Calculate total weight
            total_weight = sum(weight for _, weight in uncertainty_factors)
            uncertainty_reasons = [reason for reason, _ in uncertainty_factors]
            
            # CRITICAL: Only route to Uncertain if:
            # 1. Confidence is truly in the ambiguous band (0.40-0.60), OR
            # 2. Multiple other factors present (total weight >= min_uncertainty_factors)
            # 
            # HIGH CONFIDENCE (>= 0.60) should NOT be easily overridden
            is_in_ambiguous_band = self.uncertainty_band_lower <= eczema_probability <= self.uncertainty_band_upper
            has_multiple_issues = total_weight >= self.min_uncertainty_factors
            
            # If confidence is HIGH (>= 0.60), don't mark as uncertain unless there are severe issues
            if eczema_probability >= self.high_confidence_threshold:
                # High confidence - trust the model, don't mark uncertain
                is_uncertain = False
                reason = ""
                adjusted_confidence = eczema_probability
            elif eczema_probability <= self.low_confidence_threshold:
                # Low confidence - this is "Normal", don't mark uncertain
                is_uncertain = False
                reason = ""
                adjusted_confidence = eczema_probability
            elif is_in_ambiguous_band and has_multiple_issues:
                # Truly ambiguous: in mid-range AND has multiple issues
                is_uncertain = True
                reason = f"Uncertain classification: {', '.join(uncertainty_reasons)}. " + \
                        "The image may show a different skin condition or the patterns are ambiguous."
                adjusted_confidence = 0.5
            else:
                # Not enough evidence for uncertainty - trust the model
                is_uncertain = False
                reason = ""
                adjusted_confidence = eczema_probability
            
            # Log uncertainty evaluation
            print(f"\n📊 Uncertainty Evaluation:")
            print(f"   Eczema Probability: {eczema_probability:.4f}")
            print(f"   In Ambiguous Band (0.40-0.60): {is_in_ambiguous_band}")
            print(f"   Uncertainty Factors: {len(uncertainty_factors)} (weight: {total_weight})")
            print(f"   Factors: {uncertainty_reasons if uncertainty_reasons else 'None'}")
            print(f"   Is Uncertain: {is_uncertain}")
            print(f"   Adjusted Confidence: {adjusted_confidence:.4f}\n")
            
            return is_uncertain, reason, adjusted_confidence
        
        except Exception as e:
            print(f"Error in uncertainty evaluation: {e}")
            # On error, default to uncertain (safe fallback)
            return True, f"Uncertainty analysis error: {str(e)}", 0.5
    
    def _calculate_texture_variance(self, bgr_image: np.ndarray) -> float:
        """
        Calculate texture variance to detect OOD patterns
        Returns variance value
        """
        try:
            gray = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2GRAY)
            if gray.dtype != np.uint8:
                if gray.max() <= 1.0:
                    gray = (gray * 255).astype(np.uint8)
                else:
                    gray = gray.astype(np.uint8)
            
            # Calculate Local Binary Pattern variance
            lbp = self._local_binary_pattern(gray)
            variance = np.var(lbp)
            return float(variance)
        
        except Exception as e:
            print(f"Error calculating texture variance: {e}")
            return 500.0  # Default moderate variance
    
    def _calculate_texture_similarity(self, bgr_image: np.ndarray, confidence: float) -> float:
        """
        Calculate how well texture patterns match expected eczema characteristics
        Returns similarity score (0-1)
        """
        try:
            gray = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2GRAY)
            if gray.dtype != np.uint8:
                if gray.max() <= 1.0:
                    gray = (gray * 255).astype(np.uint8)
                else:
                    gray = gray.astype(np.uint8)
            
            # Calculate edge density (eczema typically has moderate edge density)
            edges = cv2.Canny(gray, 50, 150)
            edge_density = np.sum(edges > 0) / (gray.shape[0] * gray.shape[1])
            
            # Expected edge density for eczema (moderate)
            expected_edge_density = 0.15
            edge_similarity = 1.0 - abs(edge_density - expected_edge_density) / 0.3
            edge_similarity = max(0.0, min(1.0, edge_similarity))
            
            # Calculate redness (eczema often shows redness)
            hsv = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2HSV)
            lower_red1 = np.array([0, 50, 50])
            upper_red1 = np.array([10, 255, 255])
            lower_red2 = np.array([170, 50, 50])
            upper_red2 = np.array([180, 255, 255])
            mask1 = cv2.inRange(hsv, lower_red1, upper_red1)
            mask2 = cv2.inRange(hsv, lower_red2, upper_red2)
            red_mask = cv2.bitwise_or(mask1, mask2)
            redness_ratio = np.sum(red_mask > 0) / (bgr_image.shape[0] * bgr_image.shape[1])
            
            # If confidence is high but redness is low, similarity is low
            if confidence > 0.7 and redness_ratio < 0.1:
                redness_similarity = 0.3
            else:
                redness_similarity = min(redness_ratio * 5, 1.0)
            
            # Combine similarity scores
            combined_similarity = (edge_similarity * 0.5) + (redness_similarity * 0.5)
            return float(combined_similarity)
        
        except Exception as e:
            print(f"Error calculating texture similarity: {e}")
            return 0.5  # Default moderate similarity
    
    def _check_feature_consistency(self, bgr_image: np.ndarray, confidence: float) -> bool:
        """
        Check if visual features are consistent with confidence level
        Returns True if consistent, False if inconsistent
        """
        try:
            # High confidence should align with strong visual indicators
            # Low confidence should align with weak visual indicators
            
            gray = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2GRAY)
            if gray.dtype != np.uint8:
                if gray.max() <= 1.0:
                    gray = (gray * 255).astype(np.uint8)
                else:
                    gray = gray.astype(np.uint8)
            
            # Calculate visual feature strength
            edges = cv2.Canny(gray, 50, 150)
            edge_strength = np.sum(edges > 0) / (gray.shape[0] * gray.shape[1])
            
            hsv = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2HSV)
            lower_red1 = np.array([0, 50, 50])
            upper_red1 = np.array([10, 255, 255])
            lower_red2 = np.array([170, 50, 50])
            upper_red2 = np.array([180, 255, 255])
            mask1 = cv2.inRange(hsv, lower_red1, upper_red1)
            mask2 = cv2.inRange(hsv, lower_red2, upper_red2)
            red_mask = cv2.bitwise_or(mask1, mask2)
            redness_strength = np.sum(red_mask > 0) / (bgr_image.shape[0] * bgr_image.shape[1])
            
            visual_strength = (edge_strength * 0.5) + (redness_strength * 2.0)
            visual_strength = min(visual_strength, 1.0)
            
            # Check consistency: confidence and visual strength should be aligned
            # High confidence + low visual strength = inconsistent
            # Low confidence + high visual strength = inconsistent
            confidence_visual_diff = abs(confidence - visual_strength)
            
            # Allow some tolerance
            is_consistent = confidence_visual_diff < 0.4
            
            return is_consistent
        
        except Exception as e:
            print(f"Error checking feature consistency: {e}")
            return True  # Default to consistent on error
    
    def _local_binary_pattern(self, image: np.ndarray, radius: int = 1, n_points: int = 8) -> np.ndarray:
        """
        Compute Local Binary Pattern for texture analysis
        """
        try:
            h, w = image.shape
            lbp = np.zeros_like(image)
            
            for i in range(radius, h - radius):
                for j in range(radius, w - radius):
                    center = image[i, j]
                    code = 0
                    
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
    
    def get_confidence_band(self, confidence: float) -> str:
        """
        Classify confidence into bands
        
        Returns:
            "high", "medium", or "low"
        """
        if confidence >= self.high_confidence_threshold:
            return "high"
        elif confidence <= self.low_confidence_threshold:
            return "low"
        else:
            return "medium"

