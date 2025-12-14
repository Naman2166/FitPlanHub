# FitPlanHub - Fitness Plans & Trainers Platform

A full-stack MERN application where certified trainers create fitness plans and users purchase & follow these plans.

## Features

### User & Trainer Authentication
- Signup & login for both trainers and regular users
- Password hashing with bcrypt
- JWT token authentication

### Trainer Dashboard
- Create fitness plans with title, description, price, and duration
- Edit or delete their own plans
- View all plans created by the trainer

### User Subscriptions
- View all available fitness plans
- Purchase/subscribe to plans (simulated payment)
- Access full plan details after subscription

### Access Control
- Only subscribed users can view full plan details
- Non-subscribers see preview (title, trainer name, price)

### Follow Trainers
- Users can follow/unfollow trainers
- View list of followed trainers

### Personalized Feed
- Shows all plans from followed trainers
- Indicates which plans the user has purchased
- Includes trainer information

## Tech Stack

- **Frontend**: React, React Router, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs

## Project Structure

```
fitnesshub/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Plan.js
│   │   ├── Subscription.js
│   │   └── Follow.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── plans.js
│   │   ├── subscriptions.js
│   │   ├── follows.js
│   │   ├── feed.js
│   │   └── trainers.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── App.js
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
```

4. Replace `your_mongodb_atlas_connection_string` with your MongoDB Atlas connection string.

5. Replace `your_super_secret_jwt_key_here` with a secure random string for JWT signing.

6. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory (optional, defaults to localhost:5000):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the frontend development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Sign up (user or trainer)
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (protected)

### Plans
- `GET /api/plans` - Get all plans (public)
- `GET /api/plans/:id` - Get plan details (protected, access control)
- `POST /api/plans` - Create plan (trainer only)
- `PUT /api/plans/:id` - Update plan (owner only)
- `DELETE /api/plans/:id` - Delete plan (owner only)
- `GET /api/plans/trainer/:trainerId` - Get trainer's plans

### Subscriptions
- `POST /api/subscriptions/:planId` - Subscribe to a plan (user only)
- `GET /api/subscriptions/my-subscriptions` - Get user's subscriptions
- `GET /api/subscriptions/check/:planId` - Check subscription status

### Follows
- `POST /api/follows/:trainerId` - Follow a trainer (user only)
- `DELETE /api/follows/:trainerId` - Unfollow a trainer
- `GET /api/follows/my-follows` - Get followed trainers
- `GET /api/follows/check/:trainerId` - Check follow status

### Feed
- `GET /api/feed` - Get personalized feed (user only)

### Trainers
- `GET /api/trainers` - Get all trainers
- `GET /api/trainers/:trainerId` - Get trainer profile

## Usage

1. **Sign Up**: Create an account as either a user or trainer
2. **Trainers**: 
   - Access the trainer dashboard
   - Create fitness plans with details
   - Edit or delete your plans
3. **Users**:
   - Browse all available plans
   - Subscribe to plans (simulated payment)
   - Follow trainers
   - View personalized feed with plans from followed trainers
   - Access full plan details after subscription

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - Secret key for JWT token signing
- `NODE_ENV` - Environment (development/production)

### Frontend (.env)
- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:5000/api)

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Protected routes with middleware
- Role-based access control
- Input validation

## License

This project is open source and available under the MIT License.

