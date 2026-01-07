"""
Model Service - Handles TensorFlow/Keras model loading and inference
"""

import numpy as np
import tensorflow as tf
from PIL import Image
import os
from typing import Dict, Any


class ModelService:
    """Service for loading and running eczema detection model"""
    
    def __init__(self, model_path: str):
        self.model_path = model_path
        self.model = None
        self.input_size = int(os.getenv("MODEL_INPUT_SIZE", 224))
        self._loaded = False
    
    async def load_model(self):
        """Load the TensorFlow/Keras model"""
        try:
            if not os.path.exists(self.model_path):
                raise FileNotFoundError(
                    f"Model file not found at {self.model_path}. "
                    f"Please ensure the model file exists."
                )
            
            print(f"Loading model from {self.model_path}...")
            self.model = tf.keras.models.load_model(self.model_path)
            self._loaded = True
            print("✅ Model loaded successfully")
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            raise
    
    def is_loaded(self) -> bool:
        """Check if model is loaded"""
        return self._loaded
    
    async def predict(self, processed_image: np.ndarray) -> Dict[str, Any]:
        """
        Run prediction on preprocessed image
        
        Args:
            processed_image: Preprocessed numpy array (224x224x3, normalized)
        
        Returns:
            Dictionary with prediction results
        """
        if not self._loaded:
            raise RuntimeError("Model not loaded. Call load_model() first.")
        
        try:
            # Ensure image is in correct shape for model
            if len(processed_image.shape) == 3:
                processed_image = np.expand_dims(processed_image, axis=0)
            
            # Run prediction
            predictions = self.model.predict(processed_image, verbose=0)
            
            # Extract probability (assuming binary classification)
            # If model outputs single value (sigmoid), use it directly
            # If model outputs two values (softmax), use the second one (eczema class)
            if predictions.shape[1] == 1:
                eczema_probability = float(predictions[0][0])
            else:
                eczema_probability = float(predictions[0][1])  # Assuming [normal, eczema]
            
            return {
                "eczema_probability": eczema_probability,
                "normal_probability": 1 - eczema_probability,
                "raw_predictions": predictions.tolist()
            }
        except Exception as e:
            print(f"Error during prediction: {e}")
            raise RuntimeError(f"Prediction failed: {str(e)}")









