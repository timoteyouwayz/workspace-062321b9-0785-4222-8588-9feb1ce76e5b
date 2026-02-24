# API Documentation

This document describes all available API endpoints in the Requisition Management System.

## Base URL

```
https://yourdomain.com/api
```

## Authentication

Most endpoints require authentication via session cookies. First, you must login to get a session.

### Login

**Endpoint:** `POST /auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "userpassword"
}
```

**Response:**
```json
{
  "user": {
    "id": "user-id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "STAFF",
    "department": "Finance"
  }
}
```

### Logout

**Endpoint:** `POST /auth/logout`

**Response:**
```json
{
  "success": true
}
```

---

## User Management

### Get Current User

**Endpoint:** `GET /auth/me`

**Response:**
```json
{
  "user": {
    "id": "user-id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "STAFF"
  }
}
```

### Admin: Get All Users

**Endpoint:** `GET /admin/users`

**Required Role:** ADMIN

**Response:**
```json
{
  "users": [
    {
      "id": "user-id",
      "name": "User Name",
      "email": "user@example.com",
      "role": "STAFF",
      "department": "Finance",
      "phone": "+1234567890",
      "createdAt": "2024-02-23T10:00:00Z"
    }
  ]
}
```

### Admin: Create User

**Endpoint:** `POST /admin/users`

**Required Role:** ADMIN

**Request:**
```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "temppassword123",
  "role": "STAFF",
  "department": "Finance",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "user": {
    "id": "new-user-id",
    "name": "New User",
    "email": "newuser@example.com",
    "role": "STAFF"
  }
}
```

### Admin: Update User

**Endpoint:** `PUT /admin/users`

**Required Role:** ADMIN

**Request:**
```json
{
  "id": "user-id",
  "name": "Updated Name",
  "email": "newemail@example.com",
  "role": "ACCOUNTANT",
  "department": "Accounting",
  "phone": "+9876543210",
  "password": "newpassword123"
}
```

**Response:**
```json
{
  "user": {
    "id": "user-id",
    "name": "Updated Name",
    "email": "newemail@example.com",
    "role": "ACCOUNTANT"
  }
}
```

### Admin: Patch User (Partial Update)

**Endpoint:** `PATCH /admin/users`

**Required Role:** ADMIN

**Request:** (Only include fields to update)
```json
{
  "id": "user-id",
  "role": "DIRECTOR"
}
```

### Admin: Delete User

**Endpoint:** `DELETE /admin/users?id=user-id`

**Required Role:** ADMIN

**Response:**
```json
{
  "success": true
}
```

---

## Requisitions

### Create Requisition

**Endpoint:** `POST /requisitions/new`

**Required:** Authentication

**Request:**
```json
{
  "reason": "transport",
  "description": "Travel to field office",
  "eventDate": "2024-03-15T00:00:00Z",
  "dateNeeded": "2024-03-10T00:00:00Z",
  "participants": "5",
  "transportDistance": "50",
  "transportQuantity": "1",
  "expenseItems": [
    {"item": "Fuel", "amount": 5000},
    {"item": "Tolls", "amount": 2000}
  ],
  "totalAmount": 7000,
  "accountToCharge": "ACC-001"
}
```

**Response:**
```json
{
  "requisition": {
    "id": "req-id",
    "userId": "user-id",
    "reason": "transport",
    "description": "Travel to field office",
    "totalAmount": 7000,
    "status": "PENDING",
    "createdAt": "2024-02-23T10:00:00Z"
  }
}
```

### Get Requisition

**Endpoint:** `GET /requisitions?id=req-id`

**Response:**
```json
{
  "requisition": {
    "id": "req-id",
    "userId": "user-id",
    "user": {
      "name": "User Name",
      "email": "user@example.com",
      "department": "Finance"
    },
    "reason": "transport",
    "description": "Travel details",
    "totalAmount": 7000,
    "status": "PENDING",
    "expenseItems": [
      {"item": "Fuel", "amount": 5000}
    ],
    "createdAt": "2024-02-23T10:00:00Z"
  }
}
```

### Check Requisition (Accountant)

**Endpoint:** `POST /requisitions/approve`

**Required Role:** ACCOUNTANT or ADMIN

**Request:**
```json
{
  "requisitionId": "req-id",
  "action": "CHECK"
}
```

**Response:**
```json
{
  "requisition": {
    "id": "req-id",
    "status": "CHECKED",
    "checkedById": "accountant-id",
    "checkedAt": "2024-02-23T11:00:00Z"
  }
}
```

### Approve Requisition (Director)

**Endpoint:** `POST /requisitions/approve`

**Required Role:** DIRECTOR or ADMIN

**Request:**
```json
{
  "requisitionId": "req-id",
  "action": "APPROVE"
}
```

**Response:**
```json
{
  "requisition": {
    "id": "req-id",
    "status": "APPROVED",
    "approvedById": "director-id",
    "approvedAt": "2024-02-23T12:00:00Z"
  }
}
```

### Disburse Requisition (Accountant)

**Endpoint:** `POST /requisitions/approve`

**Required Role:** ACCOUNTANT or ADMIN

**Request:**
```json
{
  "requisitionId": "req-id",
  "action": "DISBURSE"
}
```

**Response:**
```json
{
  "requisition": {
    "id": "req-id",
    "status": "DISBURSED",
    "disbursedAt": "2024-02-23T13:00:00Z"
  }
}
```

### Reject Requisition

**Endpoint:** `POST /requisitions/approve`

**Required Role:** ACCOUNTANT (for PENDING), DIRECTOR (for CHECKED), or ADMIN

**Request:**
```json
{
  "requisitionId": "req-id",
  "action": "REJECT",
  "rejectionReason": "Insufficient information provided"
}
```

**Response:**
```json
{
  "requisition": {
    "id": "req-id",
    "status": "REJECTED",
    "rejectionReason": "Insufficient information provided"
  }
}
```

---

## Receipts

### Upload Receipt

**Endpoint:** `POST /requisitions/receipts`

**Required:** Authentication

**Content-Type:** `multipart/form-data`

**Request Parameters:**
```
requisitionId: req-id  (required)
file: <binary file data>  (required)
amount: 5000  (optional, receipt amount)
description: Fuel receipt  (optional)
```

**Response:**
```json
{
  "receipt": {
    "id": "receipt-id",
    "requisitionId": "req-id",
    "fileName": "receipt.pdf",
    "amount": 5000,
    "verified": false,
    "driveFileId": "google-drive-id",
    "driveLink": "https://drive.google.com/file/d/..."
  },
  "remainingBalance": 2000,
  "message": "Receipt uploaded. Remaining balance: KES 2000"
}
```

### Get Receipts

**Endpoint:** `GET /requisitions/receipts?requisitionId=req-id`

**Response:**
```json
{
  "receipts": [
    {
      "id": "receipt-id",
      "fileName": "receipt.pdf",
      "amount": 5000,
      "verified": false,
      "uploadedAt": "2024-02-23T14:00:00Z"
    }
  ]
}
```

### Verify Receipt

**Endpoint:** `PUT /requisitions/receipts`

**Required Role:** ACCOUNTANT or ADMIN

**Request:**
```json
{
  "receiptId": "receipt-id",
  "verified": true,
  "amount": 4999.99
}
```

**Response:**
```json
{
  "receipt": {
    "id": "receipt-id",
    "verified": true,
    "verifiedAt": "2024-02-23T15:00:00Z"
  },
  "totalReceived": 7000,
  "requisitionCompleted": true
}
```

---

## Password Management

### Forgot Password

**Endpoint:** `POST /auth/forgot-password`

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If an account exists with this email, you will receive reset instructions."
}
```

### Verify Reset Token

**Endpoint:** `GET /auth/forgot-password?token=reset-token`

**Response:**
```json
{
  "valid": true,
  "email": "user@example.com"
}
```

### Reset Password

**Endpoint:** `POST /auth/reset-password`

**Request:**
```json
{
  "token": "reset-token",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password updated successfully!"
}
```

---

## Google OAuth

### Initiate Google Login

**Endpoint:** `GET /auth/google`

Redirects to Google login. After user approves, they're redirected to callback.

### Google Callback

**Endpoint:** `GET /auth/google/callback?code=...`

Automatically handles OAuth flow and creates/updates user session.

---

## Error Responses

All failed requests return appropriate HTTP status codes with error details:

### 400 Bad Request
```json
{
  "error": "Missing required fields"
}
```

### 401 Unauthorized
```json
{
  "error": "Please log in first"
}
```

### 403 Forbidden
```json
{
  "error": "You don't have permission to perform this action"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Something went wrong"
}
```

---

## Role-Based Access

### Roles

- **ADMIN:** Full access to all features
- **DIRECTOR:** Can approve checked requisitions
- **ACCOUNTANT:** Can check and disburse requisitions, verify receipts
- **STAFF:** Can create requisitions and upload receipts

### Requisition Workflow

1. **STAFF** creates requisition → Status: PENDING
2. **ACCOUNTANT** checks requisition → Status: CHECKED
3. **DIRECTOR** approves requisition → Status: APPROVED
4. **ACCOUNTANT** disburses funds → Status: DISBURSED
5. **STAFF** uploads receipt → Sent to Google Drive
6. **ACCOUNTANT** verifies receipt → Status: COMPLETED (when all receipts verified)

---

## Rate Limiting

Currently, there is no built-in rate limiting. For production, implement:
- API key system
- Request throttling per user
- IP-based rate limits

---

## Webhooks & Integrations

### Google Sheets Sync

When a requisition is created or updated, it's automatically synced to the configured Google Sheet:
- New requisitions append a row
- Status updates modify existing rows
- Requires `GOOGLE_SHEETS_ID` in environment

### Google Drive Upload

Receipts are automatically uploaded to Google Drive:
- Stores in folder specified by `GOOGLE_DRIVE_FOLDER_ID`
- Requires service account credentials
- File link is stored in receipt record

### Email Notifications

Emails are sent for:
- Password reset requests
- Receipt verification updates
- New requisitions (to admin)

Requires proper SMTP configuration in `.env`

---

## Example Workflows

### Complete Requisition Creation to Completion

```bash
# 1. Login
curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"staff@example.com","password":"password"}'

# 2. Create requisition
curl -X POST https://yourdomain.com/api/requisitions/new \
  -H "Content-Type: application/json" \
  -d '{...requisition data...}'

# 3. [Accountant] Check requisition
curl -X POST https://yourdomain.com/api/requisitions/approve \
  -H "Content-Type: application/json" \
  -d '{"requisitionId":"...", "action":"CHECK"}'

# 4. [Director] Approve requisition
curl -X POST https://yourdomain.com/api/requisitions/approve \
  -H "Content-Type: application/json" \
  -d '{"requisitionId":"...", "action":"APPROVE"}'

# 5. [Accountant] Disburse funds
curl -X POST https://yourdomain.com/api/requisitions/approve \
  -H "Content-Type: application/json" \
  -d '{"requisitionId":"...", "action":"DISBURSE"}'

# 6. Upload receipt
curl -X POST https://yourdomain.com/api/requisitions/receipts \
  -F "requisitionId=..." \
  -F "file=@receipt.pdf" \
  -F "amount=7000"

# 7. [Accountant] Verify receipt
curl -X PUT https://yourdomain.com/api/requisitions/receipts \
  -H "Content-Type: application/json" \
  -d '{"receiptId":"...", "verified":true}'
```

---

## Testing

Use tools like:
- **Postman** - GUI for API testing
- **curl** - Command-line requests
- **Insomnia** - REST client
- **httpie** - User-friendly HTTP client

Example with httpie:
```bash
http POST yourdomain.com/api/auth/login \
  email=user@example.com \
  password=password
```

---

For more information, see the main README.md and DEPLOYMENT.md files.
