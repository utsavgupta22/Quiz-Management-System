# Quiz Management System

A production-ready Quiz Management System built with React.js, Node.js, and MongoDB.

## Features

- **Admin Panel**: Create and manage quizzes with various question types
- **Question Types**: MCQ, True/False, and Text-based questions
- **Public Quiz Page**: Anyone can take quizzes via shareable links
- **Instant Results**: View score and correct answers immediately after submission

## Tech Stack

- **Frontend**: React.js + Vite
- **Backend**: Node.js + Express
- **Database**: MongoDB Atlas
- **Authentication**: JWT

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)

### 1. Clone & Setup

```bash
git clone https://github.com/utsavgupta22/Quiz-Management-System.git
cd Quiz-Management-System
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secret_key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

Start backend:
```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 4. Create Admin User

Call the setup endpoint once:
```bash
curl -X POST http://localhost:5000/api/auth/setup
```

### 5. Access the App

- **Admin Panel**: http://localhost:5173/login
- **Login**: Use credentials from `.env` (default: admin/admin123)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Admin login |
| POST | `/api/auth/setup` | Create admin (run once) |
| GET | `/api/quizzes` | List quizzes (auth required) |
| POST | `/api/quizzes` | Create quiz (auth required) |
| GET | `/api/quizzes/:id` | Get quiz (public) |
| DELETE | `/api/quizzes/:id` | Delete quiz (auth required) |
| POST | `/api/quizzes/:id/submit` | Submit quiz (public) |

## Project Structure

```
Quiz Management System/
├── backend/
│   ├── config/db.js
│   ├── models/Admin.js, Quiz.js
│   ├── routes/auth.js, quizzes.js
│   ├── middleware/authMiddleware.js
│   └── server.js
├── frontend/
│   └── src/
│       ├── pages/Login, Dashboard, CreateQuiz, TakeQuiz
│       ├── context/AuthContext.jsx
│       └── App.jsx
├── PLAN.md
└── README.md
```

## Deployment

- **Backend**: Deploy to Render (free tier)
- **Frontend**: Deploy to Vercel (free tier)

## License

MIT
