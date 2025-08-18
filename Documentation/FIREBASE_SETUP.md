# Firebase Setup Guide for HR Portal

## 🔥 Firebase Project Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "HR Portal")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Authentication
1. In your Firebase project, click "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" authentication
5. Click "Save"

### 3. Get Firebase Configuration
1. Click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>)
5. Register your app with a nickname (e.g., "HR Portal Web")
6. Copy the Firebase configuration object

## 🔧 Environment Variables Setup

### 1. Create Environment File
Create a `.env.local` file in your project root with the following variables:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 2. Replace Placeholder Values
Replace the placeholder values with your actual Firebase configuration:

```bash
# Example (replace with your actual values)
VITE_FIREBASE_API_KEY=AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz
VITE_FIREBASE_AUTH_DOMAIN=hr-portal-12345.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=hr-portal-12345
VITE_FIREBASE_STORAGE_BUCKET=hr-portal-12345.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

## 📱 Firebase Authentication Features

### ✅ Enabled Features
- **Email/Password Authentication**: Users can sign up and sign in with email and password
- **Password Reset**: Users can reset their password via email
- **User Profile Management**: Display names are stored and updated
- **Session Management**: Automatic login state management
- **Protected Routes**: Certain pages require authentication

### 🔒 Security Features
- **Email Verification**: Firebase automatically sends verification emails
- **Password Requirements**: Firebase enforces secure password policies
- **Rate Limiting**: Built-in protection against brute force attacks
- **Secure Token Management**: JWT tokens for session management

## 🚀 Usage

### 1. User Registration
- Users can create accounts with email, password, and full name
- Firebase automatically sends verification emails
- User profiles are created with display names

### 2. User Login
- Users can sign in with email and password
- Successful login redirects to the documents page
- Login state is maintained across page refreshes

### 3. Password Reset
- Users can request password reset via email
- Reset emails are sent through Firebase
- Secure token-based password reset process

### 4. Logout
- Users can log out from the sidebar navigation
- Logout clears authentication state
- Redirects to home page after logout

## 🛡️ Security Considerations

### Current Implementation
- Client-side form validation
- Firebase server-side validation
- Secure password handling
- Protected route implementation

### Future Enhancements
- Email verification requirement
- Password strength indicators
- Two-factor authentication
- Social login integration
- User role management

## 🔍 Troubleshooting

### Common Issues

#### 1. Environment Variables Not Loading
- Ensure `.env.local` file is in project root
- Restart development server after adding environment variables
- Check that variable names start with `VITE_`

#### 2. Authentication Errors
- Verify Firebase project configuration
- Check if Email/Password auth is enabled
- Ensure correct API keys and project IDs

#### 3. Build Errors
- Run `npm run build` to check for compilation errors
- Verify all Firebase imports are correct
- Check TypeScript type definitions

### Debug Steps
1. Check browser console for error messages
2. Verify Firebase configuration in browser
3. Test authentication in Firebase console
4. Check network requests for API calls

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication Guide](https://firebase.google.com/docs/auth)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [React Context API](https://reactjs.org/docs/context.html)

## 🎯 Next Steps

1. **Email Verification**: Require email verification before allowing access
2. **User Profiles**: Add user profile management features
3. **Role-Based Access**: Implement different user roles and permissions
4. **Social Login**: Add Google, GitHub, or other OAuth providers
5. **User Management**: Admin panel for managing users

## 📞 Support

For Firebase-related issues:
- Check Firebase console for error logs
- Review Firebase documentation
- Check Firebase status page for service issues

For application issues:
- Review browser console errors
- Check network requests
- Verify environment variable configuration
