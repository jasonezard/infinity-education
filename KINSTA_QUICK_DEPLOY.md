# 🚀 Quick Kinsta Deployment Guide

## Step 1: Kinsta Dashboard Setup

1. **Go to**: [Kinsta MyKinsta Dashboard](https://mykinsta.com/)
2. **Click**: "Applications" → "Add service" → "Application"

## Step 2: Repository Connection

**Git Provider**: GitHub
**Repository**: `jasonezard/infinity-education`
**Branch**: `master`
**Auto-deploy**: ✅ Enabled

## Step 3: Build Configuration

```bash
Build command: npm install && npm run build
Node version: 18.20.4
Output directory: dist
```

## Step 4: Environment Variables

Add these in Kinsta → Your App → Settings → Environment Variables:

```
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

## Step 5: Get Firebase Config

**Don't have Firebase yet?**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create project → "infinity-education-[your-name]"
3. Go to Project Settings ⚙️ → General → Your apps
4. Click "Add app" → Web (</>) → "infinity-education"
5. Copy the config values

**Firebase Config Location:**
```javascript
const firebaseConfig = {
  apiKey: "copy-this-value",
  authDomain: "copy-this-value", 
  projectId: "copy-this-value",
  storageBucket: "copy-this-value",
  messagingSenderId: "copy-this-value",
  appId: "copy-this-value"
};
```

## Step 6: Enable Firebase Services

In Firebase Console:
1. **Authentication**: Build → Authentication → Get started → Sign-in method → Email/Password (Enable)
2. **Firestore**: Build → Firestore Database → Create database → Start in test mode
3. **Storage**: Build → Storage → Get started → Start in test mode

## Step 7: Deploy!

Click **"Create application"** in Kinsta - it will automatically build and deploy!

## Step 8: Post-Deployment

1. **Visit your app** (Kinsta will give you a URL)
2. **Register** your first user
3. **Go to Firebase Console** → Firestore Database
4. **Find your user** in the "users" collection  
5. **Edit the document** and set: `role: "ADMIN"`
6. **Refresh your app** - you now have admin access!

---

## 🛠️ Troubleshooting

**Build fails?**
- Check Node version is 18.x
- Verify all environment variables are set
- Check build logs in Kinsta dashboard

**App loads but Firebase errors?**
- Verify environment variables are correct
- Check browser console for specific errors
- Ensure Firebase services are enabled

**Need help?**
- Check the full README.md in your repository
- Kinsta support docs: [docs.kinsta.com](https://docs.kinsta.com/)

Your app should be live in 5-10 minutes! 🎉