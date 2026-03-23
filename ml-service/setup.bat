@echo off
echo 🚀 Farm2Mandi ML Service Setup Script

echo.
echo 🔍 Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python not found! Please install Python 3.8+ from https://www.python.org/
    pause
    exit /b 1
)
python --version

echo.
echo 📦 Installing Python dependencies...
pip install -r requirements.txt

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies. Please check your Python installation.
    pause
    exit /b 1
)

echo.
echo ✅ Setup completed successfully!
echo.
echo 🎯 To start the ML service:
echo    python app.py
echo.
echo 🧪 To test the service:
echo    python test_service.py
echo.
echo 📚 Service will run on: http://127.0.0.1:5001
echo.
pause