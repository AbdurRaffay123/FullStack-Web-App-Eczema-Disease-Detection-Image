"""
Image Processor - Handles image preprocessing for model input
"""

import numpy as np
from PIL import Image
import io
import cv2


class ImageProcessor:
    """Processes images for model input"""
    
    def __init__(self, target_size: int = 224):
        self.target_size = target_size
    
    async def process_image(self, image_bytes: bytes) -> np.ndarray:
        """
        Process image bytes to model-ready format
        
        Args:
            image_bytes: Raw image bytes
        
        Returns:
            Preprocessed numpy array (224x224x3, normalized 0-1)
        """
        try:
            # Load image from bytes
            image = Image.open(io.BytesIO(image_bytes))
            
            # Convert to RGB if needed
            if image.mode != "RGB":
                image = image.convert("RGB")
            
            # Resize to target size (224x224)
            image = image.resize((self.target_size, self.target_size), Image.Resampling.LANCZOS)
            
            # Convert to numpy array
            image_array = np.array(image, dtype=np.float32)
            
            # Normalize to 0-1 range (as per training: rescale 1/255)
            image_array = image_array / 255.0
            
            return image_array
        
        except Exception as e:
            print(f"Error processing image: {e}")
            return None
    
    def validate_image(self, image_bytes: bytes) -> tuple:
        """
        Validate image before processing
        
        Returns:
            Tuple of (is_valid, error_message)
        """
        try:
            # Check file size (max 10MB)
            max_size = 10 * 1024 * 1024  # 10MB
            if len(image_bytes) > max_size:
                return False, "Image file is too large. Maximum size is 10MB."
            
            # Try to open image
            image = Image.open(io.BytesIO(image_bytes))
            
            # Check dimensions
            width, height = image.size
            if width < 50 or height < 50:
                return False, "Image dimensions are too small. Minimum size is 50x50 pixels."
            
            if width > 10000 or height > 10000:
                return False, "Image dimensions are too large. Maximum size is 10000x10000 pixels."
            
            return True, "Image is valid"
        
        except Exception as e:
            return False, f"Invalid image file: {str(e)}"

