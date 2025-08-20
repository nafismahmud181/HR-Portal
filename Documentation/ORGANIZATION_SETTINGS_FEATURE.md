# Organization Settings Feature

This document explains the Organization Settings feature that allows users to update their organization's industry, company size, and logo.

## 🎯 **Feature Overview**

The Organization Settings page provides organization administrators with the ability to:
- **Update Industry**: Select from predefined industry categories
- **Set Company Size**: Choose from employee count ranges
- **Upload Logo**: Upload and manage organization branding
- **View Current Settings**: See existing organization information

## 🏗️ **Architecture**

### **Components Created**
1. **`OrganizationSettingsPage.tsx`** - Main settings page component
2. **`StorageService.ts`** - Firebase Storage operations for logo uploads
3. **Updated `OrganizationService.ts`** - Enhanced organization management
4. **Updated `SideNavbar.tsx`** - Added navigation link to settings

### **Routes Added**
- **`/organization-settings`** - Protected route for organization settings

## 📋 **Features**

### **1. Industry Selection**
- **Predefined Options**: Technology, Healthcare, Finance, Education, Manufacturing, Retail, Consulting, Real Estate, Media & Entertainment, Non-profit, Government, Other
- **Storage**: Stored in Firestore `organizations/{orgId}.industry`

### **2. Company Size Selection**
- **Size Ranges**: 1-10, 11-50, 51-200, 201-500, 501-1000, 1000+ employees
- **Storage**: Stored in Firestore `organizations/{orgId}.companySize`

### **3. Logo Management**
- **File Types**: JPG, PNG, GIF, WebP
- **Size Limit**: Maximum 5MB
- **Storage**: Firebase Storage under `organizations/{orgId}/logos/`
- **Features**: 
  - Preview current logo
  - Upload new logo
  - Automatic old logo deletion
  - Error handling for invalid files

## 🔧 **Technical Implementation**

### **Storage Service (`StorageService.ts`)**
```typescript
export class StorageService {
  // Upload file to Firebase Storage
  static async uploadFile(path: string, file: File): Promise<string>
  
  // Delete file from Firebase Storage
  static async deleteFile(downloadURL: string): Promise<void>
  
  // Generate unique logo path
  static generateLogoPath(organizationId: string, fileName: string): string
  
  // Validate image files
  static isValidImageFile(file: File): boolean
  
  // Validate file size
  static isValidFileSize(file: File, maxSizeMB: number = 5): boolean
}
```

### **Organization Service Updates**
```typescript
// New interface fields
interface Organization {
  industry?: string;
  companySize?: string;
  logoUrl?: string;
}

// New methods
static async getUserOrganization(userId: string): Promise<Organization | null>
static async updateOrganization(orgId: string, updates: Partial<Organization>): Promise<void>
```

### **Form Validation**
- **Industry**: Required selection from dropdown
- **Company Size**: Required selection from dropdown
- **Logo**: Optional, but validates file type and size if provided

## 🛡️ **Security Rules**

### **Firestore Rules**
```javascript
// Allow update of specific fields by organization creator
allow update: if isOrgCreator(orgId) && 
  request.resource.data.diff(resource.data).affectedKeys()
    .hasOnly(['industry', 'companySize', 'logoUrl', 'updatedAt']);
```

### **Storage Rules**
```javascript
// Organization logos
match /organizations/{orgId}/logos/{fileName} {
  // Allow read if user is member of organization
  allow read: if request.auth != null && 
    exists(/databases/$(database)/documents/organizations/$(orgId)/users/$(request.auth.uid));
  
  // Allow write if user is organization creator
  allow write: if request.auth != null && 
    get(/databases/$(database)/documents/organizations/$(orgId)).data.createdBy == request.auth.uid;
}
```

## 🎨 **User Interface**

### **Page Layout**
1. **Header**: Navigation back button and organization name
2. **Form Sections**:
   - Organization Name (read-only)
   - Industry dropdown
   - Company Size dropdown
   - Logo upload with preview
3. **Actions**: Save button with loading state

### **Responsive Design**
- **Mobile-friendly**: Responsive layout for all screen sizes
- **Accessibility**: Proper labels, error messages, and loading states
- **Visual Feedback**: Success/error messages, loading spinners

## 📱 **User Experience Flow**

### **1. Access Settings**
- User clicks "Organization Settings" in sidebar navigation
- Redirected to `/organization-settings` route
- Page loads current organization data

### **2. View Current Settings**
- Displays existing industry, company size, and logo
- Shows organization name (read-only)
- Loads current logo preview if available

### **3. Make Changes**
- Select new industry from dropdown
- Choose new company size from dropdown
- Optionally upload new logo file
- Real-time validation and error messages

### **4. Save Changes**
- Click "Save Changes" button
- Logo uploads to Firebase Storage (if new logo selected)
- Organization data updates in Firestore
- Success message displayed
- Page refreshes with updated data

## 🔄 **Data Flow**

### **Logo Upload Process**
1. **File Selection**: User selects image file
2. **Validation**: Check file type and size
3. **Upload**: File uploaded to Firebase Storage
4. **URL Generation**: Download URL retrieved
5. **Cleanup**: Old logo deleted from storage
6. **Update**: Organization document updated with new logo URL

### **Organization Update Process**
1. **Data Collection**: Gather form data
2. **Logo Processing**: Handle logo upload if needed
3. **Firestore Update**: Update organization document
4. **Success Handling**: Show success message and refresh data

## 🚀 **Getting Started**

### **Prerequisites**
1. Firebase project with Firestore and Storage enabled
2. Updated security rules applied
3. User must be organization creator/admin

### **Setup Steps**
1. **Update Firestore Rules**: Apply the new organization rules
2. **Update Storage Rules**: Apply the new storage rules
3. **Deploy Application**: Build and deploy the updated app
4. **Test Feature**: Navigate to organization settings and test functionality

### **Testing Checklist**
- [ ] Navigation to settings page works
- [ ] Current organization data loads correctly
- [ ] Industry dropdown shows all options
- [ ] Company size dropdown shows all options
- [ ] Logo upload accepts valid files
- [ ] Logo upload rejects invalid files
- [ ] Logo upload respects size limits
- [ ] Save functionality works correctly
- [ ] Success/error messages display properly
- [ ] Old logo is deleted when new one is uploaded

## 🔮 **Future Enhancements**

### **Potential Improvements**
1. **Logo Cropping**: Add image editing capabilities
2. **Multiple Logo Sizes**: Generate different logo dimensions
3. **Logo History**: Track logo changes over time
4. **Bulk Updates**: Allow updating multiple fields at once
5. **Audit Trail**: Log all organization setting changes
6. **Advanced Validation**: More sophisticated file validation
7. **Logo Templates**: Predefined logo styles and formats

### **Integration Opportunities**
1. **Email Templates**: Use organization logo in generated documents
2. **Branding**: Apply organization colors and logos throughout the app
3. **Reporting**: Include organization details in reports
4. **Analytics**: Track organization characteristics for insights

## 🐛 **Troubleshooting**

### **Common Issues**

#### **Logo Upload Fails**
- Check Firebase Storage rules
- Verify file size is under 5MB
- Ensure file is a valid image format
- Check browser console for error messages

#### **Settings Don't Save**
- Verify Firestore security rules
- Check user has admin role in organization
- Ensure all required fields are filled
- Check browser console for validation errors

#### **Page Doesn't Load**
- Verify user is authenticated
- Check user belongs to an organization
- Ensure route is properly configured
- Check browser console for loading errors

### **Debug Steps**
1. **Check Console Logs**: Look for error messages and API calls
2. **Verify Permissions**: Ensure user has admin role
3. **Check Network Tab**: Monitor API requests and responses
4. **Validate Rules**: Test Firestore and Storage rules
5. **Check Data**: Verify organization document structure

## 📚 **Related Documentation**
- [User Journey Implementation](./USER_JOURNEY_IMPLEMENTATION.md)
- [Organization Firestore Rules](./ORGANIZATION_FIRESTORE_RULES.md)
- [Firebase Setup](./FIREBASE_SETUP.md)

## ✅ **Conclusion**

The Organization Settings feature provides a comprehensive solution for managing organization information and branding. It includes:

- **Secure data management** with proper Firestore and Storage rules
- **User-friendly interface** with intuitive form controls
- **Robust file handling** for logo uploads
- **Comprehensive validation** and error handling
- **Responsive design** for all device types

The feature is production-ready and follows best practices for security, performance, and user experience.
