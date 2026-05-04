# EC4 BuildOps API Document

## Base Information

- **Base URL**: `/api/v1`
- **Content-Type**: `application/json`
- **Authentication**: Most endpoints use Bearer JWT access tokens via the `Authorization` header.
- **Authorization**: Many endpoints require permission-based access control such as `manageProjects`, `getMaterials`, `approveContracts`, etc.

---

## Example Conventions

### Auth header
```http
Authorization: Bearer <accessToken>
```

### Common success response
```json
{
  "code": 200,
  "message": "OK",
  "data": {}
}
```

### Common error response
```json
{
  "code": 400,
  "message": "Validation error",
  "errors": []
}
```

---

## 1. Auth APIs

Base path: `/api/v1/auth`

### 1.1 Register
- **Method**: `POST`
- **Path**: `/register`
- **Auth**: No

**Request**
```json
{
  "email": "john.doe@example.com",
  "password": "P@ssw0rd123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "0901234567"
}
```

**Response**
```json
{
  "code": 201,
  "message": "Created",
  "data": {
    "user": {
      "id": "66f1a2b3c4d5e6f789012345",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "0901234567"
    }
  }
}
```

### 1.2 Login
- **Method**: `POST`
- **Path**: `/login`
- **Auth**: No

**Request**
```json
{
  "email": "john.doe@example.com",
  "password": "P@ssw0rd123"
}
```

**Response**
```json
{
  "code": 200,
  "message": "OK",
  "data": {
    "user": {
      "id": "66f1a2b3c4d5e6f789012345",
      "email": "john.doe@example.com"
    },
    "tokens": {
      "access": "<accessToken>",
      "refresh": "<refreshToken>"
    }
  }
}
```

### 1.3 Forgot password
- **Method**: `POST`
- **Path**: `/forgot-password`
- **Auth**: No

**Request**
```json
{
  "email": "john.doe@example.com"
}
```

**Response**
```json
{
  "code": 200,
  "message": "Password reset email sent"
}
```

### 1.4 Reset password
- **Method**: `POST`
- **Path**: `/reset-password/:resetToken`
- **Auth**: No

**Request**
```json
{
  "newPassword": "NewP@ssw0rd123"
}
```

**Response**
```json
{
  "code": 200,
  "message": "Password reset successfully"
}
```

### 1.5 Logout
- **Method**: `POST`
- **Path**: `/logout`
- **Auth**: Yes

**Request**
```json
{}
```

**Response**
```json
{
  "code": 200,
  "message": "Logged out successfully"
}
```

### 1.6 Refresh access token
- **Method**: `POST`
- **Path**: `/refresh-token`
- **Auth**: No

**Request**
```json
{}
```

**Response**
```json
{
  "code": 200,
  "message": "OK",
  "data": {
    "access": "<newAccessToken>"
  }
}
```

### 1.7 Get current user
- **Method**: `GET`
- **Path**: `/me`
- **Auth**: Yes

**Response**
```json
{
  "code": 200,
  "message": "OK",
  "data": {
    "id": "66f1a2b3c4d5e6f789012345",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "0901234567"
  }
}
```

### 1.8 Update current user profile
- **Method**: `PATCH`
- **Path**: `/me`
- **Auth**: Yes

**Request**
```json
{
  "firstName": "Johnny",
  "phone": "0912345678"
}
```

**Response**
```json
{
  "code": 200,
  "message": "Updated successfully",
  "data": {
    "firstName": "Johnny",
    "phone": "0912345678"
  }
}
```

### 1.9 Change current user password
- **Method**: `PATCH`
- **Path**: `/me/password`
- **Auth**: Yes

**Request**
```json
{
  "password": "OldP@ssw0rd123",
  "newPassword": "NewP@ssw0rd123"
}
```

**Response**
```json
{
  "code": 200,
  "message": "Password changed successfully"
}
```

### 1.10 Verify email
- **Method**: `GET`
- **Path**: `/verify-email/:token`
- **Auth**: No

**Response**
```json
{
  "code": 200,
  "message": "Email verified successfully"
}
```

### 1.11 Resend verify email
- **Method**: `POST`
- **Path**: `/resend-verify-email`
- **Auth**: Yes

**Request**
```json
{}
```

**Response**
```json
{
  "code": 200,
  "message": "Verification email sent"
}
```

---

## 2. Project APIs

Base path: `/api/v1/projects`

### 2.1 List projects
- **Method**: `GET`
- **Path**: `/`
- **Auth**: Yes

**Request**
```http
GET /api/v1/projects?status=active&page=1&limit=10
```

**Response**
```json
{
  "code": 200,
  "message": "OK",
  "data": {
    "results": [
      {
        "id": "66f1a2b3c4d5e6f789012345",
        "code": "PRJ-001",
        "name": "New Office Tower",
        "status": "active"
      }
    ],
    "page": 1,
    "limit": 10,
    "totalResults": 1
  }
}
```

### 2.2 Create project
- **Method**: `POST`
- **Path**: `/`
- **Auth**: Yes

**Request**
```json
{
  "code": "PRJ-001",
  "name": "New Office Tower",
  "type": "construction",
  "status": "active",
  "location": "Hanoi",
  "startDate": "2026-05-01",
  "endDate": "2027-05-01",
  "totalBudget": 1000000000,
  "currency": "VND"
}
```

**Response**
```json
{
  "code": 201,
  "message": "Created",
  "data": {
    "id": "66f1a2b3c4d5e6f789012345",
    "code": "PRJ-001",
    "name": "New Office Tower"
  }
}
```

### 2.3 Get project detail
- **Method**: `GET`
- **Path**: `/:projectId`
- **Auth**: Yes

**Response**
```json
{
  "code": 200,
  "message": "OK",
  "data": {
    "id": "66f1a2b3c4d5e6f789012345",
    "code": "PRJ-001",
    "name": "New Office Tower",
    "status": "active"
  }
}
```

### 2.4 Update project
- **Method**: `PATCH`
- **Path**: `/:projectId`
- **Auth**: Yes

**Request**
```json
{
  "name": "New Office Tower Phase 2",
  "status": "on-hold"
}
```

**Response**
```json
{
  "code": 200,
  "message": "Updated successfully",
  "data": {
    "id": "66f1a2b3c4d5e6f789012345",
    "name": "New Office Tower Phase 2"
  }
}
```

### 2.5 Archive project
- **Method**: `DELETE`
- **Path**: `/:projectId`
- **Auth**: Yes

**Response**
```json
{
  "code": 200,
  "message": "Archived successfully"
}
```

### 2.6 Add project member
- **Method**: `POST`
- **Path**: `/:projectId/members`
- **Auth**: Yes

**Request**
```json
{
  "userId": "66f1a2b3c4d5e6f789012999",
  "role": "engineer"
}
```

**Response**
```json
{
  "code": 200,
  "message": "Member added successfully"
}
```

### 2.7 Remove project member
- **Method**: `DELETE`
- **Path**: `/:projectId/members/:userId`
- **Auth**: Yes

**Response**
```json
{
  "code": 200,
  "message": "Member removed successfully"
}
```

### 2.8 Get WBS items of a project
- **Method**: `GET`
- **Path**: `/:projectId/wbs`
- **Auth**: Yes

**Response**
```json
{
  "code": 200,
  "message": "OK",
  "data": [
    {
      "id": "wbs001",
      "name": "Foundation",
      "progress": 25
    }
  ]
}
```

### 2.9 Create WBS item in project
- **Method**: `POST`
- **Path**: `/:projectId/wbs`
- **Auth**: Yes

**Request**
```json
{
  "name": "Foundation",
  "code": "WBS-001",
  "parentId": null
}
```

**Response**
```json
{
  "code": 201,
  "message": "Created",
  "data": {
    "id": "wbs001",
    "name": "Foundation"
  }
}
```

### 2.10 Get project contracts
- **Method**: `GET`
- **Path**: `/:projectId/contracts`
- **Auth**: Yes

**Response**
```json
{
  "code": 200,
  "message": "OK",
  "data": []
}
```

### 2.11 Create contract in project
- **Method**: `POST`
- **Path**: `/:projectId/contracts`
- **Auth**: Yes

**Request**
```json
{
  "code": "CT-001",
  "name": "Main construction contract",
  "value": 500000000
}
```

**Response**
```json
{
  "code": 201,
  "message": "Created",
  "data": {
    "id": "ct001",
    "code": "CT-001"
  }
}
```

### 2.12 Get project acceptance list
- **Method**: `GET`
- **Path**: `/:projectId/acceptance`
- **Auth**: Yes

**Response**
```json
{
  "code": 200,
  "message": "OK",
  "data": []
}
```

### 2.13 Create acceptance record
- **Method**: `POST`
- **Path**: `/:projectId/acceptance`
- **Auth**: Yes

**Request**
```json
{
  "title": "Acceptance for foundation",
  "wbsItemId": "wbs001"
}
```

**Response**
```json
{
  "code": 201,
  "message": "Created"
}
```

### 2.14 Get project BOQ
- **Method**: `GET`
- **Path**: `/:projectId/boq`
- **Auth**: Yes

**Response**
```json
{
  "code": 200,
  "message": "OK",
  "data": []
}
```

### 2.15 Create BOQ item
- **Method**: `POST`
- **Path**: `/:projectId/boq`
- **Auth**: Yes

**Request**
```json
{
  "name": "Concrete",
  "unit": "m3",
  "quantity": 100
}
```

**Response**
```json
{
  "code": 201,
  "message": "Created"
}
```

### 2.16 Bulk create BOQ items
- **Method**: `POST`
- **Path**: `/:projectId/boq/bulk`
- **Auth**: Yes

**Request**
```json
{
  "items": [
    { "name": "Concrete", "unit": "m3", "quantity": 100 },
    { "name": "Steel", "unit": "kg", "quantity": 5000 }
  ]
}
```

**Response**
```json
{
  "code": 201,
  "message": "Created",
  "data": {
    "created": 2
  }
}
```

### 2.17 List material requests of a project
- **Method**: `GET`
- **Path**: `/:projectId/material-requests`
- **Auth**: Yes

**Response**
```json
{
  "code": 200,
  "message": "OK",
  "data": []
}
```

### 2.18 Create material request
- **Method**: `POST`
- **Path**: `/:projectId/material-requests`
- **Auth**: Yes

**Request**
```json
{
  "items": [
    { "materialId": "mat001", "quantity": 20 }
  ]
}
```

**Response**
```json
{
  "code": 201,
  "message": "Created"
}
```

### 2.19 List inventory stock of a project
- **Method**: `GET`
- **Path**: `/:projectId/inventory`
- **Auth**: Yes

**Response**
```json
{
  "code": 200,
  "message": "OK",
  "data": []
}
```

### 2.20 List inventory transactions
- **Method**: `GET`
- **Path**: `/:projectId/inventory/transactions`
- **Auth**: Yes

**Response**
```json
{
  "code": 200,
  "message": "OK",
  "data": []
}
```

### 2.21 Create inventory transaction
- **Method**: `POST`
- **Path**: `/:projectId/inventory/transactions`
- **Auth**: Yes

**Request**
```json
{
  "materialId": "mat001",
  "type": "in",
  "quantity": 20,
  "note": "Received from supplier"
}
```

**Response**
```json
{
  "code": 201,
  "message": "Created"
}
```

---

## 3. WBS APIs

Base path: `/api/v1/wbs-items`

### 3.1 Get WBS item detail
- **Method**: `GET`
- **Path**: `/:id`
- **Auth**: Yes

**Response**
```json
{
  "code": 200,
  "message": "OK",
  "data": {
    "id": "wbs001",
    "name": "Foundation",
    "progress": 25
  }
}
```

### 3.2 Update WBS item
- **Method**: `PATCH`
- **Path**: `/:id`
- **Auth**: Yes

**Request**
```json
{
  "name": "Foundation work",
  "progress": 30
}
```

**Response**
```json
{
  "code": 200,
  "message": "Updated successfully"
}
```

### 3.3 Delete WBS item
- **Method**: `DELETE`
- **Path**: `/:id`
- **Auth**: Yes

**Response**
```json
{
  "code": 200,
  "message": "Deleted successfully"
}
```

### 3.4 List progress updates for WBS item
- **Method**: `GET`
- **Path**: `/:id/progress`
- **Auth**: Yes

**Request**
```http
GET /api/v1/wbs-items/wbs001/progress?page=1&limit=10
```

**Response**
```json
{
  "code": 200,
  "message": "OK",
  "data": []
}
```

### 3.5 Create progress update for WBS item
- **Method**: `POST`
- **Path**: `/:id/progress`
- **Auth**: Yes

**Request**
```json
{
  "reportDate": "2026-05-05",
  "progress": 20,
  "note": "Completed excavation"
}
```

**Response**
```json
{
  "code": 201,
  "message": "Created"
}
```

### 3.6 Approve progress update
- **Method**: `PATCH`
- **Path**: `/:id/progress/:updateId/approve`
- **Auth**: Yes

**Request**
```json
{}
```

**Response**
```json
{
  "code": 200,
  "message": "Approved successfully"
}
```

---

## 4. Contract APIs

Base path: `/api/v1/contracts`

### 4.1 Get contract detail
- **Method**: `GET`
- **Path**: `/:id`
- **Auth**: Yes

**Response**
```json
{
  "code": 200,
  "message": "OK",
  "data": {
    "id": "ct001",
    "code": "CT-001",
    "name": "Main construction contract"
  }
}
```

### 4.2 Update contract
- **Method**: `PATCH`
- **Path**: `/:id`
- **Auth**: Yes

**Request**
```json
{
  "name": "Updated contract name"
}
```

**Response**
```json
{
  "code": 200,
  "message": "Updated successfully"
}
```

### 4.3 Delete contract
- **Method**: `DELETE`
- **Path**: `/:id`
- **Auth**: Yes

**Response**
```json
{
  "code": 200,
  "message": "Deleted successfully"
}
```

### 4.4 Approve contract
- **Method**: `PATCH`
- **Path**: `/:id/approve`
- **Auth**: Yes

**Request**
```json
{}
```

**Response**
```json
{
  "code": 200,
  "message": "Approved successfully"
}
```

### 4.5 Add appendix
- **Method**: `POST`
- **Path**: `/:id/appendices`
- **Auth**: Yes

**Request**
```json
{
  "title": "Appendix A",
  "content": "Additional scope details"
}
```

**Response**
```json
{
  "code": 201,
  "message": "Created"
}
```

### 4.6 Update appendix
- **Method**: `PATCH`
- **Path**: `/:id/appendices/:appendixId`
- **Auth**: Yes

**Request**
```json
{
  "title": "Appendix A - updated"
}
```

**Response**
```json
{
  "code": 200,
  "message": "Updated successfully"
}
```

### 4.7 Add payment
- **Method**: `POST`
- **Path**: `/:id/payments`
- **Auth**: Yes

**Request**
```json
{
  "amount": 100000000,
  "paidAt": "2026-05-05"
}
```

**Response**
```json
{
  "code": 201,
  "message": "Created"
}
```

### 4.8 Update payment
- **Method**: `PATCH`
- **Path**: `/:id/payments/:paymentId`
- **Auth**: Yes

**Request**
```json
{
  "amount": 120000000
}
```

**Response**
```json
{
  "code": 200,
  "message": "Updated successfully"
}
```

---

## 5. BOQ APIs

Base path: `/api/v1/boq`

### 5.1 Update BOQ item
- **Method**: `PATCH`
- **Path**: `/:id`
- **Auth**: Yes

**Request**
```json
{
  "quantity": 120,
  "unitPrice": 500000
}
```

**Response**
```json
{
  "code": 200,
  "message": "Updated successfully"
}
```

### 5.2 Delete BOQ item
- **Method**: `DELETE`
- **Path**: `/:id`
- **Auth**: Yes

**Response**
```json
{
  "code": 200,
  "message": "Deleted successfully"
}
```

---

## 6. Equipment APIs

Base path: `/api/v1/equipment`

### 6.1 List equipment
- **Method**: `GET`
- **Path**: `/`
- **Auth**: Yes

**Response**
```json
{
  "code": 200,
  "message": "OK",
  "data": []
}
```

### 6.2 Create equipment
- **Method**: `POST`
- **Path**: `/`
- **Auth**: Yes

**Request**
```json
{
  "name": "Excavator",
  "code": "EQ-001",
  "status": "available"
}
```

**Response**
```json
{
  "code": 201,
  "message": "Created"
}
```

### 6.3 Get equipment detail
- **Method**: `GET`
- **Path**: `/:id`
- **Auth**: Yes

**Response**
```json
{
  "code": 200,
  "message": "OK",
  "data": {
    "id": "eq001",
    "name": "Excavator"
  }
}
```

### 6.4 Update equipment
- **Method**: `PATCH`
- **Path**: `/:id`
- **Auth**: Yes

**Request**
```json
{
  "status": "in-use"
}
```

**Response**
```json
{
  "code": 200,
  "message": "Updated successfully"
}
```

### 6.5 Remove equipment
- **Method**: `DELETE`
- **Path**: `/:id`
- **Auth**: Yes

**Response**
```json
{
  "code": 200,
  "message": "Deleted successfully"
}
```

### 6.6 Assign equipment
- **Method**: `POST`
- **Path**: `/:id/assign`
- **Auth**: Yes

**Request**
```json
{
  "projectId": "66f1a2b3c4d5e6f789012345",
  "assignedAt": "2026-05-05"
}
```

**Response**
```json
{
  "code": 200,
  "message": "Assigned successfully"
}
```

### 6.7 Create equipment log
- **Method**: `POST`
- **Path**: `/:id/logs`
- **Auth**: Yes

**Request**
```json
{
  "note": "Routine maintenance",
  "loggedAt": "2026-05-05"
}
```

**Response**
```json
{
  "code": 201,
  "message": "Created"
}
```

### 6.8 List equipment logs
- **Method**: `GET`
- **Path**: `/:id/logs`
- **Auth**: Yes

**Response**
```json
{
  "code": 200,
  "message": "OK",
  "data": []
}
```

---

## 7. Document APIs

Base path: `/api/v1`

### 7.1 List folders in project
- **Method**: `GET`
- **Path**: `/projects/:projectId/folders`
- **Auth**: Yes

**Response**
```json
{
  "code": 200,
  "message": "OK",
  "data": []
}
```

### 7.2 Create folder in project
- **Method**: `POST`
- **Path**: `/projects/:projectId/folders`
- **Auth**: Yes

**Request**
```json
{
  "name": "Contracts"
}
```

**Response**
```json
{
  "code": 201,
  "message": "Created"
}
```

### 7.3 Update folder
- **Method**: `PATCH`
- **Path**: `/folders/:id`
- **Auth**: Yes

**Request**
```json
{
  "name": "Updated Contracts"
}
```

**Response**
```json
{
  "code": 200,
  "message": "Updated successfully"
}
```

### 7.4 Delete folder
- **Method**: `DELETE`
- **Path**: `/folders/:id`
- **Auth**: Yes

**Response**
```json
{
  "code": 200,
  "message": "Deleted successfully"
}
```

### 7.5 List documents in project
- **Method**: `GET`
- **Path**: `/projects/:projectId/documents`
- **Auth**: Yes

**Response**
```json
{
  "code": 200,
  "message": "OK",
  "data": []
}
```

### 7.6 Create document
- **Method**: `POST`
- **Path**: `/projects/:projectId/documents`
- **Auth**: Yes

**Request**
```json
{
  "name": "Contract file",
  "folderId": "folder001",
  "url": "https://example.com/file.pdf"
}
```

**Response**
```json
{
  "code": 201,
  "message": "Created"
}
```

### 7.7 Update document
- **Method**: `PATCH`
- **Path**: `/documents/:id`
- **Auth**: Yes

**Request**
```json
{
  "name": "Updated contract file"
}
```

**Response**
```json
{
  "code": 200,
  "message": "Updated successfully"
}
```

### 7.8 Delete document
- **Method**: `DELETE`
- **Path**: `/documents/:id`
- **Auth**: Yes

**Response**
```json
{
  "code": 200,
  "message": "Deleted successfully"
}
```

---

## 8. Cost / Expense APIs

Base path: `/api/v1`

### 8.1 List project costs
- **Method**: `GET`
- **Path**: `/projects/:projectId/costs`
- **Auth**: Yes

**Response**
```json
{
  "code": 200,
  "message": "OK",
  "data": []
}
```

### 8.2 Create cost
- **Method**: `POST`
- **Path**: `/projects/:projectId/costs`
- **Auth**: Yes

**Request**
```json
{
  "name": "Labor cost",
  "amount": 5000000
}
```

**Response**
```json
{
  "code": 201,
  "message": "Created"
}
```

### 8.3 Update cost
- **Method**: `PATCH`
- **Path**: `/costs/:id`
- **Auth**: Yes

**Request**
```json
{
  "amount": 6000000
}
```

**Response**
```json
{
  "code": 200,
  "message": "Updated successfully"
}
```

### 8.4 Approve cost
- **Method**: `PATCH`
- **Path**: `/costs/:id/approve`
- **Auth**: Yes

**Request**
```json
{}
```

**Response**
```json
{
  "code": 200,
  "message": "Approved successfully"
}
```

### 8.5 List project expenses
- **Method**: `GET`
- **Path**: `/projects/:projectId/expenses`
- **Auth**: Yes

**Response**
```json
{
  "code": 200,
  "message": "OK",
  "data": []
}
```

### 8.6 Create expense
- **Method**: `POST`
- **Path**: `/projects/:projectId/expenses`
- **Auth**: Yes

**Request**
```json
{
  "title": "Site cleaning",
  "amount": 300000
}
```

**Response**
```json
{
  "code": 201,
  "message": "Created"
}
```

### 8.7 Get expense detail
- **Method**: `GET`
- **Path**: `/expenses/:id`
- **Auth**: Yes

**Response**
```json
{
  "code": 200,
  "message": "OK",
  "data": {
    "id": "exp001",
    "title": "Site cleaning",
    "amount": 300000
  }
}
```

### 8.8 Update expense
- **Method**: `PATCH`
- **Path**: `/expenses/:id`
- **Auth**: Yes

**Request**
```json
{
  "amount": 350000
}
```

**Response**
```json
{
  "code": 200,
  "message": "Updated successfully"
}
```

### 8.9 Approve expense
- **Method**: `PATCH`
- **Path**: `/expenses/:id/approve`
- **Auth**: Yes

**Request**
```json
{}
```

**Response**
```json
{
  "code": 200,
  "message": "Approved successfully"
}
```

---

## 9. Timesheet APIs

Base path: `/api/v1`

### 9.1 List project employees
- **Method**: `GET`
- **Path**: `/projects/:projectId/employees`
- **Auth**: Yes

**Response**
```json
{
  "code": 200,
  "message": "OK",
  "data": []
}
```

### 9.2 Add project employee
- **Method**: `POST`
- **Path**: `/projects/:projectId/employees`
- **Auth**: Yes

**Request**
```json
{
  "userId": "66f1a2b3c4d5e6f789012999",
  "role": "worker"
}
```

**Response**
```json
{
  "code": 201,
  "message": "Created"
}
```

### 9.3 Update employee assignment
- **Method**: `PATCH`
- **Path**: `/employees/:projectId/:userId`
- **Auth**: Yes

**Request**
```json
{
  "role": "supervisor"
}
```

**Response**
```json
{
  "code": 200,
  "message": "Updated successfully"
}
```

### 9.4 Remove employee from project
- **Method**: `DELETE`
- **Path**: `/employees/:projectId/:userId`
- **Auth**: Yes

**Response**
```json
{
  "code": 200,
  "message": "Removed successfully"
}
```

### 9.5 List timesheets
- **Method**: `GET`
- **Path**: `/projects/:projectId/timesheets`
- **Auth**: Yes

**Response**
```json
{
  "code": 200,
  "message": "OK",
  "data": []
}
```

### 9.6 Create timesheets
- **Method**: `POST`
- **Path**: `/projects/:projectId/timesheets`
- **Auth**: Yes

**Request**
```json
{
  "entries": [
    {
      "userId": "66f1a2b3c4d5e6f789012999",
      "date": "2026-05-05",
      "hours": 8
    }
  ]
}
```

**Response**
```json
{
  "code": 201,
  "message": "Created"
}
```

### 9.7 Update timesheet
- **Method**: `PATCH`
- **Path**: `/timesheets/:id`
- **Auth**: Yes

**Request**
```json
{
  "hours": 7.5
}
```

**Response**
```json
{
  "code": 200,
  "message": "Updated successfully"
}
```

### 9.8 Approve timesheet
- **Method**: `PATCH`
- **Path**: `/timesheets/:id/approve`
- **Auth**: Yes

**Request**
```json
{}
```

**Response**
```json
{
  "code": 200,
  "message": "Approved successfully"
}
```

---

## 10. Site Diary APIs

Base path: `/api/v1`

### 10.1 List site diaries for a project
- **Method**: `GET`
- **Path**: `/projects/:projectId/site-diaries`
- **Auth**: Yes

**Response**
```json
{
  "code": 200,
  "message": "OK",
  "data": []
}
```

### 10.2 Create site diary
- **Method**: `POST`
- **Path**: `/projects/:projectId/site-diaries`
- **Auth**: Yes

**Request**
```json
{
  "date": "2026-05-05",
  "weather": "Sunny",
  "notes": "Work proceeded as planned"
}
```

**Response**
```json
{
  "code": 201,
  "message": "Created"
}
```

### 10.3 Get site diary detail
- **Method**: `GET`
- **Path**: `/site-diaries/:id`
- **Auth**: Yes

**Response**
```json
{
  "code": 200,
  "message": "OK",
  "data": {
    "id": "sd001"
  }
}
```

### 10.4 Update site diary
- **Method**: `PATCH`
- **Path**: `/site-diaries/:id`
- **Auth**: Yes

**Request**
```json
{
  "notes": "Updated site notes"
}
```

**Response**
```json
{
  "code": 200,
  "message": "Updated successfully"
}
```

### 10.5 Approve site diary
- **Method**: `PATCH`
- **Path**: `/site-diaries/:id/approve`
- **Auth**: Yes

**Request**
```json
{}
```

**Response**
```json
{
  "code": 200,
  "message": "Approved successfully"
}
```

---

## 11. Reports APIs

Base path: `/api/v1`

### 11.1 Progress report
- **Method**: `GET`
- **Path**: `/projects/:projectId/reports/progress`
- **Auth**: Yes

**Response**
```json
{
  "code": 200,
  "message": "OK",
  "data": {
    "planned": 40,
    "actual": 35
  }
}
```

### 11.2 Cost report
- **Method**: `GET`
- **Path**: `/projects/:projectId/reports/cost`
- **Auth**: Yes

**Response**
```json
{
  "code": 200,
  "message": "OK",
  "data": {
    "budget": 1000000000,
    "spent": 250000000
  }
}
```

### 11.3 Material report
- **Method**: `GET`
- **Path**: `/projects/:projectId/reports/material`
- **Auth**: Yes

**Response**
```json
{
  "code": 200,
  "message": "OK",
  "data": []
}
```

### 11.4 Attendance report
- **Method**: `GET`
- **Path**: `/projects/:projectId/reports/attendance`
- **Auth**: Yes

**Response**
```json
{
  "code": 200,
  "message": "OK",
  "data": []
}
```

### 11.5 Export report
- **Method**: `GET`
- **Path**: `/projects/:projectId/reports/export`
- **Auth**: Yes

**Response**
```json
{
  "code": 200,
  "message": "Export generated successfully",
  "data": {
    "url": "https://example.com/report.xlsx"
  }
}
```

### 11.6 Project insight
- **Method**: `GET`
- **Path**: `/projects/:projectId/insight`
- **Auth**: Yes

**Response**
```json
{
  "code": 200,
  "message": "OK",
  "data": {
    "riskScore": 72,
    "status": "warning"
  }
}
```

---

## Notes

1. The examples above are representative and may differ slightly from the actual controller response shape.
2. Some routes accept additional fields that are enforced by validation schemas; only the most common fields are shown here.
3. If you want, I can next convert this file into a full OpenAPI 3.0 specification with schemas and response codes.
