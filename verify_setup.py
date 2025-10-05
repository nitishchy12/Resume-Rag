#!/usr/bin/env python3
"""
Quick verification script to ensure everything is set up correctly
"""
import os
import sys

def check_file_exists(path, name):
    if os.path.exists(path):
        print(f"✅ {name} found")
        return True
    else:
        print(f"❌ {name} missing")
        return False

def verify_setup():
    print("🔍 ResumeRag Setup Verification")
    print("=" * 40)
    
    all_good = True
    
    # Check key files
    checks = [
        ("backend/manage.py", "Django backend"),
        ("backend/api/models.py", "API models"),
        ("backend/api/views.py", "API views"),
        ("backend/requirements.txt", "Python dependencies"),
        ("frontend/package.json", "React package.json"),
        ("frontend/src/components/Upload.js", "Upload component"),
        ("frontend/src/services/api.js", "API service"),
        ("start_servers.bat", "Startup script"),
        ("HACKATHON_SETUP.md", "Setup guide")
    ]
    
    for path, name in checks:
        if not check_file_exists(path, name):
            all_good = False
    
    print("\n" + "=" * 40)
    
    if all_good:
        print("🎉 All files are in place!")
        print("\n📋 Next Steps:")
        print("1. Double-click 'start_servers.bat' to start both servers")
        print("2. Open http://localhost:3000 in your browser")
        print("3. Upload a resume to test functionality")
        print("4. Read HACKATHON_SETUP.md for complete guide")
        print("\n🚀 You're ready for the hackathon!")
    else:
        print("❌ Some files are missing. Please check the setup.")
    
    return all_good

if __name__ == "__main__":
    verify_setup()