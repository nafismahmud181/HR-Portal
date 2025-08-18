# HR Portal - Document Generator

A comprehensive HR document generation system built with React, TypeScript, and Firebase. Generate professional employment letters, experience certificates, and salary certificates with custom backgrounds and automatic cloud storage.

## 🚀 Features

### Document Generation
- **PDF with Background**: Create professional documents with custom background images
- **Simple PDF**: Generate basic text-based documents for quick printing
- **Multiple Templates**: Support for Letter of Employment, Experience Certificate, and Salary Certificate
- **Quality Options**: Choose from Standard, High Quality, or Ultra HD PDF generation
- **Real-time Preview**: See your document as you type with live preview

### Firebase Integration
- **Authentication**: Secure user login and registration system
- **Cloud Storage**: Automatically save generated PDFs to Firebase Storage
- **Database**: Store document metadata and form data in Firestore
- **User Isolation**: Each user can only access their own documents
- **Automatic Backup**: All generated documents are securely stored in the cloud

### User Experience
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Clean, intuitive interface built with Tailwind CSS
- **Form Validation**: Smart form handling with proper error messages
- **File Upload**: Support for background images and signature uploads
- **Template Selection**: Easy switching between different document types

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Lucide React Icons
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **PDF Generation**: jsPDF + html2canvas
- **Build Tool**: Vite
- **Deployment**: Vercel

## 📋 Prerequisites

Before running this project, ensure you have:

- Node.js 18+ installed
- A Firebase project with the following services enabled:
  - Authentication (Email/Password)
  - Firestore Database
  - Storage
- Firebase project configuration

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd hr-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory with your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Firebase Configuration**
   - Go to your Firebase Console
   - Navigate to Project Settings
   - Copy the configuration values to your `.env` file

## 🔐 Firebase Security Rules

### Firestore Rules
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

### Storage Rules
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

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```
The application will be available at `http://localhost:5173`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## ⚠️ Troubleshooting

### Common Issues

**"Failed to load documents" Error:**
- **Firebase Configuration**: Ensure your `.env.local` file is properly configured
- **See [Firebase Configuration Fix Guide](FIREBASE_CONFIGURATION_FIX.md)** for detailed steps
- **Verify Firebase Services**: Make sure Authentication, Firestore, and Storage are enabled
- **Check Security Rules**: Ensure Firestore and Storage rules are properly configured

**Authentication Issues:**
- Check if Firebase Authentication is enabled
- Verify email/password sign-in method is active
- Check browser console for specific error messages

**PDF Generation Issues:**
- Ensure background images are in PNG, JPG, or JPEG format
- Check if all required form fields are filled
- Verify Firebase Storage is properly configured

## 📁 Project Structure

```
hr-portal/
├── src/
│   ├── components/          # React components
│   │   ├── templates/       # Document templates
│   │   ├── AuthPage.tsx     # Authentication page
│   │   ├── HRPortal.tsx     # Main document generator
│   │   ├── LandingPage.tsx  # Landing page
│   │   └── SideNavbar.tsx   # Navigation sidebar
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx  # Authentication context
│   ├── services/            # Business logic services
│   │   └── documentService.ts # Firebase operations
│   ├── firebase/            # Firebase configuration
│   │   └── config.ts        # Firebase initialization
│   └── main.tsx            # Application entry point
├── public/                  # Static assets
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

## 🔧 Configuration

### Firebase Services Setup

1. **Authentication**
   - Enable Email/Password authentication in Firebase Console
   - Configure sign-in methods as needed

2. **Firestore Database**
   - Create a new database in test mode
   - Update security rules as shown above

3. **Storage**
   - Enable Firebase Storage
   - Update security rules as shown above
   - Set up CORS if needed for cross-origin requests

### Template Configuration

Templates are defined in `src/components/templates/TemplateRegistry.tsx`. Each template includes:
- Required form fields
- Template component
- Display name
- Field validation

## 📝 Usage

### Creating Documents

1. **Upload Background Image**
   - Select a PNG, JPG, or JPEG image
   - A4 format is recommended for best results

2. **Fill Form Fields**
   - Employee details (name, position, joining date)
   - Company information
   - Contact details
   - Signature information

3. **Generate PDF**
   - Choose quality level (Standard, High, Ultra HD)
   - Click "PDF with Background" for professional documents
   - Click "Simple PDF" for basic text documents

4. **Automatic Storage**
   - PDFs are automatically saved to Firebase Storage
   - Document metadata is stored in Firestore
   - Files are organized by user ID for security

### Document Types

- **Letter of Employment**: Confirms employment status and details
- **Experience Certificate**: Certifies work experience and performance
- **Salary Certificate**: Provides salary and employment verification

## 🚨 Troubleshooting

### Common Issues

1. **Firebase Permission Errors**
   - Ensure security rules are properly configured
   - Check that user is authenticated
   - Verify Firebase project configuration

2. **PDF Generation Fails**
   - Check browser console for errors
   - Ensure background image is uploaded
   - Verify form data is complete

3. **Upload Failures**
   - Check Firebase Storage rules
   - Verify network connectivity
   - Ensure file size is within limits

### Debug Mode

The application includes a Firebase Debug component that shows:
- Authentication status
- Firestore connection status
- Storage configuration
- Environment variables

## 🔒 Security Features

- **User Authentication**: Secure login system
- **Data Isolation**: Users can only access their own documents
- **Secure Storage**: Files stored with user-specific paths
- **Input Validation**: Form data validation and sanitization
- **CORS Protection**: Proper cross-origin request handling

## 🚀 Deployment

### Vercel Deployment

1. **Connect Repository**
   - Link your GitHub repository to Vercel
   - Configure build settings

2. **Environment Variables**
   - Add Firebase configuration to Vercel environment variables
   - Ensure all required variables are set

3. **Build Configuration**
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`

### Other Platforms

The application can be deployed to any static hosting platform:
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Firebase Hosting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the troubleshooting section above
- Review Firebase documentation
- Open an issue in the repository

## 🔄 Changelog

### Version 1.0.0
- Initial release with basic PDF generation
- Firebase Authentication integration
- Document template system
- Cloud storage and database integration

---

**Built with ❤️ using React, TypeScript, and Firebase**