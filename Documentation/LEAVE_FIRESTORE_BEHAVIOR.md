## Leave Management — Firestore Behavior

This document describes what happens in Firestore when creating, approving/rejecting, and deleting leave requests.

### Collections
- **leaveRequests**: Each document is a single leave request.
- **leaveBalances**: One document per employee, leave type, and year, tracking allowances and usage.

### Creation (Create Leave Request)
- Adds a document to `leaveRequests` with fields:
  - `employeeId`, `employeeName`, `employeeEmail`
  - `leaveType`, `startDate`, `endDate`, `totalDays`, `reason`
  - `status`: "Pending"
  - `managerId`: the current user’s UID
  - `approvedBy`: undefined, `approvedAt`: undefined, `rejectionReason`: undefined
  - `createdAt`: Firestore `Timestamp.now()`, `updatedAt`: `Timestamp.now()`
- `leaveBalances`: unchanged on creation.

### Approval (Approve Leave Request)
- Updates the corresponding `leaveRequests` document:
  - `status`: "Approved"
  - `approvedBy`: manager’s display name if available, otherwise manager UID
  - `approvedAt`: `Timestamp.now()`
  - `updatedAt`: refreshed automatically by the service
- Updates or creates a `leaveBalances` document for the employee, leave type, and year (tracked types only: Annual, Sick, Personal, Maternity, Paternity, Bereavement):
  - `totalDays`: existing total if present; otherwise default allowance for the leave type
  - `usedDays`: previous `usedDays` + `request.totalDays`
  - `remainingDays`: `totalDays - usedDays` (floored at 0)
  - `updatedAt`: `Timestamp.now()`

### Rejection (Reject Leave Request)
- Updates the `leaveRequests` document:
  - `status`: "Rejected"
  - `approvedBy`: manager’s display name if available, otherwise manager UID
  - `approvedAt`: `Timestamp.now()`
  - `rejectionReason`: text provided
  - `updatedAt`: refreshed automatically by the service
- `leaveBalances`: unchanged on rejection.

### Deletion (Delete Leave Request)
- Deletes the `leaveRequests` document.
- If the deleted request was previously `Approved` and has a tracked leave type:
  - Loads the relevant `leaveBalances` document for that employee, type, and year
  - Reconciles usage by subtracting the deleted request’s `totalDays`:
    - `usedDays`: `max(previousUsedDays - request.totalDays, 0)`
    - `remainingDays`: `totalDays - usedDays` (floored at 0)
  - Writes the updated balance (`updatedAt` refreshed)
- If the request was `Pending`/`Rejected` or non-tracked type: balances remain unchanged.

### Default Allowances (used when creating/updating balances if none exist)
- `Annual`: 20
- `Sick`: 10
- `Personal`: 5
- `Maternity`: 90
- `Paternity`: 10
- `Bereavement`: 5
- `Other`: 0 (not tracked in balances)

### Relevant Code
- Service: `src/services/leaveService.ts`
  - Creation: `createLeaveRequest`
  - Approval: `approveLeaveRequest`
  - Rejection: `rejectLeaveRequest`
  - Deletion: `deleteLeaveRequest` (includes balance reconciliation)


