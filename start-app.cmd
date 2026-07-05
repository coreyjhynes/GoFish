@echo off
rem Gulf Bottom Intel — double-click to serve the app and open it in your browser.
rem Close this window to stop the server.
cd /d "%~dp0"
start "" http://localhost:8741
python -m http.server 8741
