@echo off
echo 🚀 Deploying Infinity Education to Firebase...
echo.

echo Step 1: Building project...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)
echo ✅ Build successful!
echo.

echo Step 2: Logging into Firebase...
call firebase login
if %errorlevel% neq 0 (
    echo ❌ Firebase login failed!
    pause
    exit /b 1
)

echo Step 3: Setting Firebase project...
call firebase use infinity-education-26e2a
if %errorlevel% neq 0 (
    echo ❌ Failed to set Firebase project!
    pause
    exit /b 1
)

echo Step 4: Deploying Firebase configuration...
call firebase deploy --only firestore:rules,firestore:indexes,storage
if %errorlevel% neq 0 (
    echo ⚠️ Firebase configuration deployment had issues, continuing...
)

echo Step 5: Deploying to Firebase Hosting...
call firebase deploy --only hosting
if %errorlevel% neq 0 (
    echo ❌ Hosting deployment failed!
    pause
    exit /b 1
)

echo.
echo 🎉 Deployment successful!
echo.
echo Your app is now live at:
echo https://infinity-education-26e2a.web.app
echo.
echo Next steps:
echo 1. Visit your app and register your first user
echo 2. Go to Firebase Console → Firestore Database
echo 3. Set your user's role to "ADMIN"
echo.
pause