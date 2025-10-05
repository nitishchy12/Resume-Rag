#!/usr/bin/env python3
"""
Test script to verify the resume upload functionality works correctly
"""

import requests
import os

def test_upload():
    # API endpoint
    url = "http://localhost:8000/api/resumes/"
    
    # Create a simple test file
    test_file_content = """John Doe
Software Engineer

Email: john.doe@example.com
Phone: +1-555-123-4567

SKILLS:
Python, JavaScript, React, Django, Node.js, PostgreSQL, AWS, Docker, Git

EXPERIENCE:
- Senior Software Developer at TechCorp (2020-2024)
  * Led development of web applications using React and Django
  * Implemented RESTful APIs and database design
  * Managed team of 5 developers

EDUCATION:
Bachelor of Computer Science, University of Technology (2018)
"""
    
    # Write test file
    test_file_path = "temp_test_resume.txt"
    with open(test_file_path, 'w') as f:
        f.write(test_file_content)
    
    try:
        # Prepare the file for upload
        with open(test_file_path, 'rb') as f:
            files = {'file': ('test_resume.txt', f, 'text/plain')}
            data = {
                'name': 'John Doe Test Resume',
                'email': 'john.doe@example.com',
                'phone': '+1-555-123-4567'
            }
            
            print("Testing resume upload...")
            print(f"Uploading to: {url}")
            
            # Make the request
            response = requests.post(url, files=files, data=data, timeout=30)
            
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text[:500]}...")
            
            if response.status_code == 201:
                print("✅ Upload successful!")
                return True
            else:
                print("❌ Upload failed!")
                return False
                
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend server. Make sure Django is running on port 8000.")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    finally:
        # Clean up test file
        if os.path.exists(test_file_path):
            os.remove(test_file_path)

def test_backend_health():
    """Test if the backend is running"""
    try:
        response = requests.get("http://localhost:8000/", timeout=5)
        print(f"Backend health check: {response.status_code}")
        return response.status_code == 200
    except:
        print("❌ Backend server is not running")
        return False

if __name__ == "__main__":
    print("=== ResumeRag Upload Test ===")
    print()
    
    print("1. Checking backend server...")
    if test_backend_health():
        print("✅ Backend server is running")
        print()
        
        print("2. Testing file upload...")
        if test_upload():
            print("✅ All tests passed! Your ResumeRag upload is working!")
        else:
            print("❌ Upload test failed")
    else:
        print("❌ Backend server is not accessible. Please start it with: python backend/manage.py runserver 8000")
    
    print()
    print("Test complete.")