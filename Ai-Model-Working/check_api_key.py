"""
Quick script to check if API key format is valid for Google Gemini
"""

import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY") or os.getenv("BYTEZ_API_KEY")

print("=" * 60)
print("API KEY VALIDATION CHECK")
print("=" * 60)
print()

if not api_key:
    print("❌ No API key found in environment variables")
    print("   Please set GEMINI_API_KEY in your .env file")
    exit(1)

print(f"API Key Found: {api_key[:10]}...{api_key[-10:]}")
print(f"Length: {len(api_key)} characters")
print()

# Google Gemini API keys typically:
# - Are 39 characters long
# - Start with "AIza"
# - Contain alphanumeric characters

print("Checking API key format...")
print()

issues = []

if len(api_key) != 39:
    issues.append(f"❌ Length: Expected 39 characters, got {len(api_key)}")
else:
    print(f"✅ Length: {len(api_key)} characters (correct)")

if not api_key.startswith("AIza"):
    issues.append(f"❌ Format: Should start with 'AIza', but starts with '{api_key[:4]}'")
else:
    print(f"✅ Format: Starts with 'AIza' (correct)")

if not api_key.replace("_", "").replace("-", "").isalnum():
    issues.append("❌ Characters: Contains invalid characters")
else:
    print(f"✅ Characters: Valid alphanumeric format")

print()

if issues:
    print("⚠️  API KEY FORMAT ISSUES DETECTED:")
    for issue in issues:
        print(f"   {issue}")
    print()
    print("This API key does NOT appear to be a valid Google Gemini API key.")
    print()
    print("To get a valid API key:")
    print("1. Visit: https://makersuite.google.com/app/apikey")
    print("2. Sign in with your Google account")
    print("3. Click 'Create API Key'")
    print("4. Copy the key (should start with 'AIza' and be 39 characters)")
    print("5. Update your .env file:")
    print("   GEMINI_API_KEY=AIza...")
else:
    print("✅ API key format looks correct!")
    print("   This appears to be a valid Google Gemini API key.")
    print()
    print("Note: Free tier has rate limits:")
    print("   - gemini-2.5-flash: 20 requests per minute")
    print("   - Other models: 5 requests per minute")
    print()
    print("If you hit rate limits, the service will automatically")
    print("fall back to rule-based explanations.")

print()
print("=" * 60)

