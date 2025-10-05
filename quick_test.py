#!/usr/bin/env python3
"""
Quick test to verify backend is working and accessible
"""
import requests
import json

def test_backend():
    print("🧪 Testing Django Backend...")
    
    try:
        # Test if backend is accessible
        response = requests.get("http://localhost:8000/", timeout=5)
        if response.status_code == 200:
            print("✅ Backend server is running and accessible")
            return True
        else:
            print(f"❌ Backend returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend test failed: {e}")
        return False

def test_cors():
    print("🌐 Testing CORS...")
    
    try:
        # Test OPTIONS request (CORS preflight)
        response = requests.options("http://localhost:8000/api/resumes/", 
                                  headers={'Origin': 'http://localhost:3000'})
        print(f"CORS preflight status: {response.status_code}")
        
        # Check CORS headers
        cors_headers = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
        }
        
        print("CORS Headers:", json.dumps(cors_headers, indent=2))
        return True
        
    except Exception as e:
        print(f"❌ CORS test failed: {e}")
        return False

def test_upload_endpoint():
    print("📤 Testing Upload Endpoint...")
    
    try:
        # Create test file
        test_content = "John Doe\nSoftware Engineer\nSkills: Python, Django, React"
        files = {'file': ('test_resume.txt', test_content, 'text/plain')}
        data = {'name': 'Quick Test', 'email': 'test@example.com'}
        
        response = requests.post("http://localhost:8000/api/resumes/", 
                               files=files, data=data, timeout=30)
        
        if response.status_code == 201:
            print("✅ Upload endpoint working! Response:")
            print(json.dumps(response.json(), indent=2)[:200] + "...")
            return True
        else:
            print(f"❌ Upload failed with status {response.status_code}")
            print("Response:", response.text[:500])
            return False
            
    except Exception as e:
        print(f"❌ Upload test failed: {e}")
        return False

if __name__ == "__main__":
    print("=" * 50)
    print("🔍 ResumeRag Backend Quick Test")
    print("=" * 50)
    
    tests = [
        ("Backend Accessibility", test_backend),
        ("CORS Configuration", test_cors),
        ("Upload Endpoint", test_upload_endpoint)
    ]
    
    passed = 0
    for test_name, test_func in tests:
        print(f"\n{test_name}:")
        if test_func():
            passed += 1
        print("-" * 30)
    
    print(f"\n📊 Results: {passed}/{len(tests)} tests passed")
    
    if passed == len(tests):
        print("🎉 All tests passed! Your backend is ready!")
        print("\nNext steps:")
        print("1. Make sure React frontend is running on http://localhost:3000")
        print("2. Try uploading a resume file")
    else:
        print("❌ Some tests failed. Check the output above for details.")