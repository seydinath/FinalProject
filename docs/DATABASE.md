# JobConnect - Database Design

## Overview
JobConnect uses MongoDB as the primary database. All models are defined using Mongoose ODM.

## Collections

### 1. Users Collection

**Purpose:** Store user profiles for both recruiters and job seekers

**Schema:**
```javascript
{
  _id: ObjectId,
  googleId: String (unique, sparse),
  email: String (unique, required, lowercase),
  name: String (required),
  avatar: String,
  userType: String (enum: ['recruiter', 'job_seeker'], required),
  profile: {
    headline: String,
    bio: String,
    phone: String,
    location: String,
    skills: [String]
  },
  isVerified: Boolean (default: false),
  createdAt: Date (default: now),
  updatedAt: Date (default: now)
}
```

**Indexes:**
- `googleId` (unique, sparse)
- `email` (unique)
- `userType`

**Usage:**
- Store recruiter and job seeker information
- Track user verification status
- Maintain user profile data

---

### 2. JobOffers Collection

**Purpose:** Store job postings created by recruiters

**Schema:**
```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String (required),
  recruiter: ObjectId (ref: User, required),
  positionsAvailable: Number (required, min: 1),
  location: String,
  startDate: Date,
  endDate: Date,
  requiredSkills: [String],
  salaryRange: {
    min: Number,
    max: Number,
    currency: String
  },
  status: String (enum: ['open', 'closed', 'filled'], default: 'open'),
  applications: [ObjectId] (ref: Application),
  createdAt: Date (default: now),
  updatedAt: Date (default: now)
}
```

**Indexes:**
- `recruiter`
- `status`
- `location`
- `createdAt` (descending)

**Usage:**
- Store job posting information
- Track application count
- Filter jobs by status, location, skills

---

### 3. Applications Collection

**Purpose:** Store job applications from candidates

**Schema:**
```javascript
{
  _id: ObjectId,
  jobOffer: ObjectId (ref: JobOffer, required),
  candidate: ObjectId (ref: User, required),
  status: String (enum: ['pending', 'accepted', 'rejected', 'withdrawn'], default: 'pending'),
  message: String,
  appliedAt: Date (default: now),
  reviewedAt: Date,
  reviewedBy: ObjectId (ref: User),
  createdAt: Date (default: now),
  updatedAt: Date (default: now)
}
```

**Unique Constraint:**
- Compound index on `jobOffer` + `candidate` (prevent duplicate applications)

**Indexes:**
- `jobOffer`
- `candidate`
- `status`
- `appliedAt` (descending)

**Usage:**
- Track candidate applications
- Manage application review process
- Prevent duplicate applications

---

## Relationships

```
User (Recruiter)
  ├── 1:N → JobOffers (created by)
  └── Recruiter reviews → Applications

User (Candidate)
  └── N:M → JobOffers (through Applications)

JobOffer
  ├── N:1 → User (recruiter)
  └── 1:N → Applications

Application
  ├── N:1 → JobOffer
  └── N:1 → User (candidate)
  └── N:1 → User (reviewer/recruiter)
```

---

## Queries

### Common Queries

**Find all open jobs:**
```javascript
JobOffer.find({ status: 'open' })
```

**Find jobs by location and skills:**
```javascript
JobOffer.find({
  location: { $regex: 'Paris', $options: 'i' },
  requiredSkills: { $in: ['React', 'TypeScript'] }
})
```

**Get applications for a job:**
```javascript
Application.find({ jobOffer: jobOfferId })
  .populate('candidate', 'name email profile')
  .sort({ appliedAt: -1 })
```

**Get recruiter's jobs:**
```javascript
JobOffer.find({ recruiter: recruiterId })
```

**Get candidate's applications:**
```javascript
Application.find({ candidate: candidateId })
  .populate('jobOffer')
  .sort({ appliedAt: -1 })
```

---

## Scalability Considerations

### Current Limitations
- No pagination implemented yet
- No caching layer
- No search optimization

### Recommendations for Production
1. **Add pagination** to all list endpoints
2. **Implement full-text search** for job descriptions
3. **Add Redis caching** for:
   - Popular job listings
   - User profiles
   - Application status
4. **Database partitioning** if data grows > 1GB
5. **Backup strategy:**
   - Daily backups to cloud storage
   - Point-in-time recovery setup

### Performance Optimizations
- Use MongoDB Atlas with automatic sharding
- Implement connection pooling
- Add query performance monitoring
- Use aggregation pipelines for complex queries

---

## Data Integrity

### Validation Rules
- Email must be unique and valid
- Position count must be > 0
- Application cannot be created for same job twice
- Only recruiter can review their job applications

### Cascading Operations
- When user is deleted: don't delete applications (keep history)
- When job is deleted: mark applications as withdrawn
- When application is deleted: remove from job's applications array

---

## Migration Strategy

### Initial Setup
1. Create MongoDB database
2. Create collections with indexes
3. Seed initial data if needed

### Version 1.1 Changes
- Add notification history collection
- Add user preferences collection

### Version 2.0 Changes
- Add messaging/chat collection
- Add rating/reviews collection

---

**Last Updated:** March 2026
