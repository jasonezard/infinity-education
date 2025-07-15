#!/bin/bash

echo "🚀 Deploying Infinity Education to Firebase..."
echo

echo "Step 1: Building project..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi
echo "✅ Build successful!"
echo

echo "Step 2: Logging into Firebase..."
firebase login
if [ $? -ne 0 ]; then
    echo "❌ Firebase login failed!"
    exit 1
fi

echo "Step 3: Setting Firebase project..."
firebase use infinity-education-26e2a
if [ $? -ne 0 ]; then
    echo "❌ Failed to set Firebase project!"
    exit 1
fi

echo "Step 4: Deploying Firebase configuration..."
firebase deploy --only firestore:rules,firestore:indexes,storage
if [ $? -ne 0 ]; then
    echo "⚠️ Firebase configuration deployment had issues, continuing..."
fi

echo "Step 5: Deploying to Firebase Hosting..."
firebase deploy --only hosting
if [ $? -ne 0 ]; then
    echo "❌ Hosting deployment failed!"
    exit 1
fi

echo
echo "🎉 Deployment successful!"
echo
echo "Your app is now live at:"
echo "https://infinity-education-26e2a.web.app"
echo
echo "Next steps:"
echo "1. Visit your app and register your first user"
echo "2. Go to Firebase Console → Firestore Database"
echo "3. Set your user's role to 'ADMIN'"
echo