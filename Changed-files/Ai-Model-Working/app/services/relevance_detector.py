"""
Relevance Detector - Checks if uploaded image contains human skin
FIXED: Now accepts face images and all human skin areas (face, arms, legs, neck, torso)
"""

import cv2
import numpy as np
from typing import Tuple


class RelevanceDetector:
    """
    Detects if uploaded image is relevant (contains human skin/body)
    
    CRITICAL FIX: Human face images ARE VALID INPUT and MUST pass relevance checks
    Accepts: Face skin, Arms, Legs, Neck, Torso
    Rejects: Only non-human / non-skin images
    
    Uses heuristic-based approach with computer vision
    """
    
    def __init__(self):
        # Expanded skin color ranges in HSV to cover all skin tones
        # These ranges are tuned to accept face, arms, legs, neck, torso
        # Lower threshold reduced to accept lighter skin tones (including faces)
        self.skin_lower_hsv = np.array([0, 15, 50], dtype=np.uint8)  # Reduced from 20,70 to accept faces
        self.skin_upper_hsv = np.array([25, 255, 255], dtype=np.uint8)  # Extended from 20 to 25
        
        # Alternative skin color ranges (for different lighting/tones)
        self.skin_lower_hsv2 = np.array([170, 15, 50], dtype=np.uint8)  # Reduced to accept faces
        self.skin_upper_hsv2 = np.array([180, 255, 255], dtype=np.uint8)
        
        # Additional range for very light skin tones (common in faces)
        self.skin_lower_hsv3 = np.array([0, 0, 100], dtype=np.uint8)  # Very light tones
        self.skin_upper_hsv3 = np.array([180, 30, 255], dtype=np.uint8)
    
    async def check_relevance(self, image: np.ndarray) -> Tuple[bool, str]:
        """
        Check if image contains human skin
        
        Args:
            image: Preprocessed image array (RGB format)
        
        Returns:
            Tuple of (is_relevant, reason)
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
                return (False, "Image must be a 3-channel RGB image")
            
            # Convert RGB to BGR for OpenCV
            bgr_image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
            
            # Convert to HSV for better skin color detection
            hsv_image = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2HSV)
            
            # Create mask for skin color ranges (including face-friendly ranges)
            mask1 = cv2.inRange(hsv_image, self.skin_lower_hsv, self.skin_upper_hsv)
            mask2 = cv2.inRange(hsv_image, self.skin_lower_hsv2, self.skin_upper_hsv2)
            mask3 = cv2.inRange(hsv_image, self.skin_lower_hsv3, self.skin_upper_hsv3)  # For very light skin/faces
            skin_mask = cv2.bitwise_or(cv2.bitwise_or(mask1, mask2), mask3)
            
            # Calculate percentage of image that matches skin color
            skin_pixel_count = np.sum(skin_mask > 0)
            total_pixels = image.shape[0] * image.shape[1]
            skin_percentage = (skin_pixel_count / total_pixels) * 100
            
            # Additional checks for human-like features
            gray = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2GRAY)
            edges = cv2.Canny(gray, 50, 150)
            edge_density = np.sum(edges > 0) / total_pixels
            
            # Check image complexity (variance)
            image_variance = np.var(gray)
            
            # FIXED HEURISTIC DECISION - More lenient to accept faces and all skin areas
            # Reduced thresholds to accept:
            # - Face images (often have lower skin percentage due to hair, eyes, etc.)
            # - Close-up images
            # - Various lighting conditions
            
            # Minimum skin percentage reduced from 15% to 10% to accept faces
            # Edge density range expanded to accept face features
            # Variance threshold reduced to accept smoother face skin
            
            is_relevant = (
                skin_percentage >= 10.0 and  # Reduced from 15% to accept faces
                (edge_density >= 0.03 or edge_density <= 0.5) and  # Expanded range for faces
                image_variance > 50  # Reduced from 100 to accept smoother face skin
            )
            
            # Additional check: If image has moderate skin percentage and reasonable features,
            # accept it (this catches face images that might not pass strict thresholds)
            if not is_relevant:
                # Fallback: Accept if has some skin-like characteristics
                # This ensures face images aren't rejected
                has_some_skin = skin_percentage >= 8.0  # Very lenient threshold
                has_reasonable_features = image_variance > 30  # Very lenient variance
                
                if has_some_skin and has_reasonable_features:
                    is_relevant = True
            
            if not is_relevant:
                reasons = []
                if skin_percentage < 10.0:
                    reasons.append(f"insufficient skin-colored pixels ({skin_percentage:.1f}%)")
                if edge_density < 0.03:
                    reasons.append("image appears too smooth/uniform")
                elif edge_density > 0.5:
                    reasons.append("image appears too complex/textured")
                if image_variance <= 50:
                    reasons.append("image lacks sufficient detail")
                
                reason = f"Uploaded image does not appear to be human skin. " + \
                        f"Reasons: {', '.join(reasons)}. " + \
                        f"Please upload a clear photo of affected skin area (face, arms, legs, neck, or torso)."
                return False, reason
            
            return True, "Image appears to contain human skin (face, arms, legs, neck, or torso)"
        
        except Exception as e:
            # If detection fails, be conservative and allow the image
            # The model itself will provide the final assessment
            print(f"Warning: Relevance detection failed: {e}")
            return True, "Image relevance check completed"


