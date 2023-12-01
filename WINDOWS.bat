@echo off
cd apps
cd backend
CALL yarn

cd ..
cd wrapper
CALL yarn

cd ..\..
cd functions
CALL venv\Scripts\activate
CALL pip3 install -r requirements.txt

cd ..
echo:
echo ===================================
echo If you do not see any errors above, the installation process should have succeeded
echo ===================================
echo:
