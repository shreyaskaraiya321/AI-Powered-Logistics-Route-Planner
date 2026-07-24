# Deployment Guide

This guide outlines the steps to deploy the Logistics Route Planner to production.

## 1. Database (MongoDB Atlas)
1. Log into MongoDB Atlas and create a new cluster.
2. In the "Database Access" tab, create a new database user (e.g., `logistics_app`) with a secure password.
3. In the "Network Access" tab, click "Add IP Address" and select "Allow Access From Anywhere" (`0.0.0.0/0`) or specifically whitelist your backend server IP.
4. Click "Connect" -> "Connect your application" and copy the connection string.

## 2. Backend (Render / Railway / Fly.io)
*Example using Render:*
1. Create a New Web Service.
2. Connect your GitHub repository.
3. Set the Root Directory to `server`.
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. Add Environment Variables:
   - `PORT`: (Render sets this automatically, but defaults to `10000`)
   - `MONGO_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A strong random string.
   - `GEMINI_API_KEY`: Your Google AI Studio API key.

## 3. Frontend (Vercel / Netlify)
*Example using Vercel:*
1. Create a New Project.
2. Import the GitHub repository.
3. Set the Framework Preset to "Vite".
4. Set the Root Directory to `client`.
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. (Optional) If you have frontend env vars, add them here.
8. Click Deploy.

## 4. Post-Deployment
- Ensure the Frontend URL is allowed in the Backend CORS configuration if you restricted it (currently it is open `app.use(cors())`).
- Update your Frontend Axios `baseURL` (in `client/src/api/axios.js`) to point to your new deployed Backend URL (e.g., `https://my-logistics-api.onrender.com/api`) instead of `http://localhost:5000/api`.
