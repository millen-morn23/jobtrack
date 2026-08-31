# API Contracts: Authentication

**Purpose**: Define authentication API endpoints and request/response schemas
**Date**: 2026-08-31

## Overview

Authentication endpoints handle user registration, login, logout, and profile management. All endpoints use HTTP-only cookies for session management. Passwords are never exposed in requests or responses.

---

## Register User

Create a new user account.

### Endpoint

```
POST /api/auth/register
```

### Request Body

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Request Validation

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `email` | String | Required, valid email format, unique | Case-insensitive; normalized to lowercase |
| `password` | String | Required, min 8 characters | Plaintext in request, hashed on server |
| `firstName` | String | Optional, max 100 chars | Can be empty string |
| `lastName` | String | Optional, max 100 chars | Can be empty string |

### Response (Success 201)

```json
{
  "success": true,
  "userId": "clk7m3z9z0000qz8z0000qz8z",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "message": "Account created successfully. You are now logged in."
}
```

### Response (Error 400)

```json
{
  "success": false,
  "error": "email_already_exists",
  "message": "An account with this email already exists."
}
```

**Other possible errors**:
- `invalid_email`: Email format invalid
- `password_too_short`: Password less than 8 characters
- `missing_required_field`: Email or password missing

### Side Effects

1. User record created in database with bcrypt-hashed password
2. Session cookie set automatically (user is logged in)
3. HTTP-only, Secure, SameSite=Strict cookie flags applied

### Security

- Passwords hashed with bcrypt (salt rounds: 10)
- No plaintext passwords logged or stored
- Email validated before checking uniqueness
- Rate limiting recommended: max 5 registration attempts per IP per hour

---

## Login User

Authenticate user with email and password.

### Endpoint

```
POST /api/auth/login
```

### Request Body

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### Request Validation

| Field | Type | Constraints |
|-------|------|-------------|
| `email` | String | Required, valid email format |
| `password` | String | Required |

### Response (Success 200)

```json
{
  "success": true,
  "userId": "clk7m3z9z0000qz8z0000qz8z",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "message": "Login successful."
}
```

### Response (Error 401)

```json
{
  "success": false,
  "error": "invalid_credentials",
  "message": "Email or password is incorrect."
}
```

### Side Effects

1. Session cookie set in response (HTTP-only, Secure, SameSite=Strict)
2. User is now authenticated for subsequent requests
3. Failed login attempts should be logged (for security monitoring)

### Security

- Timing attack mitigation: Compare hashes consistently (bcrypt does this)
- Generic error message ("Email or password is incorrect") prevents user enumeration
- Rate limiting recommended: max 5 login attempts per email per minute
- No password confirmation sent in response

---

## Logout User

Clear session and log out authenticated user.

### Endpoint

```
POST /api/auth/logout
```

### Authentication

Requires valid session cookie (middleware verifies).

### Request Body

None (empty body or no body).

### Response (Success 200)

```json
{
  "success": true,
  "message": "Logged out successfully."
}
```

### Response (Error 401)

```json
{
  "success": false,
  "error": "not_authenticated",
  "message": "No active session found."
}
```

### Side Effects

1. Session cookie cleared/deleted
2. User cannot access protected routes without re-authenticating

---

## Get Current User Profile

Fetch the authenticated user's profile information.

### Endpoint

```
GET /api/auth/profile
```

### Authentication

Requires valid session cookie.

### Response (Success 200)

```json
{
  "success": true,
  "user": {
    "id": "clk7m3z9z0000qz8z0000qz8z",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2026-08-31T10:30:00Z",
    "updatedAt": "2026-08-31T10:30:00Z"
  }
}
```

### Response (Error 401)

```json
{
  "success": false,
  "error": "not_authenticated",
  "message": "No active session. Please log in."
}
```

---

## Update User Profile

Update the authenticated user's profile information (firstName, lastName).

### Endpoint

```
PUT /api/auth/profile
```

### Authentication

Requires valid session cookie.

### Request Body

```json
{
  "firstName": "Jane",
  "lastName": "Smith"
}
```

### Request Validation

| Field | Type | Constraints |
|-------|------|-------------|
| `firstName` | String | Optional, max 100 chars |
| `lastName` | String | Optional, max 100 chars |

### Response (Success 200)

```json
{
  "success": true,
  "user": {
    "id": "clk7m3z9z0000qz8z0000qz8z",
    "email": "user@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "createdAt": "2026-08-31T10:30:00Z",
    "updatedAt": "2026-08-31T11:45:00Z"
  },
  "message": "Profile updated successfully."
}
```

### Response (Error 400)

```json
{
  "success": false,
  "error": "invalid_input",
  "message": "First name must be 100 characters or less."
}
```

### Response (Error 401)

```json
{
  "success": false,
  "error": "not_authenticated",
  "message": "No active session. Please log in."
}
```

---

## Change Password

Change the authenticated user's password.

### Endpoint

```
POST /api/auth/change-password
```

### Authentication

Requires valid session cookie.

### Request Body

```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456"
}
```

### Request Validation

| Field | Type | Constraints |
|-------|------|-------------|
| `currentPassword` | String | Required; must match existing password |
| `newPassword` | String | Required, min 8 characters, must differ from currentPassword |

### Response (Success 200)

```json
{
  "success": true,
  "message": "Password changed successfully. Please log in again.",
  "redirectTo": "/login"
}
```

### Response (Error 401)

```json
{
  "success": false,
  "error": "invalid_current_password",
  "message": "Current password is incorrect."
}
```

### Response (Error 400)

```json
{
  "success": false,
  "error": "invalid_new_password",
  "message": "New password must be at least 8 characters and different from current password."
}
```

### Side Effects

1. Password updated in database (newly hashed)
2. Existing session remains active (no forced logout)
3. User can continue using the application

### Security

- Current password must be verified before accepting new password
- New password cannot be same as current password (common mistake prevention)
- Password change should trigger audit log (security monitoring)
- Consider sending email confirmation (future enhancement)

---

## Common Response Patterns

### Success Response

```json
{
  "success": true,
  "data": { },
  "message": "Optional success message"
}
```

### Error Response

```json
{
  "success": false,
  "error": "error_code_snake_case",
  "message": "Human-readable error message"
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `invalid_credentials` | 401 | Email or password incorrect |
| `not_authenticated` | 401 | No active session |
| `email_already_exists` | 400 | Email already registered |
| `invalid_email` | 400 | Email format invalid |
| `password_too_short` | 400 | Password less than 8 characters |
| `missing_required_field` | 400 | Required field missing |
| `invalid_input` | 400 | Input validation failed |

---

## Session & Cookie Management

### Session Cookie

- **Name**: `session`
- **HttpOnly**: true (not accessible to JavaScript)
- **Secure**: true (only sent over HTTPS)
- **SameSite**: Strict (CSRF protection)
- **Max-Age**: 30 days (persistent session)
- **Path**: / (entire application)

### Session Validation

Every protected route verifies session:
1. Extract session cookie from request
2. Lookup session in database/store
3. Verify user ID matches request context
4. Allow request if valid; reject with 401 if invalid

### Session Termination

Sessions end when:
- User explicitly logs out
- Session expires (30 days)
- User password changed (optional: force re-login)
- Session explicitly invalidated (admin action, future feature)

