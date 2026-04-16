# 🧠 DelphiMinds — AI Career Intelligence Platform

> AI-powered career analysis, skill gap identification, and personalized mentoring.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)
![Firebase](https://img.shields.io/badge/Firebase-Auth-orange?logo=firebase)
![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite)

---

## 🚀 Features

- **AI Resume Analysis** — Upload PDF/DOCX and extract skills using ML
- **Career Path Recommendations** — AI-powered career matching with compatibility scores
- **Skill Gap Analysis** — Identify what you need to learn for your target role
- **AI Career Mentor** — Interactive chatbot for career guidance
- **Career Insights Dashboard** — Radar charts, progress tracking, and analytics
- **Firebase Authentication** — Secure login with email/password and Google OAuth

---

## 🏗️ Architecture

```
Frontend (React + Vite)
    ↓
Firebase Auth → ID Token
    ↓
Node.js Backend API
    ↓
ML Service (Python) → PostgreSQL
```

---

## 📁 Project Structure

```
delphiminds/
├── public/
│   ├── favicon.svg
│   └── robots.txt
├── src/
│   ├── app/                    # App shell, routes, store
│   │   ├── App.jsx
│   │   ├── routes.jsx
│   │   └── store.js
│   ├── features/               # Feature-based modules
│   │   ├── auth/               # Login, Signup, auth state
│   │   ├── dashboard/          # Dashboard + widgets
│   │   ├── resume/             # Resume upload & analysis
│   │   ├── chatbot/            # AI mentor chat UI
│   │   ├── career/             # Career paths & skill gaps
│   │   └── insights/           # Charts & analytics
│   ├── components/             # Shared UI components
│   ├── services/               # API client & endpoints
│   ├── context/                # React Context (Auth)
│   ├── hooks/                  # Custom hooks
│   ├── utils/                  # Helpers & constants
│   ├── firebase/               # Firebase configuration
│   ├── styles/                 # Global CSS + Tailwind
│   └── main.jsx                # Entry point
├── server/                     # Backend (Node.js) — separate repo
├── ml-service/                 # ML microservice — separate repo
└── database/                   # DB migrations — separate repo
```

---

## ⚡ Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project (for auth)

### 1. Clone & Install

```bash
git clone https://github.com/your-org/delphiminds.git
cd delphiminds
npm install
```

### 2. Configure Firebase

Create a `.env` file in the root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=http://localhost:5000/api
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 4. Build for Production

```bash
npm run build
npm run preview
```

---

## 🔐 Authentication Flow

1. User signs in via Firebase (email/password or Google OAuth)
2. Firebase returns an ID token
3. Token is stored and attached to every API request via Axios interceptor
4. Backend verifies the token using Firebase Admin SDK
5. Protected routes redirect unauthenticated users to `/login`

---

## 📡 API Integration

All API calls go through the centralized `apiClient.js`:

| Endpoint | Method | Description |
|---|---|---|
| `/api/user/profile` | GET/POST | User profile management |
| `/api/resume/upload` | POST | Upload resume for AI analysis |
| `/api/recommendations` | GET | Career path recommendations |
| `/api/skill-gap` | GET | Skill gap analysis |
| `/api/chat` | POST | AI mentor chat |

---

## 🎨 Design System

- **Colors**: Brand purple (#7c5cfc), Accent cyan (#38bdf8), Success green (#4ade80)
- **Glass effects**: Backdrop blur + translucent surfaces
- **Typography**: Inter (sans), JetBrains Mono (code)
- **Animations**: Framer Motion for page transitions and micro-interactions
- **Dark mode**: Native dark theme

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 8 |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| HTTP Client | Axios |
| Auth | Firebase Authentication |
| Charts | Recharts |
| Animations | Framer Motion |
| Icons | Lucide React |
| File Upload | React Dropzone |

---

## 📄 License

MIT © DelphiMinds
