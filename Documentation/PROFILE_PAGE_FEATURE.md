# Profile Page Feature Documentation

## Overview
The Profile Page allows users to view and manage their personal account information, security settings, and organizational details within the HR Portal.

## Features

### 🔍 **Profile Information Display**
- **Personal Details**: Full name, email address, phone number
- **Account Status**: Email verification status, member since date, last sign-in
- **Organization Context**: Company name, user role, industry information
- **Profile Photo**: Display current photo or default avatar

### ✏️ **Profile Editing**
- **Editable Fields**: Display name, email address, phone number
- **Real-time Validation**: Input validation with error messages
- **Save/Cancel Actions**: Ability to save changes or cancel editing
- **Firebase Integration**: Updates Firebase Auth profile information

### 🔒 **Security Management**
- **Password Change**: Secure password update functionality
- **Account Security**: Display of security-related information
- **Two-Factor Authentication**: Placeholder for future 2FA implementation
- **Validation**: Password strength requirements and confirmation matching

### 🏢 **Organization Information**
- **Company Details**: Organization name, industry, user's role
- **Role Display**: Admin or regular user status
- **Organization-specific Data**: Integration with organization service

## Technical Implementation

### **Components**
- `ProfilePage.tsx`: Main profile page component
- Integrated with existing `SideNavbar` component
- Uses `AuthContext` for user authentication state

### **Services Used**
- `OrganizationService`: For fetching organization details and user roles
- Firebase Auth: For profile updates and password changes
- React Router: For navigation routing

### **State Management**
```typescript
// Profile data state
const [profile, setProfile] = useState<UserProfile | null>(null);

// Form states for editing
const [editForm, setEditForm] = useState({
  displayName: '',
  email: '',
  phoneNumber: ''
});

// Password change form
const [passwordForm, setPasswordForm] = useState({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});
```

### **Data Flow**
1. **Load Profile**: Fetches user data from Firebase Auth and organization data
2. **Display Information**: Shows user details in read-only mode initially
3. **Edit Mode**: Allows editing of specific fields with validation
4. **Save Changes**: Updates Firebase Auth profile and reloads data
5. **Error Handling**: Displays success/error messages to users

## User Interface

### **Layout Structure**
```
┌─────────────────────────────────────────────────────────┐
│ Sidebar Navigation                     │ Main Content   │
│                                        │                │
│ - Templates                           │ Profile Header  │
│ - Documents                           │ ┌─────────────┐ │
│ - Employees                           │ │ Avatar +    │ │
│ - Leave Management                    │ │ Basic Info  │ │
│ - Portal                             │ └─────────────┘ │
│                                        │                │
│ - [Profile] ← Active                  │ Personal Info   │
│ - Organization Settings               │ ┌─────────────┐ │
│ - Help                               │ │ Editable    │ │
│ - Logout                             │ │ Fields      │ │
│                                        │ └─────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### **Design Elements**
- **Gradient Background**: Blue to indigo gradient for modern look
- **Card-based Layout**: White cards with subtle shadows
- **Responsive Design**: Works on desktop and mobile devices
- **Icon Integration**: Lucide React icons for visual elements
- **Color Coding**: Success (green), error (red), warning (orange) messages

## Security Features

### **Input Validation**
- **Email Format**: Validates proper email address format
- **Password Requirements**: Minimum 6 characters for new passwords
- **Phone Number**: Basic phone number format validation
- **Required Fields**: Ensures mandatory fields are not empty

### **Authentication Security**
- **Current Password Required**: Verifies current password before changes
- **Password Confirmation**: Requires confirmation of new password
- **Firebase Security**: Leverages Firebase Auth security features
- **Session Management**: Proper handling of authentication state

## API Integration

### **Firebase Auth Methods**
```typescript
// Update user profile
await updateProfile(currentUser, { displayName: newName });

// Update email address
await updateEmail(currentUser, newEmail);

// Update password
await updatePassword(currentUser, newPassword);
```

### **Organization Service Methods**
```typescript
// Get user's organization
const org = await OrganizationService.getUserOrganization(userId);

// Get user's role in organization
const role = await OrganizationService.getUserRole(orgId, userId);
```

## Error Handling

### **User-Friendly Messages**
- **Success Feedback**: "Profile updated successfully!"
- **Error Display**: Clear error messages with dismiss functionality
- **Validation Errors**: Field-specific validation error messages
- **Loading States**: Spinner animations during data operations

### **Error Types Handled**
- Network connectivity issues
- Firebase authentication errors
- Validation failures
- Organization data access errors

## Accessibility Features

### **Keyboard Navigation**
- Tab order for form fields
- Enter key submission
- Escape key for canceling operations

### **Screen Reader Support**
- Proper ARIA labels
- Semantic HTML structure
- Error announcement support

### **Visual Accessibility**
- High contrast colors
- Clear focus indicators
- Readable font sizes
- Icon with text labels

## Future Enhancements

### **Planned Features**
1. **Profile Photo Upload**: Integration with Firebase Storage
2. **Two-Factor Authentication**: Enhanced security setup
3. **Activity Log**: Display of recent account activity
4. **Export Data**: Download personal data functionality
5. **Account Deletion**: Self-service account removal
6. **Notification Preferences**: Email and app notification settings

### **Integration Possibilities**
- **Employee Directory**: Link to employee profile if user is an employee
- **Document History**: Show user's document generation history
- **Leave Balance**: Display personal leave information
- **Team Management**: Admin features for managing team members

## Testing Checklist

### **Functional Testing**
- [ ] Profile data loads correctly
- [ ] Edit mode enables/disables properly
- [ ] Form validation works for all fields
- [ ] Save functionality updates Firebase Auth
- [ ] Password change requires current password
- [ ] Organization information displays correctly
- [ ] Error messages display appropriately
- [ ] Success messages appear after updates

### **UI/UX Testing**
- [ ] Responsive design on different screen sizes
- [ ] Loading states display during data fetching
- [ ] Navigation between edit and view modes
- [ ] Form reset functionality works
- [ ] Icon and text alignment is correct
- [ ] Color contrast meets accessibility standards

### **Security Testing**
- [ ] Password validation enforces requirements
- [ ] Email format validation prevents invalid entries
- [ ] Current password verification works
- [ ] Firebase Auth integration is secure
- [ ] Organization data access is properly restricted

## Troubleshooting

### **Common Issues**

**Problem**: Profile data not loading
**Solution**: Check Firebase authentication and organization service configuration

**Problem**: Email update fails
**Solution**: Verify user permissions and Firebase Auth settings

**Problem**: Password change doesn't work
**Solution**: Ensure current password is correctly entered and meets requirements

**Problem**: Organization data missing
**Solution**: Verify user belongs to an organization and has proper permissions

### **Debug Information**
- Check browser console for error messages
- Verify Firebase project configuration
- Ensure proper Firestore security rules
- Check network connectivity and API responses
