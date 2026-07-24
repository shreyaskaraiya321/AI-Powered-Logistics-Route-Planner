# Logistics Route Planner (AI-Powered)

An AI-powered logistics route planner designed for modern fleets. Features deterministic algorithmic routing combined with Google Gemini's advanced generative AI for dispatch explanations, driver briefs, and customer notifications. Built with a sleek, dark frosted-glass aesthetic.

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, React Router, Axios, Lucide React
- **Backend:** Node.js, Express, Mongoose, Zod, bcrypt, jsonwebtoken, `@google/genai`
- **Database:** MongoDB (Atlas or local)

## Features
- **Role-Based Access Control:** Distinct views and capabilities for `admin`, `dispatcher`, `driver`, and `customer`.
- **Deterministic Routing Engine:** Validates vehicle capacities and matches orders sequentially.
- **AI Integration (Gemini 2.0 Flash):**
  - Generates route explanations for dispatchers.
  - Summarizes routes into bullet points.
  - Generates encouraging daily briefs for drivers.
  - Drafts exception summaries when a route fails.
  - Composes SMS updates for customers based on status changes.
- **Security:** Pure backend AI integration. The frontend never sees the API key.

## Local Setup

### 1. Prerequisites
- Node.js (v18 or higher)
- MongoDB (Atlas account or local instance)
- Google Gemini API Key (Google AI Studio)

### 2. Environment Variables
In the `/server` directory, create a `.env` file based on `.env.example`:
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.example.mongodb.net/logistics
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=AIzaSy...
```
*(Never commit `.env` to version control!)*

### 3. Installation
**Server:**
```bash
cd server
npm install
npm run dev
```

**Client:**
```bash
cd client
npm install
npm run dev
```

The client runs on `http://localhost:5173` and the server runs on `http://localhost:5000`.

## AI Endpoints
The following endpoints utilize Gemini AI on the backend:
- `POST /api/routes/:id/explain` - Route explanation for dispatch.
- `POST /api/routes/:id/summary` - 3-bullet point summary.
- `POST /api/routes/:id/driver-instructions` - Driver daily brief.
- `POST /api/orders/:id/exception-summary` - Issue report.
- `POST /api/orders/:id/customer-update` - 160-char SMS draft.

All generations are logged in the `AiGeneration` MongoDB collection.
