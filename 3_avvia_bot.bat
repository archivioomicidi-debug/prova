@echo off
cd /d "%~dp0"
echo Avvio del bot. NON chiudere questa finestra finche vuoi che il bot lavori.
python -m signal_bot.main
pause
