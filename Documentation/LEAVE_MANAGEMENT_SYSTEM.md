# Leave Management System

## Overview
The Leave Management System is a comprehensive solution for managing employee leave requests, approvals, and balances within the HR Portal. It provides managers and HR personnel with tools to efficiently handle leave applications while maintaining transparency and compliance.

## Features

### 1. Dashboard Overview
- **Statistics Cards**: Display pending, approved, rejected leave requests and total employee count
- **Recent Requests Table**: Shows the latest 5 leave requests with quick action buttons
- **Real-time Updates**: All data is fetched from Firestore and updates in real-time

### 2. Leave Request Management
- **Create New Requests**: Modal form for submitting leave requests
- **Request Details**: Comprehensive view of each leave request
- **Approval Workflow**: Managers can approve or reject requests with reasons
- **Status Tracking**: Visual indicators for different request statuses

### 3. Leave Balances
- **Balance Cards**: Individual cards showing leave type, total days, used days, and remaining days
- **Progress Bars**: Visual representation of leave usage
- **Year-based Tracking**: Separate balances for different years

### 4. Calendar View
- **Monthly Calendar**: Interactive calendar showing all leave requests
- **Color-coded Status**: Different colors for approved, pending, rejected, and cancelled requests
- **Navigation**: Easy month-to-month navigation
- **Employee Indicators**: Shows employee names on leave dates

### 5. Advanced Filtering
- **Search**: Find requests by employee name or email
- **Status Filter**: Filter by request status (Pending, Approved, Rejected, Cancelled)
- **Leave Type Filter**: Filter by leave type (Annual, Sick, Personal, etc.)
- **Date Range**: Filter requests within specific date ranges

## Components

### Core Components
1. **LeaveManagementPage**: Main page with tabbed interface
2. **CreateLeaveRequestModal**: Form for creating new leave requests
3. **LeaveRequestDetailsModal**: Detailed view of leave requests
4. **LeaveBalanceCard**: Individual leave balance display
5. **LeaveCalendar**: Monthly calendar view

### Service Layer
- **leaveService**: Handles all leave-related database operations
- **employeeService**: Manages employee data for leave requests

## Data Models

### LeaveRequest
```typescript
interface LeaveRequest {
  id?: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  leaveType: 'Annual' | 'Sick' | 'Personal' | 'Maternity' | 'Paternity' | 'Bereavement' | 'Other';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  managerId?: string;
  managerName?: string;
  approvedBy?: string;
  approvedAt?: Timestamp;
  rejectionReason?: string;
  attachments?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### LeaveBalance
```typescript
interface LeaveBalance {
  id?: string;
  employeeId: string;
  employeeName: string;
  leaveType: 'Annual' | 'Sick' | 'Personal' | 'Maternity' | 'Paternity' | 'Bereavement';
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  year: number;
  updatedAt: Timestamp;
}
```

## Usage

### For Employees
1. Navigate to Leave Management
2. Click "New Leave Request"
3. Fill in the form with leave details
4. Submit and wait for approval

### For Managers
1. View pending requests in the Overview tab
2. Click "View" to see request details
3. Approve or reject with appropriate reasons
4. Monitor team leave balances

### For HR Personnel
1. Access all leave requests and balances
2. Generate reports and analytics
3. Manage leave policies and balances
4. Oversee approval workflows

## Navigation
The Leave Management system is accessible through the main navigation sidebar with the Calendar icon. The route is `/leave` and requires authentication.

## Future Enhancements
- Email notifications for leave requests and approvals
- Leave policy management
- Bulk leave operations
- Advanced reporting and analytics
- Integration with payroll systems
- Mobile app support
- Leave request templates
- Automated approval workflows

## Technical Implementation
- Built with React and TypeScript
- Uses Firebase Firestore for data storage
- Responsive design with Tailwind CSS
- Real-time data synchronization
- Modular component architecture
- Type-safe interfaces and services
