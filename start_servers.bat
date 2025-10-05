@echo off
echo Starting ResumeRag servers...
echo.

echo Starting Django backend server...
start "Django Backend" cmd /c "cd backend && python manage.py runserver 8000"

echo Waiting 3 seconds for backend to start...
timeout /t 3 >nul

echo Starting React frontend server...
start "React Frontend" cmd /c "cd frontend && npm start"

echo.
echo Both servers are starting...
echo Django Backend: http://localhost:8000
echo React Frontend: http://localhost:3000
echo.
echo Press any key to close this window...
pause >nul