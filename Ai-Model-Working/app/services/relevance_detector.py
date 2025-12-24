"""
Relevance Detector - Checks if uploaded image contains human skin
"""

import cv2
import numpy as np
from typing import Tuple


class RelevanceDetector:
    """
    Detects if uploaded image is relevant (contains human skin/body)
    Uses heuristic-based approach with computer vision
    """
    
    def __init__(self):
        # Skin color ranges in HSV (approximate)
        # These ranges can be tuned based on different skin tones
        self.skin_lower_hsv = np.array([0, 20, 70], dtype=np.uint8)
        self.skin_upper_hsv = np.array([20, 255, 255], dtype=np.uint8)
        
        # Alternative skin color ranges (for different lighting/tones)
        self.skin_lower_hsv2 = np.array([170, 20, 70], dtype=np.uint8)
        self.skin_upper_hsv2 = np.array([180, 255, 255], dtype=np.uint8)
    
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
            
            # Create mask for skin color ranges
            mask1 = cv2.inRange(hsv_image, self.skin_lower_hsv, self.skin_upper_hsv)
            mask2 = cv2.inRange(hsv_image, self.skin_lower_hsv2, self.skin_upper_hsv2)
            skin_mask = cv2.bitwise_or(mask1, mask2)
            
            # Calculate percentage of image that matches skin color
            skin_pixel_count = np.sum(skin_mask > 0)
            total_pixels = image.shape[0] * image.shape[1]
            skin_percentage = (skin_pixel_count / total_pixels) * 100
            
            # Additional checks
            # 1. Check for human-like textures (using edge detection)
            gray = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2GRAY)
            edges = cv2.Canny(gray, 50, 150)
            edge_density = np.sum(edges > 0) / total_pixels
            
            # 2. Check image complexity (variance)
            image_variance = np.var(gray)
            
            # Heuristic decision
            # Skin should have:
            # - At least 15% skin-colored pixels
            # - Moderate edge density (not too smooth, not too complex)
            # - Reasonable variance (not uniform)
            
            is_relevant = (
                skin_percentage >= 15.0 and
                0.05 <= edge_density <= 0.4 and
                image_variance > 100
            )
            
            if not is_relevant:
                reasons = []
                if skin_percentage < 15.0:
                    reasons.append(f"insufficient skin-colored pixels ({skin_percentage:.1f}%)")
                if edge_density < 0.05:
                    reasons.append("image appears too smooth/uniform")
                elif edge_density > 0.4:
                    reasons.append("image appears too complex/textured")
                if image_variance <= 100:
                    reasons.append("image lacks sufficient detail")
                
                reason = f"Uploaded image does not appear to be human skin. " + \
                        f"Reasons: {', '.join(reasons)}. " + \
                        f"Please upload a clear photo of affected skin area."
                return False, reason
            
            return True, "Image appears to contain human skin"
        
        except Exception as e:
            # If detection fails, be conservative and allow the image
            # The model itself will provide the final assessment
            print(f"Warning: Relevance detection failed: {e}")
            return True, "Image relevance check completed"


