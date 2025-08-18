# Employee Firestore Security Rules

This guide explains how to set up Firestore security rules for the employees collection in your HR Portal application.

## Firestore Security Rules

Add the following rules to your Firestore security rules in the Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Employees collection rules
    match /employees/{employeeId} {
      // Allow read/write if user is authenticated
      allow read, write: if request.auth != null;
      
      // Optional: Add more specific rules based on your needs
      // For example, only allow users to read employees in their own company:
      // allow read: if request.auth != null && 
      //   resource.data.companyId == request.auth.token.companyId;
      
      // Or only allow HR managers to write:
      // allow write: if request.auth != null && 
      //   request.auth.token.role == 'hr_manager';
    }
    
    // Keep existing rules for other collections
    match /documents/{documentId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Default rule - deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## How to Apply These Rules

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. In the left sidebar, click on "Firestore Database"
4. Click on the "Rules" tab
5. Replace the existing rules with the ones above
6. Click "Publish"

## What These Rules Do

- **`allow read, write: if request.auth != null;`** - Only authenticated users can read and write employee data
- **`match /employees/{employeeId}`** - Applies to all documents in the employees collection
- **`request.auth != null`** - Ensures the user is logged in before allowing access

## Customization Options

You can customize these rules based on your organization's needs:

### Company-Based Access
```javascript
allow read, write: if request.auth != null && 
  resource.data.companyId == request.auth.token.companyId;
```

### Role-Based Access
```javascript
allow read: if request.auth != null;
allow write: if request.auth != null && 
  request.auth.token.role in ['hr_manager', 'admin'];
```

### Owner-Based Access
```javascript
allow read: if request.auth != null;
allow write: if request.auth != null && 
  resource.data.createdBy == request.auth.uid;
```

## Testing Rules

You can test your rules in the Firebase Console:

1. Go to the "Rules Playground" tab
2. Write test queries to verify your rules work as expected
3. Test both authenticated and unauthenticated requests

## Important Notes

- **Security First**: These rules ensure only authenticated users can access employee data
- **Flexibility**: You can modify the rules to match your organization's security requirements
- **Testing**: Always test your rules thoroughly before deploying to production
- **Monitoring**: Use Firebase Security Rules monitoring to track rule evaluations

## Troubleshooting

If you encounter issues:

1. **Check Authentication**: Ensure users are properly authenticated
2. **Verify Rules**: Make sure the rules are published and active
3. **Check Console**: Look for error messages in the browser console
4. **Test Rules**: Use the Rules Playground to debug rule issues

## Next Steps

After setting up the rules:

1. Test the employee creation functionality
2. Verify that unauthenticated users cannot access employee data
3. Test employee listing and filtering
4. Ensure proper error handling for unauthorized access

Your HR Portal Employee Directory should now be fully functional with proper Firebase security!
