cd apps
cd backend
yarn

cd ..
cd wrapper
yarn

cd ../../packages
cd functions-gcp
yarn

cd ../..
cd functions
source venv/bin/activate
pip3 install -r requirements.txt

cd ..
echo ""
echo "==================================="
echo "If you do not see any errors above, the installation process should have succeeded"
echo "==================================="
echo ""
