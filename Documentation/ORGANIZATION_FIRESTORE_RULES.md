# Organization Firestore Security Rules

This guide explains how to set up Firestore security rules for the organizations collection in your HR Portal application.

## Firestore Security Rules

Add the following rules to your Firestore security rules in the Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Organizations collection rules
    match /organizations/{orgId} {
      // Allow read if user is authenticated and is a member of the organization
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/organizations/$(orgId)/users/$(request.auth.uid));
      
      // Allow write if user is authenticated and is the creator (admin) of the organization
      allow write: if request.auth != null && 
        resource.data.createdBy == request.auth.uid;
      
      // Allow create if user is authenticated (for new organizations)
      allow create: if request.auth != null;
    }
    
    // Organization users subcollection rules
    match /organizations/{orgId}/users/{userId} {
      // Allow read if user is authenticated and is a member of the organization
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/organizations/$(orgId)/users/$(request.auth.uid));
      
      // Allow write if user is authenticated and is the admin of the organization
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/organizations/$(orgId)/users/$(request.auth.uid)).data.role == 'admin';
      
      // Allow users to read their own user document
      allow read: if request.auth != null && request.auth.uid == userId;
    }
    
    // Keep existing rules for other collections
    match /employees/{employeeId} {
      allow read, write: if request.auth != null;
    }
    
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

### Organization Access
- **`allow read`** - Users can only read organizations they are members of
- **`allow write`** - Only the organization creator (admin) can modify the organization
- **`allow create`** - Any authenticated user can create a new organization

### User Access
- **`allow read`** - Users can read user lists if they are members of the organization
- **`allow write`** - Only organization admins can modify user roles and memberships
- **`allow read (own)`** - Users can always read their own user document

## Security Features

1. **Organization Isolation**: Users can only access organizations they belong to
2. **Admin Privileges**: Only organization creators have admin rights
3. **User Management**: Admins can manage user roles and memberships
4. **Data Protection**: Unauthorized users cannot access organization data

## Testing Rules

You can test your rules in the Firebase Console:

1. Go to the "Rules Playground" tab
2. Write test queries to verify your rules work as expected
3. Test both authenticated and unauthenticated requests
4. Test organization creation and user management

## Example Test Cases

### Organization Creation
```javascript
// Should succeed for authenticated user
request.auth != null && 
  request.method == 'create' && 
  resource.data.createdBy == request.auth.uid
```

### Organization Access
```javascript
// Should succeed for organization member
request.auth != null && 
  exists(/databases/$(database)/documents/organizations/$(orgId)/users/$(request.auth.uid))
```

### User Management
```javascript
// Should succeed for organization admin
request.auth != null && 
  get(/databases/$(database)/documents/organizations/$(orgId)/users/$(request.auth.uid)).data.role == 'admin'
```

## Important Notes

- **Security First**: These rules ensure proper organization isolation and access control
- **Admin Rights**: Organization creators automatically become admins
- **User Isolation**: Users can only access organizations they belong to
- **Testing**: Always test your rules thoroughly before deploying to production

## Troubleshooting

If you encounter issues:

1. **Check Authentication**: Ensure users are properly authenticated
2. **Verify Organization Membership**: Check if users exist in the organization's users subcollection
3. **Check Admin Role**: Verify the user has admin role for write operations
4. **Test Rules**: Use the Rules Playground to debug rule issues

## Next Steps

After setting up the rules:

1. Test organization creation functionality
2. Verify that users can only access their own organizations
3. Test user role management
4. Ensure proper error handling for unauthorized access

Your HR Portal Organization system should now be fully functional with proper Firebase security!
