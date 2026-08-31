# API Contracts: Companies & Contacts

**Purpose**: Define company and contact management endpoints
**Date**: 2026-08-31

All endpoints require authentication. User data isolation enforced at API layer.

---

## COMPANIES

### List Companies

```
GET /api/companies?limit=50&offset=0&sort=name&order=asc
```

Returns paginated list of user's companies.

**Response (200)**:
```json
{
  "success": true,
  "companies": [
    {
      "id": "company_456",
      "name": "Acme Inc",
      "website": "https://acme.com",
      "location": "San Francisco, CA",
      "notes": "Great company culture, strong engineering team",
      "contactCount": 2,
      "applicationCount": 3,
      "createdAt": "2026-08-15T10:00:00Z",
      "updatedAt": "2026-08-20T14:30:00Z"
    }
  ],
  "total": 8,
  "offset": 0,
  "limit": 50
}
```

---

### Get Company Detail

```
GET /api/companies/{id}
```

Returns company with associated contacts and applications.

**Response (200)**:
```json
{
  "success": true,
  "company": {
    "id": "company_456",
    "name": "Acme Inc",
    "website": "https://acme.com",
    "location": "San Francisco, CA",
    "notes": "Great company culture",
    "contacts": [
      {
        "id": "contact_789",
        "firstName": "Jane",
        "lastName": "Smith",
        "jobTitle": "Hiring Manager",
        "email": "jane@acme.com",
        "phone": "+1-555-0123"
      },
      {
        "id": "contact_790",
        "firstName": "Bob",
        "lastName": "Johnson",
        "jobTitle": "Engineering Lead",
        "email": "bob@acme.com",
        "phone": null
      }
    ],
    "applications": [
      {
        "id": "app_123",
        "positionTitle": "Senior Engineer",
        "status": "INTERVIEW",
        "appliedDate": "2026-08-20T00:00:00Z"
      }
    ],
    "createdAt": "2026-08-15T10:00:00Z",
    "updatedAt": "2026-08-20T14:30:00Z"
  }
}
```

---

### Create Company

```
POST /api/companies
```

**Request**:
```json
{
  "name": "Acme Inc",
  "website": "https://acme.com",
  "location": "San Francisco, CA",
  "notes": "Great company culture"
}
```

**Validation**:
- `name`: Required, 1-200 chars, unique per user
- `website`: Optional, valid URL format
- `location`: Optional, max 200 chars
- `notes`: Optional, max 2000 chars

**Response (201)**:
```json
{
  "success": true,
  "company": {
    "id": "company_456",
    "name": "Acme Inc",
    "website": "https://acme.com",
    "location": "San Francisco, CA",
    "notes": "Great company culture",
    "createdAt": "2026-08-31T12:00:00Z",
    "updatedAt": "2026-08-31T12:00:00Z"
  },
  "message": "Company created successfully."
}
```

**Error (400 - Duplicate)**:
```json
{
  "success": false,
  "error": "company_already_exists",
  "message": "You already have a company with this name."
}
```

---

### Update Company

```
PUT /api/companies/{id}
```

Same validation as Create. All fields optional.

**Response (200)**: Updated company object.

---

### Delete Company

```
DELETE /api/companies/{id}
```

Cascades to:
- All contacts for this company are deleted
- All applications linked to this company have companyId set to null

**Response (200)**:
```json
{
  "success": true,
  "message": "Company deleted successfully."
}
```

---

## CONTACTS

### List Contacts

```
GET /api/contacts?companyId=company_456&limit=50&offset=0
```

**Query Parameters**:
- `companyId`: Optional, filter by company

**Response (200)**:
```json
{
  "success": true,
  "contacts": [
    {
      "id": "contact_789",
      "firstName": "Jane",
      "lastName": "Smith",
      "jobTitle": "Hiring Manager",
      "email": "jane@acme.com",
      "phone": "+1-555-0123",
      "companyId": "company_456",
      "companyName": "Acme Inc",
      "notes": "Very responsive, friendly interviewer",
      "createdAt": "2026-08-15T10:00:00Z",
      "updatedAt": "2026-08-20T14:30:00Z"
    }
  ],
  "total": 12,
  "offset": 0,
  "limit": 50
}
```

---

### Get Contact Detail

```
GET /api/contacts/{id}
```

**Response (200)**:
```json
{
  "success": true,
  "contact": {
    "id": "contact_789",
    "firstName": "Jane",
    "lastName": "Smith",
    "jobTitle": "Hiring Manager",
    "email": "jane@acme.com",
    "phone": "+1-555-0123",
    "companyId": "company_456",
    "company": {
      "id": "company_456",
      "name": "Acme Inc"
    },
    "notes": "Very responsive",
    "createdAt": "2026-08-15T10:00:00Z",
    "updatedAt": "2026-08-20T14:30:00Z"
  }
}
```

---

### Create Contact

```
POST /api/contacts
```

**Request**:
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "jobTitle": "Hiring Manager",
  "companyId": "company_456",
  "email": "jane@acme.com",
  "phone": "+1-555-0123",
  "notes": "Very responsive"
}
```

**Validation**:
- `firstName`: Required, 1-100 chars
- `lastName`: Required, 1-100 chars
- `jobTitle`: Required, 1-200 chars
- `companyId`: Required, must belong to user
- `email`: Optional, valid email format
- `phone`: Optional, max 20 chars
- `notes`: Optional, max 1000 chars

**Response (201)**:
```json
{
  "success": true,
  "contact": {
    "id": "contact_789",
    "firstName": "Jane",
    "lastName": "Smith",
    "jobTitle": "Hiring Manager",
    "companyId": "company_456",
    "email": "jane@acme.com",
    "phone": "+1-555-0123",
    "notes": "Very responsive",
    "createdAt": "2026-08-31T12:00:00Z",
    "updatedAt": "2026-08-31T12:00:00Z"
  },
  "message": "Contact created successfully."
}
```

**Error (400 - Invalid Company)**:
```json
{
  "success": false,
  "error": "invalid_company",
  "message": "Company not found or does not belong to you."
}
```

---

### Update Contact

```
PUT /api/contacts/{id}
```

All fields optional. Cannot change company association (delete and recreate if needed).

**Response (200)**: Updated contact object.

---

### Delete Contact

```
DELETE /api/contacts/{id}
```

Does not affect company or applications (only removes the contact record).

**Response (200)**:
```json
{
  "success": true,
  "message": "Contact deleted successfully."
}
```

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `not_found` | 404 | Resource not found |
| `not_authenticated` | 401 | No active session |
| `validation_error` | 400 | Input validation failed |
| `company_already_exists` | 400 | Company name duplicate for user |
| `invalid_company` | 400 | Company ID invalid or doesn't belong to user |
| `invalid_email` | 400 | Email format invalid |
| `invalid_url` | 400 | Website URL format invalid |

