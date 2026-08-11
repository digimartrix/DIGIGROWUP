# DigiLearning — Adaptive Learning HUD Platform

DigiLearning is an adaptive web application built for modern learners. Rather than tracking progress via static checklists, DigiLearning dynamically calculates topic-level mastery and continuously computes the **Next Best Action** for the user based on their performance data.

The project features a futuristic HUD / Instrument Panel design language using Space Grotesk, IBM Plex Sans, and IBM Plex Mono typography.

---

## 🚀 Tech Stack


### Frontend
- **React.js** (Vite-based scaffolding)
- **Tailwind CSS** (Custom HUD-aesthetic token system)
- **Axios** (API requests with JWT auto-injection interceptor)
- **React Router DOM** (Route protection & navigation)
- **Lucide React** (Consistent 1.5px stroke outlined iconography)

### Backend & Database
- **Node.js** & **Express.js** (REST API)
- **MongoDB Atlas / Mongoose** (Data modeling & queries)
- **JSON Web Tokens (JWT)** & **Bcrypt** (Secure, hashed authentication)
- **Helmet.js** & **Express Rate Limit** (Basic API hardening)
- **Express Validator** (Server-side input sanitization)

### Tools & Engineering
- **VS Code** (Primary IDE)
- **Git & GitHub** (Version control)
- **Postman** (API testing and endpoint validation)

---

## 🛠️ CRUD Operations & Core Features

1. **Authentication (Create / Read)**
   - `POST /api/auth/register`: Creates a new user, hashes password via `bcrypt`, logs them in, and automatically creates a new course enrollment.
   - `POST /api/auth/login`: Authenticates user credentials, validates inputs via `express-validator`, and returns a 24h JWT.
2. **Mastery Calculations (Update / Read)**
   - `GET /api/mastery/:userId`: Reads user-specific topic-level mastery scores.
   - `POST /api/lessons/:id/complete`: Marks a lesson as complete (adds to completed list in database) and triggers recalculation of affected mastery scores.
   - `POST /api/quizzes/:id/submit`: Grade quiz submissions, saves the attempt (`QuizAttempt`), and recalculates mastery per topic using the formula:
     $$\text{Mastery Score} = (\text{Quiz Score} \times 0.6) + (\text{Lesson Completion \%} \times 0.4)$$
3. **Next Best Action Engine (Read / Derivation)**
   - `GET /api/next-action/:userId`: Compares active mastery scores, identifies the weakest topic, estimates read/practice times, and returns a tailored deep-link CTA (e.g., Critical, Practice, Assess, Advance).
4. **AI Tutor Integration**
   - `POST /api/ai/tutor`: Stateless contextual chat using Groq API completions, seeded with current lesson contents and the user's weaknesses (topics below 50% mastery).

---

## 📂 File Structure

```
Digi learning/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # SegmentedGauge, Sidebar, AITutorPanel
│   │   ├── context/        # AuthContext
│   │   ├── lib/            # Axios API client
│   │   ├── pages/          # Login, Register, Dashboard, Explore, Lesson, Quiz, NotFound
│   │   ├── App.jsx         # Routes definition
│   │   ├── index.css       # HUD styling, animations, dot-grid bg
│   │   └── main.jsx        # Entry point
│   ├── tailwind.config.js  # Styling tokens configuration
│   └── vite.config.js      # Proxy server config
│
└── server/                 # Express backend
    ├── middleware/         # JWT validator & error handlers
    ├── models/             # User, Course, Module, Lesson, Quiz, QuizAttempt, Enrollment, MasteryScore
    ├── routes/             # auth, courses, lessons, quizzes, mastery, ai
    ├── index.js            # Entry server app
    ├── seed.js             # High-fidelity Web Dev course data seeder
    └── .env                # App secrets & configurations
```

---

## 🏁 Getting Started

### 1. Backend Server Setup
Navigate to the `server` directory, configure the environments, install packages, and seed:
```bash
cd server
npm install

# Configure your environment variables (.env)
cp .env.example .env
# Open .env and configure your MONGODB_URI and GROQ_API_KEY

# Seed the database
npm run seed

# Run in development mode
npm run dev
```

### 2. Frontend Client Setup
Navigate to the `client` directory, install packages, and run:
```bash
cd ../client
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.
