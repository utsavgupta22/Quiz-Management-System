# Quiz Management System - PLAN.md

## Overview
A production-ready Quiz Management System built with React.js, Node.js, and MongoDB Atlas.

---

## Assumptions

1. **Single Admin User**: One hardcoded admin account for simplicity (can be extended to multi-admin later)
2. **No User Registration**: Public users take quizzes without creating accounts
3. **Question Types**: MCQ (single answer), True/False, and Short Text answers
4. **No Quiz Timer**: Quizzes don't have time limits (can be added as enhancement)
5. **Immediate Results**: Scores shown immediately after submission
6. **MongoDB Atlas**: Free tier for database hosting
7. **Deployment**: Frontend on Vercel, Backend on Render (both free tier)

---

## Scope

### In Scope (MVP)
| Feature | Priority |
|---------|----------|
| Admin login/logout | P0 |
| Create quiz with title | P0 |
| Add MCQ questions | P0 |
| Add True/False questions | P0 |
| Add Text questions | P0 |
| Public quiz page | P0 |
| Submit quiz & view results | P0 |
| View list of quizzes (Admin) | P1 |
| Delete quiz | P1 |

### Out of Scope (Future Enhancements)
- Quiz timer/countdown
- Question reordering
- Rich text/images in questions
- Quiz analytics/reports
- Multiple admin users
- User registration & history

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
│                    (React + Vite)                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Admin Login │  │Admin Panel  │  │ Public Quiz Page    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│         │               │                    │              │
└─────────┼───────────────┼────────────────────┼──────────────┘
          │               │                    │
          ▼               ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                         BACKEND                             │
│                   (Node.js + Express)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Auth API    │  │ Quiz CRUD   │  │ Quiz Submit API     │  │
│  │ /api/auth   │  │ /api/quizzes│  │ /api/submit         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│         │               │                    │              │
└─────────┼───────────────┼────────────────────┼──────────────┘
          │               │                    │
          ▼               ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                      MongoDB Atlas                          │
│  ┌─────────────┐  ┌─────────────────────────────────────┐   │
│  │   Admin     │  │              Quiz                   │   │
│  │ Collection  │  │  - title                            │   │
│  │ - username  │  │  - questions[]                      │   │
│  │ - password  │  │    - type (mcq/tf/text)             │   │
│  │   (hashed)  │  │    - question                       │   │
│  │             │  │    - options[] (for mcq)            │   │
│  │             │  │    - correctAnswer                  │   │
│  └─────────────┘  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Admin Collection
```javascript
{
  _id: ObjectId,
  username: String,      // "admin"
  password: String       // bcrypt hashed
}
```

### Quiz Collection
```javascript
{
  _id: ObjectId,
  title: String,
  createdAt: Date,
  questions: [
    {
      _id: ObjectId,
      type: String,        // "mcq" | "truefalse" | "text"
      question: String,
      options: [String],   // For MCQ only
      correctAnswer: String
    }
  ]
}
```

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Admin login | No |
| GET | `/api/quizzes` | List all quizzes | Yes |
| POST | `/api/quizzes` | Create new quiz | Yes |
| GET | `/api/quizzes/:id` | Get quiz by ID | No |
| DELETE | `/api/quizzes/:id` | Delete quiz | Yes |
| POST | `/api/quizzes/:id/submit` | Submit quiz answers | No |

---

## Tech Decisions & Trade-offs

| Decision | Reasoning |
|----------|-----------|
| **Vite over Next.js** | Faster setup, simpler for SPA, sufficient for this scope |
| **JWT Authentication** | Stateless, works well with separate frontend/backend |
| **MongoDB over Postgres** | Flexible schema, easier for nested questions array |
| **bcrypt for passwords** | Industry standard, secure password hashing |
| **No ORM** | Direct MongoDB driver for simplicity and speed |

---

## Folder Structure

```
Quiz Management System/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Admin.js
│   │   └── Quiz.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── quizzes.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── PLAN.md
└── README.md
```

---

## Timeline (2 hours)

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Planning | 15 min | PLAN.md, architecture |
| Backend | 30 min | APIs, DB setup |
| Frontend | 45 min | Admin panel, public page |
| Integration | 20 min | Connect FE+BE, polish |
| Deployment | 10 min | Deploy, final commit |

---

## Scope Changes During Implementation
*(To be updated during development)*

---

## Reflection
*(To be completed at the end)*

What I would do next if I had more time:
- [ ] Add quiz timer functionality
- [ ] Implement analytics dashboard
- [ ] Add question reordering (drag & drop)
- [ ] Support images in questions
- [ ] User accounts with quiz history
- [ ] Export results to CSV
