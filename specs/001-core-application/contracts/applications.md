# API Contracts: Job Applications

**Purpose**: Define job application CRUD endpoints
**Date**: 2026-08-31

All endpoints require authentication (valid session cookie). Requests automatically filtered to authenticated user's data only.

---

## List Applications

Fetch all job applications for the authenticated user.

### Endpoint

```
GET /api/applications?status=APPLIED&sort=appliedDate&order=desc&limit=50&offset=0
```

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | Enum | (none) | Filter by status: APPLIED, INTERVIEW, OFFER, REJECTED. Omit for all. |
| `sort` | String | appliedDate | Sort field: appliedDate, positionTitle, createdAt |
| `order` | String | desc | Sort order: asc, desc |
| `limit` | Integer | 50 | Results per page (max 100) |
| `offset` | Integer | 0 | Pagination offset |

### Response (Success 200)

```json
{
  "success": true,
  "applications": [
    {
      "id": "app_123",
      "positionTitle": "Senior Software Engineer",
      "status": "APPLIED",
      "appliedDate": "2026-08-20T00:00:00Z",
      "companyId": "company_456",
      "companyName": "Acme Inc",
      "notes": "Applied via career fair",
      "createdAt": "2026-08-20T10:15:00Z",
      "updatedAt": "2026-08-20T10:15:00Z"
    },
    {
      "id": "app_124",
      "positionTitle": "Frontend Developer",
      "status": "INTERVIEW",
      "appliedDate": "2026-08-18T00:00:00Z",
      "companyId": null,
      "companyName": null,
      "notes": null,
      "createdAt": "2026-08-18T09:00:00Z",
      "updatedAt": "2026-08-25T14:30:00Z"
    }
  ],
  "total": 15,
  "offset": 0,
  "limit": 50
}
```

### Response (Error 401)

```json
{
  "success": false,
  "error": "not_authenticated",
  "message": "Please log in to view applications."
}
```

---

## Get Application Detail

Fetch a single application with full details.

### Endpoint

```
GET /api/applications/{id}
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String | Application ID |

### Response (Success 200)

```json
{
  "success": true,
  "application": {
    "id": "app_123",
    "positionTitle": "Senior Software Engineer",
    "status": "INTERVIEW",
    "appliedDate": "2026-08-20T00:00:00Z",
    "companyId": "company_456",
    "company": {
      "id": "company_456",
      "name": "Acme Inc",
      "website": "https://acme.com",
      "location": "San Francisco, CA",
      "notes": "Great company culture"
    },
    "notes": "Applied via career fair. Phone screen scheduled for 9/5.",
    "createdAt": "2026-08-20T10:15:00Z",
    "updatedAt": "2026-08-25T14:30:00Z"
  }
}
```

### Response (Error 404)

```json
{
  "success": false,
  "error": "not_found",
  "message": "Application not found."
}
```

---

## Create Application

Create a new job application.

### Endpoint

```
POST /api/applications
```

### Request Body

```json
{
  "positionTitle": "Senior Software Engineer",
  "status": "APPLIED",
  "appliedDate": "2026-08-20",
  "companyId": "company_456",
  "notes": "Applied via career fair"
}
```

### Request Validation

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `positionTitle` | String | Yes | 1-200 chars |
| `status` | Enum | No | APPLIED \| INTERVIEW \| OFFER \| REJECTED (default: APPLIED) |
| `appliedDate` | Date | Yes | Valid date, not in future (YYYY-MM-DD format) |
| `companyId` | String | No | Must be user's own company (verified on server) |
| `notes` | String | No | Max 1000 chars |

### Response (Success 201)

```json
{
  "success": true,
  "application": {
    "id": "app_125",
    "positionTitle": "Senior Software Engineer",
    "status": "APPLIED",
    "appliedDate": "2026-08-20T00:00:00Z",
    "companyId": "company_456",
    "notes": "Applied via career fair",
    "createdAt": "2026-08-31T12:00:00Z",
    "updatedAt": "2026-08-31T12:00:00Z"
  },
  "message": "Application created successfully."
}
```

### Response (Error 400)

```json
{
  "success": false,
  "error": "validation_error",
  "message": "Position title is required and must be 1-200 characters."
}
```

### Response (Error 400 - Invalid Company)

```json
{
  "success": false,
  "error": "invalid_company",
  "message": "Company not found or does not belong to you."
}
```

---

## Update Application

Update an existing application.

### Endpoint

```
PUT /api/applications/{id}
```

### Request Body

```json
{
  "positionTitle": "Senior Software Engineer",
  "status": "INTERVIEW",
  "appliedDate": "2026-08-20",
  "companyId": "company_456",
  "notes": "Phone screen completed. Next: on-site interview 9/15"
}
```

### Request Validation

Same as Create, but all fields optional. Omitted fields remain unchanged.

### Response (Success 200)

```json
{
  "success": true,
  "application": {
    "id": "app_125",
    "positionTitle": "Senior Software Engineer",
    "status": "INTERVIEW",
    "appliedDate": "2026-08-20T00:00:00Z",
    "companyId": "company_456",
    "notes": "Phone screen completed. Next: on-site interview 9/15",
    "createdAt": "2026-08-31T12:00:00Z",
    "updatedAt": "2026-08-31T13:45:00Z"
  },
  "message": "Application updated successfully."
}
```

### Response (Error 404)

```json
{
  "success": false,
  "error": "not_found",
  "message": "Application not found."
}
```

---

## Delete Application

Delete a job application.

### Endpoint

```
DELETE /api/applications/{id}
```

### Response (Success 200)

```json
{
  "success": true,
  "message": "Application deleted successfully."
}
```

### Response (Error 404)

```json
{
  "success": false,
  "error": "not_found",
  "message": "Application not found."
}
```

---

## Get Dashboard Counts

Get application counts grouped by status for dashboard display.

### Endpoint

```
GET /api/applications/dashboard/stats
```

### Response (Success 200)

```json
{
  "success": true,
  "stats": {
    "total": 15,
    "applied": 8,
    "interview": 5,
    "offer": 1,
    "rejected": 1
  },
  "lastUpdated": "2026-08-31T14:20:00Z"
}
```

**Note**: This endpoint is optimized for dashboard calculations. Response time target: < 500ms (SC-034).

---

## Common Patterns

### Authorization Check

Every endpoint verifies:
1. User is authenticated (session exists)
2. Resource belongs to user (applicationId owned by current user)
3. Return 404 if not found (not 403, to avoid revealing existence)

### Timestamps

- Dates in request: ISO 8601 format (YYYY-MM-DD)
- Timestamps in response: ISO 8601 with timezone (YYYY-MM-DDTHH:MM:SSZ)
- All times stored in UTC; timezone conversion client-side

### Errors

All errors follow pattern:
```json
{
  "success": false,
  "error": "error_code",
  "message": "Human-readable message"
}
```

