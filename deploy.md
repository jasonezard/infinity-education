# Kinsta Deployment Guide

## Prerequisites
1. Kinsta Application Hosting account
2. Firebase project setup
3. Git repository pushed to GitHub/GitLab

## Deployment Steps

### 1. Environment Variables
Set these environment variables in your Kinsta dashboard:

```
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### 2. Build Settings
- **Build Command**: `npm install && npm run build`
- **Output Directory**: `dist`
- **Node Version**: 18.x or higher

### 3. Deployment Process
1. Connect your Git repository to Kinsta
2. Set the build settings above
3. Add environment variables
4. Deploy

### 4. Post-Deployment Setup
1. Create your first admin user by registering in the app
2. Go to Firebase Console > Firestore Database
3. Find your user document in the `users` collection
4. Edit the document and set `role: "ADMIN"`
5. You can now access the admin dashboard

### 5. Firebase Rules Deployment
Deploy Firestore security rules separately:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

### 6. Domain Configuration
- Configure your custom domain in Kinsta dashboard
- Update Firebase Auth settings to include your production domain

## Troubleshooting

### Build Issues
- Ensure all environment variables are set
- Check Node.js version compatibility
- Verify package.json scripts

### Runtime Issues
- Check browser console for Firebase configuration errors
- Verify Firestore security rules are deployed
- Ensure authentication domain includes your production URL

## Support
Contact support if you encounter deployment issues specific to the application.