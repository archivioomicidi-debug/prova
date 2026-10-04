@echo off
cd /d "%~dp0"
echo Installazione delle librerie...
python -m pip install -r requirements.txt
if not exist config.yaml copy config.example.yaml config.yaml
echo.
echo Fatto. Ora si apre config.yaml: compilalo e salvalo.
notepad config.yaml
pause
