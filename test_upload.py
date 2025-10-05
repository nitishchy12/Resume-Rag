#!/usr/bin/env python3
"""
Test script to debug resume upload functionality
"""
import requests
import os

# Base URL
BASE_URL = 'http://localhost:8000'

def test_login():
    """Test login functionality"""
    print("🔐 Testing login...")
    
    response = requests.post(f'{BASE_URL}/api/auth/login/', json={
        'username': 'admin',
        'password': 'admin123'
    })
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Login successful!")
        return data['access']
    else:
        print(f"❌ Login failed: {response.status_code}")
        print(response.text)
        return None

def test_upload(token, test_file_path):
    """Test file upload"""
    print(f"📤 Testing file upload: {test_file_path}")
    
    if not os.path.exists(test_file_path):
        print(f"❌ Test file not found: {test_file_path}")
        return
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Idempotency-Key': f'test-upload-{os.path.basename(test_file_path)}'
    }
    
    files = {
        'file': open(test_file_path, 'rb')
    }
    
    data = {
        'name': os.path.splitext(os.path.basename(test_file_path))[0],
        'email': 'test@example.com',
        'phone': ''
    }
    
    try:
        response = requests.post(
            f'{BASE_URL}/api/resumes/',
            headers=headers,
            files=files,
            data=data
        )
        
        if response.status_code in [200, 201]:
            print("✅ Upload successful!")
            print(f"Response: {response.json()}")
        else:
            print(f"❌ Upload failed: {response.status_code}")
            print(f"Response: {response.text}")
            
    finally:
        files['file'].close()

def create_test_file():
    """Create a simple test file"""
    test_content = """
John Doe
Software Engineer
Email: john.doe@example.com
Phone: +1-555-123-4567

SKILLS:
- Python
- Django
- React
- JavaScript
- SQL

EXPERIENCE:
Senior Software Engineer (2020-2023)
- Developed web applications using Django and React
- Led a team of 3 developers
- Implemented REST APIs and database design

EDUCATION:
Bachelor of Computer Science
University of Technology (2016-2020)
    """.strip()
    
    test_file_path = 'test_resume.txt'
    with open(test_file_path, 'w') as f:
        f.write(test_content)
    
    print(f"📝 Created test file: {test_file_path}")
    return test_file_path

if __name__ == '__main__':
    print("🚀 Starting ResumeRAG Upload Test\n")
    
    # Test login
    token = test_login()
    if not token:
        print("❌ Cannot proceed without valid token")
        exit(1)
    
    print()
    
    # Create and test with a simple text file
    test_file = create_test_file()
    test_upload(token, test_file)
    
    # Clean up
    if os.path.exists(test_file):
        os.remove(test_file)
        print(f"🧹 Cleaned up test file: {test_file}")
    
    print("\n🎉 Test completed!")