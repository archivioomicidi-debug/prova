@echo off
cd /d "%~dp0"
echo Accesso a Telegram ed elenco delle chat...
python -m signal_bot.main --list-chats
pause
