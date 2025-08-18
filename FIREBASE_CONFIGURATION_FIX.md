# 🔧 Firebase Configuration Fix Guide

## ❌ **Current Issue: "Failed to load documents. Please try again."**

This error occurs because your Firebase configuration is not properly set up. The application is trying to connect to Firebase but doesn't have the correct credentials.

## ✅ **Solution: Configure Firebase Environment Variables**

### **Step 1: Create Environment File**

Create a `.env.local` file in your project root (same level as `package.json`) with the following content:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_actual_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_actual_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_actual_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_actual_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_actual_messaging_sender_id
VITE_FIREBASE_APP_ID=your_actual_app_id
```

### **Step 2: Get Your Firebase Configuration**

1. **Go to [Firebase Console](https://console.firebase.google.com/)**
2. **Select your project** (or create one if you haven't)
3. **Click the gear icon (⚙️) next to "Project Overview"**
4. **Select "Project settings"**
5. **Scroll down to "Your apps" section**
6. **Click the web icon (</>)**
7. **Register your app** with a nickname (e.g., "HR Portal Web")
8. **Copy the Firebase configuration object**

### **Step 3: Replace Placeholder Values**

Replace the placeholder values in your `.env.local` file with your actual Firebase configuration:

**Example:**
```bash
# Before (placeholders - won't work)
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_PROJECT_ID=your_project_id

# After (your actual values)
VITE_FIREBASE_API_KEY=AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz
VITE_FIREBASE_PROJECT_ID=hr-portal-12345
```

### **Step 4: Enable Required Firebase Services**

Make sure these services are enabled in your Firebase project:

1. **Authentication** → Enable Email/Password sign-in
2. **Firestore Database** → Create database in test mode
3. **Storage** → Create storage bucket

### **Step 5: Set Up Security Rules**

#### **Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /documents/{documentId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == resource.data.userId;
    }
  }
}
```

#### **Storage Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /documents/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null &&
        request.auth.uid == userId;
    }
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## 🚀 **After Configuration**

1. **Restart your development server** (`npm run dev`)
2. **Check the browser console** for any Firebase initialization messages
3. **Try accessing the Documents page** again
4. **The error should be resolved** and you should see your documents

## 🔍 **Troubleshooting**

### **Still Getting Errors?**

1. **Check browser console** for specific error messages
2. **Verify environment variables** are loaded correctly
3. **Ensure Firebase services** are enabled
4. **Check security rules** are properly configured
5. **Verify project ID** matches exactly

### **Common Issues:**

- **"permission-denied"**: Check Firestore/Storage security rules
- **"unavailable"**: Check if Firebase services are enabled
- **"indexes"**: Create required Firestore indexes
- **"not configured"**: Verify `.env.local` file exists and has correct values

## 📚 **Additional Resources**

- **Firebase Setup Guide**: `FIREBASE_SETUP.md`
- **Firebase Console**: [https://console.firebase.google.com/](https://console.firebase.google.com/)
- **Firebase Documentation**: [https://firebase.google.com/docs](https://firebase.google.com/docs)

## ✅ **Expected Result**

After proper configuration, you should be able to:
- ✅ View your documents in the Documents page
- ✅ Generate and save new documents
- ✅ Download PDF files
- ✅ Delete documents
- ✅ See proper error messages if something goes wrong

---

**Need Help?** Check the browser console for specific error messages and refer to the troubleshooting section above.
