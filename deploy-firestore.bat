@echo off
echo Deploying Firestore rules and indexes...

echo Step 1: Login to Firebase (if not already logged in)
firebase login

echo Step 2: Use your Firebase project
firebase use infinity-education-26e2a

echo Step 3: Deploy Firestore rules
firebase deploy --only firestore:rules

echo Step 4: Deploy Firestore indexes
firebase deploy --only firestore:indexes

echo Step 5: Deploy Storage rules
firebase deploy --only storage

echo.
echo Deployment complete!
echo.
echo Your Firestore database is now configured with:
echo - Security rules for users, classes, students, and anecdotal records
echo - Optimized indexes for better query performance
echo - Storage rules for file uploads
echo.
pause