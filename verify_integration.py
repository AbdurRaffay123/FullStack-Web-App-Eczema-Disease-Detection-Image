"""
Comprehensive Integration Verification Script
Checks all integration points: Frontend → Backend → AI Model → Gemini
"""

import os
import sys
import json
from pathlib import Path

def check_file_exists(filepath, description):
    """Check if file exists"""
    exists = os.path.exists(filepath)
    status = "✅" if exists else "❌"
    print(f"{status} {description}: {filepath}")
    return exists

def check_code_integration():
    """Check code-level integration"""
    print("=" * 70)
    print("CODE INTEGRATION VERIFICATION")
    print("=" * 70)
    print()
    
    issues = []
    
    # 1. Backend Integration Points
    print("1. BACKEND INTEGRATION")
    print("-" * 70)
    
    backend_image_service = "backend/src/services/image.service.js"
    if check_file_exists(backend_image_service, "Backend image service"):
        with open(backend_image_service, 'r') as f:
            content = f.read()
            if "AI_SERVICE_URL" in content and "localhost:8000" in content:
                print("   ✅ Backend configured to call FastAPI service")
            else:
                issues.append("Backend not configured to call FastAPI")
                print("   ❌ Backend not configured to call FastAPI")
            
            if "analyzeImageWithAI" in content:
                print("   ✅ analyzeImageWithAI function exists")
            else:
                issues.append("analyzeImageWithAI function missing")
                print("   ❌ analyzeImageWithAI function missing")
    
    backend_controller = "backend/src/controllers/image.controller.js"
    if check_file_exists(backend_controller, "Backend image controller"):
        with open(backend_controller, 'r') as f:
            content = f.read()
            if "uploadAndAnalyzeImage" in content:
                print("   ✅ uploadAndAnalyzeImage endpoint exists")
            else:
                issues.append("uploadAndAnalyzeImage endpoint missing")
                print("   ❌ uploadAndAnalyzeImage endpoint missing")
    
    print()
    
    # 2. FastAPI Integration Points
    print("2. FASTAPI AI SERVICE INTEGRATION")
    print("-" * 70)
    
    fastapi_main = "Ai-Model-Working/app/main.py"
    if check_file_exists(fastapi_main, "FastAPI main file"):
        with open(fastapi_main, 'r') as f:
            content = f.read()
            if "/analyze" in content and "AnalysisResponse" in content:
                print("   ✅ /analyze endpoint exists")
            else:
                issues.append("FastAPI /analyze endpoint missing")
                print("   ❌ FastAPI /analyze endpoint missing")
            
            if "llm_service" in content and "generate_explanation" in content:
                print("   ✅ LLM service integrated")
            else:
                issues.append("LLM service not integrated")
                print("   ❌ LLM service not integrated")
    
    llm_service = "Ai-Model-Working/app/services/llm_service.py"
    if check_file_exists(llm_service, "LLM service"):
        with open(llm_service, 'r') as f:
            content = f.read()
            if "GEMINI_API_KEY" in content or "BYTEZ_API_KEY" in content:
                print("   ✅ Gemini API key configuration exists")
            else:
                issues.append("Gemini API key configuration missing")
                print("   ❌ Gemini API key configuration missing")
            
            if "generativelanguage.googleapis.com" in content:
                print("   ✅ Google Gemini API endpoint configured")
            else:
                issues.append("Google Gemini API endpoint not configured")
                print("   ❌ Google Gemini API endpoint not configured")
    
    print()
    
    # 3. Web Frontend Integration
    print("3. WEB FRONTEND INTEGRATION")
    print("-" * 70)
    
    web_image_service = "frontend-website/src/services/imageService.ts"
    if check_file_exists(web_image_service, "Web image service"):
        with open(web_image_service, 'r') as f:
            content = f.read()
            if "uploadImage" in content:
                print("   ✅ uploadImage function exists")
            else:
                issues.append("Web uploadImage function missing")
                print("   ❌ Web uploadImage function missing")
            
            if "ImageAnalysisResult" in content:
                print("   ✅ TypeScript interfaces defined")
            else:
                issues.append("TypeScript interfaces missing")
                print("   ❌ TypeScript interfaces missing")
    
    web_upload_page = "frontend-website/src/pages/ImageUpload.tsx"
    if check_file_exists(web_upload_page, "Web upload page"):
        with open(web_upload_page, 'r') as f:
            content = f.read()
            if "imageService" in content:
                print("   ✅ ImageUpload page uses imageService")
            else:
                issues.append("ImageUpload page not using imageService")
                print("   ❌ ImageUpload page not using imageService")
    
    print()
    
    # 4. Mobile Frontend Integration
    print("4. MOBILE FRONTEND INTEGRATION")
    print("-" * 70)
    
    mobile_image_service = "frontend-mobile-react-native-app/services/imageService.ts"
    if check_file_exists(mobile_image_service, "Mobile image service"):
        with open(mobile_image_service, 'r') as f:
            content = f.read()
            if "uploadImage" in content:
                print("   ✅ Mobile uploadImage function exists")
            else:
                issues.append("Mobile uploadImage function missing")
                print("   ❌ Mobile uploadImage function missing")
    
    mobile_ai_screen = "frontend-mobile-react-native-app/app/(tabs)/ai.tsx"
    if check_file_exists(mobile_ai_screen, "Mobile AI screen"):
        with open(mobile_ai_screen, 'r') as f:
            content = f.read()
            if "imageService" in content:
                print("   ✅ Mobile AI screen uses imageService")
            else:
                issues.append("Mobile AI screen not using imageService")
                print("   ❌ Mobile AI screen not using imageService")
    
    print()
    
    # 5. Data Flow Alignment
    print("5. DATA FLOW ALIGNMENT")
    print("-" * 70)
    
    # Check response format consistency
    fastapi_schema = "Ai-Model-Working/app/schemas/response.py"
    if check_file_exists(fastapi_schema, "FastAPI response schema"):
        with open(fastapi_schema, 'r') as f:
            content = f.read()
            required_fields = ["relevant", "eczema_detected", "confidence", "explanation", "disclaimer"]
            for field in required_fields:
                if field in content:
                    print(f"   ✅ Response includes '{field}' field")
                else:
                    issues.append(f"Response missing '{field}' field")
                    print(f"   ❌ Response missing '{field}' field")
    
    # Check frontend expects same fields
    if os.path.exists(web_image_service):
        with open(web_image_service, 'r') as f:
            content = f.read()
            if "eczema_detected" in content and "confidence" in content:
                print("   ✅ Web frontend expects correct fields")
            else:
                issues.append("Web frontend field mismatch")
                print("   ❌ Web frontend field mismatch")
    
    if os.path.exists(mobile_image_service):
        with open(mobile_image_service, 'r') as f:
            content = f.read()
            if "eczema_detected" in content and "confidence" in content:
                print("   ✅ Mobile frontend expects correct fields")
            else:
                issues.append("Mobile frontend field mismatch")
                print("   ❌ Mobile frontend field mismatch")
    
    print()
    
    # 6. Environment Configuration
    print("6. ENVIRONMENT CONFIGURATION")
    print("-" * 70)
    
    gemini_env = "Ai-Model-Working/.env"
    if check_file_exists(gemini_env, "Gemini .env file"):
        with open(gemini_env, 'r') as f:
            content = f.read()
            if "GEMINI_API_KEY" in content:
                print("   ✅ GEMINI_API_KEY configured")
            else:
                issues.append("GEMINI_API_KEY not configured")
                print("   ⚠️  GEMINI_API_KEY not configured (may use fallback)")
    
    backend_env_check = "backend/.env"
    if os.path.exists(backend_env_check):
        print("   ✅ Backend .env file exists")
    else:
        print("   ⚠️  Backend .env file not found (may use defaults)")
    
    print()
    
    # Summary
    print("=" * 70)
    print("INTEGRATION SUMMARY")
    print("=" * 70)
    print()
    
    if issues:
        print(f"⚠️  Found {len(issues)} potential issues:")
        for i, issue in enumerate(issues, 1):
            print(f"   {i}. {issue}")
        print()
        print("Please review and fix these issues.")
    else:
        print("✅ All integration points verified!")
        print("   Code structure is properly aligned.")
        print()
    
    return len(issues) == 0

if __name__ == "__main__":
    success = check_code_integration()
    sys.exit(0 if success else 1)







