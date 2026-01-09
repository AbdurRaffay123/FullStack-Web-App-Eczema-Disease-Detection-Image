"""
End-to-End Test Script for Eczema Detection API
Tests all images in testing-images folder
"""

import requests
import json
import os
from pathlib import Path
from datetime import datetime
from typing import Dict, List

# Configuration
API_BASE_URL = "http://localhost:8000"
TEST_IMAGES_DIR = "testing-images"
OUTPUT_FILE = "test_results.json"

def test_health_check() -> Dict:
    """Test health endpoint"""
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=5)
        return {
            "status": "success",
            "status_code": response.status_code,
            "data": response.json()
        }
    except requests.exceptions.ConnectionError:
        return {
            "status": "error",
            "error": "Cannot connect to API. Is the service running?"
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }

def test_image_analysis(image_path: str) -> Dict:
    """Test image analysis endpoint"""
    try:
        with open(image_path, 'rb') as f:
            files = {'file': (os.path.basename(image_path), f, 'image/jpeg')}
            response = requests.post(
                f"{API_BASE_URL}/analyze",
                files=files,
                timeout=30
            )
        
        result = {
            "image": os.path.basename(image_path),
            "status_code": response.status_code,
            "timestamp": datetime.now().isoformat()
        }
        
        if response.status_code == 200:
            result["status"] = "success"
            result["analysis"] = response.json()
        else:
            result["status"] = "error"
            try:
                result["error"] = response.json()
            except:
                result["error"] = response.text
        
        return result
    
    except Exception as e:
        return {
            "image": os.path.basename(image_path),
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

def get_test_images() -> List[str]:
    """Get all test images from testing-images directory"""
    test_dir = Path(TEST_IMAGES_DIR)
    if not test_dir.exists():
        return []
    
    images = []
    for ext in ['*.jpg', '*.jpeg', '*.png', '*.JPG', '*.JPEG', '*.PNG']:
        images.extend(test_dir.glob(ext))
    
    return sorted([str(img) for img in images])

def run_tests() -> Dict:
    """Run all tests"""
    print("=" * 60)
    print("ECZEMA DETECTION API - END-TO-END TEST")
    print("=" * 60)
    print()
    
    results = {
        "test_timestamp": datetime.now().isoformat(),
        "api_url": API_BASE_URL,
        "health_check": {},
        "image_tests": []
    }
    
    # Test 1: Health Check
    print("1. Testing Health Endpoint...")
    health_result = test_health_check()
    results["health_check"] = health_result
    
    if health_result["status"] == "error":
        print(f"   ❌ Health check failed: {health_result.get('error')}")
        print("   ⚠️  Please start the FastAPI service first:")
        print("      cd Ai-Model-Working")
        print("      python -m app.main")
        return results
    else:
        print(f"   ✅ Health check passed")
        health_data = health_result.get("data", {})
        print(f"   - Service status: {health_data.get('status')}")
        print(f"   - Model loaded: {health_data.get('model_loaded')}")
        print(f"   - Model exists: {health_data.get('model_exists')}")
        print()
    
    # Test 2: Image Analysis
    print("2. Testing Image Analysis...")
    test_images = get_test_images()
    
    if not test_images:
        print(f"   ⚠️  No test images found in {TEST_IMAGES_DIR}/")
        return results
    
    print(f"   Found {len(test_images)} test images")
    print()
    
    for i, image_path in enumerate(test_images, 1):
        print(f"   [{i}/{len(test_images)}] Testing: {os.path.basename(image_path)}")
        result = test_image_analysis(image_path)
        results["image_tests"].append(result)
        
        if result["status"] == "success":
            analysis = result.get("analysis", {})
            relevant = analysis.get("relevant", False)
            eczema_detected = analysis.get("eczema_detected", False)
            confidence = analysis.get("confidence", 0.0)
            severity = analysis.get("severity", "N/A")
            
            print(f"      ✅ Analysis complete")
            print(f"      - Relevant: {relevant}")
            print(f"      - Eczema detected: {eczema_detected}")
            print(f"      - Confidence: {confidence:.2%}")
            if severity:
                print(f"      - Severity: {severity}")
        else:
            error_msg = result.get("error", "Unknown error")
            print(f"      ❌ Failed: {error_msg}")
        print()
    
    return results

def generate_summary(results: Dict) -> str:
    """Generate test summary"""
    summary = []
    summary.append("=" * 60)
    summary.append("TEST SUMMARY")
    summary.append("=" * 60)
    summary.append("")
    
    # Health check summary
    health = results.get("health_check", {})
    if health.get("status") == "success":
        summary.append("✅ Health Check: PASSED")
        health_data = health.get("data", {})
        summary.append(f"   - Model loaded: {health_data.get('model_loaded')}")
        summary.append(f"   - Model exists: {health_data.get('model_exists')}")
    else:
        summary.append("❌ Health Check: FAILED")
        summary.append(f"   - Error: {health.get('error')}")
    
    summary.append("")
    
    # Image tests summary
    image_tests = results.get("image_tests", [])
    if image_tests:
        total = len(image_tests)
        successful = sum(1 for t in image_tests if t.get("status") == "success")
        failed = total - successful
        
        summary.append(f"Image Analysis Tests: {successful}/{total} passed")
        summary.append("")
        
        # Detailed results
        for test in image_tests:
            img_name = test.get("image", "Unknown")
            if test.get("status") == "success":
                analysis = test.get("analysis", {})
                eczema = analysis.get("eczema_detected", False)
                conf = analysis.get("confidence", 0.0)
                sev = analysis.get("severity", "")
                summary.append(f"✅ {img_name}:")
                summary.append(f"   - Eczema: {eczema} (Confidence: {conf:.2%})")
                if sev:
                    summary.append(f"   - Severity: {sev}")
            else:
                summary.append(f"❌ {img_name}: {test.get('error', 'Unknown error')}")
            summary.append("")
    
    return "\n".join(summary)

def main():
    """Main test runner"""
    results = run_tests()
    
    # Save results to JSON
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(results, f, indent=2)
    print(f"📄 Results saved to: {OUTPUT_FILE}")
    print()
    
    # Print summary
    summary = generate_summary(results)
    print(summary)
    
    # Save summary to markdown
    md_file = "TEST_STATUS.md"
    with open(md_file, 'w') as f:
        f.write("# Eczema Detection API - Test Status Report\n\n")
        f.write(f"**Test Date:** {results['test_timestamp']}\n\n")
        f.write("```\n")
        f.write(summary)
        f.write("\n```\n\n")
        f.write("## Detailed Results\n\n")
        f.write("```json\n")
        json.dump(results, f, indent=2)
        f.write("\n```\n")
    
    print(f"📄 Markdown report saved to: {md_file}")

if __name__ == "__main__":
    main()















