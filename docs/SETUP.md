# JobConnect - Architecture & Installation

## 🏗️ Project Structure

```
JobConnect/
├── frontend/                    # React + TypeScript Frontend
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   │   ├── Header.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── FeaturesSection.tsx
│   │   │   └── LiquidMetalBackground.tsx
│   │   ├── pages/             # Page components
│   │   │   └── LandingPage.tsx
│   │   ├── utils/             # Utility functions
│   │   │   └── ThemeContext.tsx
│   │   ├── styles/            # Global styles
│   │   │   └── index.css
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/                # Static assets
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .env.example
│
├── backend/                    # Node.js/Express Backend
│   ├── src/
│   │   ├── routes/            # API routes
│   │   │   ├── auth.ts
│   │   │   └── jobOffers.ts
│   │   ├── controllers/       # Controllers (future)
│   │   ├── models/            # MongoDB models
│   │   │   ├── User.ts
│   │   │   ├── JobOffer.ts
│   │   │   └── Application.ts
│   │   ├── middleware/        # Custom middleware
│   │   │   └── auth.ts
│   │   ├── config/           # Configuration
│   │   │   ├── env.ts
│   │   │   └── database.ts
│   │   └── server.ts         # Main server file
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── docs/                      # Documentation
│   ├── API.md
│   ├── DATABASE.md
│   └── SETUP.md
│
└── docs/
   └── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Git

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```
   
   Configure your environment variables:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/jobconnect
   JWT_SECRET=your_jwt_secret_key_here
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   ```

4. **Start the server:**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```
   
   Configure your environment variables:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
   ```

4. **Start the dev server:**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## 🎨 Features Implemented

### Frontend
- **Premium Landing Page** with modern design
- **Dark Mode** with smooth transitions
- **Liquid Metal Effects** using Three.js
- **Responsive Design** for all devices
- **Google OAuth Ready** authentication flow

### Backend
- **RESTful API** with Express.js
- **MongoDB Models** for Users, Job Offers, Applications
- **JWT Authentication** middleware
- **CORS** enabled
- **Error Handling** with proper status codes

## 🔗 API Endpoints

### Authentication
- `POST /auth/google-login` - Login with Google OAuth
- `GET /auth/me` - Get current user
- `PATCH /auth/profile` - Update user profile

### Job Offers
- `GET /job-offers` - Get all job offers (with filters)
- `GET /job-offers/:id` - Get specific job offer
- `POST /job-offers` - Create new job offer (auth required)
- `POST /job-offers/:id/apply` - Apply for a job (auth required)
- `GET /job-offers/:id/applications` - Get applications (auth required)
- `PATCH /job-offers/:jobOfferId/applications/:appId` - Update application status (auth required)

## 📊 Database Schema

### User
```json
{
  "_id": ObjectId,
  "googleId": String,
  "email": String,
  "name": String,
  "avatar": String,
  "userType": "recruiter" | "job_seeker",
  "profile": {
    "headline": String,
    "bio": String,
    "phone": String,
    "location": String,
    "skills": [String]
  },
  "isVerified": Boolean,
  "createdAt": Date,
  "updatedAt": Date
}
```

### JobOffer
```json
{
  "_id": ObjectId,
  "title": String,
  "description": String,
  "recruiter": ObjectId,
  "positionsAvailable": Number,
  "location": String,
  "startDate": Date,
  "endDate": Date,
  "requiredSkills": [String],
  "status": "open" | "closed" | "filled",
  "applications": [ObjectId],
  "createdAt": Date,
  "updatedAt": Date
}
```

### Application
```json
{
  "_id": ObjectId,
  "jobOffer": ObjectId,
  "candidate": ObjectId,
  "status": "pending" | "accepted" | "rejected" | "withdrawn",
  "message": String,
  "appliedAt": Date,
  "reviewedAt": Date,
  "reviewedBy": ObjectId,
  "createdAt": Date,
  "updatedAt": Date
}
```

## 🛠️ Build & Deployment

### Frontend Build
```bash
cd frontend
npm run build
```
Output will be in `frontend/dist/`

### Backend Build
```bash
cd backend
npm run build
```
Output will be in `backend/dist/`

## 🔒 Security Features

- JWT token-based authentication
- Google OAuth 2.0 integration
- Password hashing with bcryptjs
- CORS protection
- Input validation
- MongoDB injection prevention

## 📝 Next Steps

1. Implement Google OAuth configuration
2. Set up MongoDB Atlas (or local MongoDB)
3. Deploy backend to Heroku/Railway/AWS
4. Deploy frontend to Vercel/Netlify
5. Add email notifications
6. Implement real-time notifications with Socket.io
7. Add payment integration (if needed)

---

**Last Updated:** March 2026
