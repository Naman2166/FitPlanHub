# Quick Setup Guide

## Step-by-Step Setup

### 1. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account or sign in
3. Create a new cluster (free tier is fine)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (it looks like: `mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority`)
6. Replace `<password>` with your database password
7. Replace `<dbname>` with `fitplanhub` (or any name you prefer)

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
# Copy the content below and replace with your values
```

Create `backend/.env`:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string_here
JWT_SECRET=your_random_secret_key_minimum_32_characters_long
NODE_ENV=development
```

Generate a JWT secret (you can use any random string, or run this in Node.js):
```javascript
require('crypto').randomBytes(32).toString('hex')
```

```bash
# Start the backend server
npm run dev
```

Backend should be running on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start the frontend
npm start
```

Frontend should open automatically at `http://localhost:3000`

### 4. Test the Application

1. **Sign up as a Trainer:**
   - Go to Sign Up
   - Select "Certified Trainer"
   - Create an account
   - You'll be redirected to the Trainer Dashboard

2. **Create a Fitness Plan:**
   - Click "+ Create New Plan"
   - Fill in the form (Title, Description, Price, Duration)
   - Click "Create Plan"

3. **Sign up as a User:**
   - Logout
   - Sign up as "Regular User"
   - Browse plans on the landing page

4. **Subscribe to a Plan:**
   - Click on a plan
   - Click "Subscribe Now"
   - You'll now have access to full plan details

5. **Follow a Trainer:**
   - Click on a trainer's name
   - Click "Follow Trainer"
   - Go to "My Feed" to see plans from followed trainers

## Troubleshooting

### Backend won't start
- Check if MongoDB connection string is correct
- Ensure PORT 5000 is not in use
- Check `.env` file exists and has correct values

### Frontend can't connect to backend
- Ensure backend is running on port 5000
- Check `REACT_APP_API_URL` in frontend `.env` (optional, defaults to localhost:5000)
- Check browser console for CORS errors

### Authentication issues
- Clear browser localStorage
- Check JWT_SECRET is set in backend `.env`
- Ensure token is being sent in request headers

## Production Deployment

For production:
1. Set `NODE_ENV=production` in backend `.env`
2. Build frontend: `npm run build` in frontend directory
3. Serve frontend build folder with a static server
4. Update `REACT_APP_API_URL` to your production backend URL
5. Use environment variables for sensitive data
6. Enable HTTPS
7. Set up proper CORS origins

