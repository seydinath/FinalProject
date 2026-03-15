# JobConnect API Documentation

## Base URL
```
http://localhost:5000
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Endpoints

### Authentication

#### Google OAuth Login
```http
POST /auth/google-login
```
**Body:**
```json
{
  "googleId": "string",
  "email": "string",
  "name": "string",
  "avatar": "string (optional)",
  "userType": "recruiter | job_seeker"
}
```
**Response:**
```json
{
  "token": "jwt_token",
  "user": {
    "id": "userId",
    "email": "user@example.com",
    "name": "John Doe",
    "userType": "recruiter"
  }
}
```

#### Get Current User
```http
GET /auth/me
```
**Headers:**
```
Authorization: Bearer <token>
```
**Response:**
```json
{
  "id": "userId",
  "email": "user@example.com",
  "name": "John Doe",
  "userType": "recruiter",
  "profile": {
    "headline": "...",
    "bio": "...",
    "location": "...",
    "skills": ["..."]
  }
}
```

#### Update Profile
```http
PATCH /auth/profile
```
**Headers:**
```
Authorization: Bearer <token>
```
**Body:**
```json
{
  "profile": {
    "headline": "string",
    "bio": "string",
    "phone": "string",
    "location": "string",
    "skills": ["string"]
  }
}
```

---

### Job Offers

#### Get All Job Offers
```http
GET /job-offers
```

**Query Parameters:**
- `status`: open, closed, filled
- `location`: search by location
- `skills`: comma-separated skills

**Response:**
```json
[
  {
    "_id": "offerId",
    "title": "Senior Developer",
    "description": "...",
    "recruiter": {
      "_id": "recruiterId",
      "name": "Company Name",
      "email": "recruiter@company.com"
    },
    "positionsAvailable": 3,
    "location": "Paris",
    "startDate": "2026-03-15T00:00:00Z",
    "endDate": "2026-03-20T00:00:00Z",
    "requiredSkills": ["React", "TypeScript"],
    "status": "open",
    "createdAt": "2026-03-07T10:00:00Z"
  }
]
```

#### Get Specific Job Offer
```http
GET /job-offers/:id
```

#### Create Job Offer
```http
POST /job-offers
```
**Headers:**
```
Authorization: Bearer <token>
```
**Body:**
```json
{
  "title": "Senior Developer",
  "description": "We're looking for...",
  "positionsAvailable": 3,
  "location": "Paris",
  "startDate": "2026-03-15",
  "endDate": "2026-03-20",
  "requiredSkills": ["React", "TypeScript"],
  "salaryRange": {
    "min": 3000,
    "max": 5000,
    "currency": "EUR"
  }
}
```

---

### Applications

#### Apply for Job
```http
POST /job-offers/:id/apply
```
**Headers:**
```
Authorization: Bearer <token>
```
**Body:**
```json
{
  "message": "I'm very interested in this position..."
}
```

#### Get Applications for Job
```http
GET /job-offers/:id/applications
```
**Headers:**
```
Authorization: Bearer <token>
```
**Note:** Only the recruiter who posted the job can view applications

#### Update Application Status
```http
PATCH /job-offers/:jobOfferId/applications/:appId
```
**Headers:**
```
Authorization: Bearer <token>
```
**Body:**
```json
{
  "status": "accepted | rejected | pending"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields"
}
```

### 401 Unauthorized
```json
{
  "error": "Access token required"
}
```

### 403 Forbidden
```json
{
  "error": "Invalid or expired token"
}
```

### 404 Not Found
```json
{
  "error": "Job offer not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting
Currently not implemented. Consider adding for production.

## Versioning
API v1.0 - No versioning in URL yet.

---

**Last Updated:** March 2026
