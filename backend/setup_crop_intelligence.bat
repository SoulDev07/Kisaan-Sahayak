@echo off
echo Setting up Crop Intelligence Backend...

REM Navigate to backend directory
cd "C:\Users\vinay\OneDrive\Desktop\unoff-google\backend\backend"

REM Install dependencies
echo Installing Python dependencies...
pip install sentence-transformers
pip install numpy
pip install firebase-admin
pip install google-generativeai

REM Navigate to data insertion script
cd "C:\Users\vinay\OneDrive\Desktop\unoff-google\google-agentic-ai\vinayak"

REM Run data insertion script
echo Running data insertion script...
python data4.py

echo Setup complete!
echo.
echo To run the backend server:
echo cd "C:\Users\vinay\OneDrive\Desktop\unoff-google\backend\backend"
echo python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

pause
