"""
Test script for Google Gemini API via Bytez
Tests the LLM service integration
"""

import asyncio
import os
import sys
from dotenv import load_dotenv

# Add app directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.llm_service import LLMService

# Load environment variables
load_dotenv()

async def test_llm_service():
    """Test the LLM service with various scenarios"""
    
    print("=" * 60)
    print("TESTING GOOGLE GEMINI API")
    print("=" * 60)
    print()
    
    # Get API key from environment variables (official Google Gemini API from AI Studio)
    api_key = os.getenv("GEMINI_API_KEY")
    # Available models: gemma-3-27b-it, gemma-3-12b-it, gemma-3-4b-it, gemma-3-2b-it, gemma-3-1b-it
    model_name = os.getenv("GEMINI_MODEL", "gemma-3-27b-it")
    
    if not api_key:
        print("⚠️  WARNING: No API key found!")
        print("Please set GEMINI_API_KEY in your .env file or environment variables.")
        print()
    
    print(f"API Key: {api_key[:10]}...{api_key[-10:] if len(api_key) > 20 else '***'}")
    print(f"Model: {model_name}")
    print()
    
    # Initialize LLM service
    llm_service = LLMService(api_key=api_key, model_name=model_name)
    
    # Test cases
    test_cases = [
        {
            "name": "Eczema Detected - Severe",
            "eczema_probability": 0.87,
            "is_eczema": True,
            "severity": "Severe"
        },
        {
            "name": "Eczema Detected - Moderate",
            "eczema_probability": 0.65,
            "is_eczema": True,
            "severity": "Moderate"
        },
        {
            "name": "Eczema Detected - Mild",
            "eczema_probability": 0.55,
            "is_eczema": True,
            "severity": "Mild"
        },
        {
            "name": "No Eczema Detected",
            "eczema_probability": 0.25,
            "is_eczema": False,
            "severity": None
        }
    ]
    
    results = []
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"Test {i}/{len(test_cases)}: {test_case['name']}")
        print("-" * 60)
        
        try:
            explanation = await llm_service.generate_explanation(
                eczema_probability=test_case["eczema_probability"],
                is_eczema=test_case["is_eczema"],
                severity=test_case["severity"]
            )
            
            print(f"✅ Success!")
            print(f"Explanation: {explanation}")
            print()
            
            results.append({
                "test": test_case["name"],
                "status": "success",
                "explanation": explanation
            })
            
        except Exception as e:
            print(f"❌ Failed: {str(e)}")
            print(f"Error type: {type(e).__name__}")
            print()
            
            results.append({
                "test": test_case["name"],
                "status": "failed",
                "error": str(e)
            })
    
    # Summary
    print("=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    successful = sum(1 for r in results if r["status"] == "success")
    failed = len(results) - successful
    
    print(f"Total tests: {len(results)}")
    print(f"✅ Successful: {successful}")
    print(f"❌ Failed: {failed}")
    print()
    
    if failed > 0:
        print("Failed tests:")
        for result in results:
            if result["status"] == "failed":
                print(f"  - {result['test']}: {result.get('error', 'Unknown error')}")
        print()
    
    # Check if API is working
    if successful > 0:
        print("✅ Google Gemini API is working!")
        print("The LLM service is successfully generating explanations.")
    else:
        print("⚠️  Google Gemini API is not working.")
        print("The service is falling back to rule-based explanations.")
        print()
        print("Troubleshooting:")
        print("1. Check if the Google Gemini API key is correct")
        print("2. Verify the API key has proper permissions")
        print("3. Check network connectivity")
        print("4. Verify the model name is correct (gemini-2.5-flash, gemini-pro, etc.)")
        print("5. Make sure you're using a valid Google Gemini API key from Google AI Studio")
    
    return results

if __name__ == "__main__":
    asyncio.run(test_llm_service())

