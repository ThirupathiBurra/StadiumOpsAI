# 🏟️ StadiumOps AI — Enterprise Operations Platform

[![Live Demo](https://img.shields.io/badge/Live_Demo-stadium--ops--ai.vercel.app-emerald?style=for-the-badge)](https://stadium-ops-ai.vercel.app)

StadiumOps AI is a next-generation, real-time stadium operations and crowd management platform. It combines live venue telemetry, incident tracking, and Google's Gemini AI to provide operations commanders with unprecedented tactical intelligence and situational awareness during major events.

## ✨ Key Features

### 📡 Live Operations Dashboard
Real-time telemetry across all stadium zones. Monitor live occupancy metrics, crowd density, and critical threshold alerts in a unified, glassmorphic UI.

### 🤖 AI Intelligence Hub
An integrated command console powered by **Google Gemini 2.5 Flash**. The AI has real-time access to the stadium's live data (zone occupancies, active incidents, and alerts) and provides actionable intelligence, evacuation routing, and situational summaries on demand.

### 🚨 Incident Command & Alerts
A live-streaming incident feed that tracks severe weather, security breaches, gate congestion, and crowd surges. Automated risk-level assessment ensures critical events are escalated immediately.

### 🎮 Live Scenario Simulation
Built-in simulation engine to test the platform's response capabilities. Trigger complex multi-zone scenarios (e.g., *Weather Disruption*, *Emergency Evacuation*) to see how the system handles dynamic cascading events in real time.

## 🛠️ Technology Stack

- **Frontend:** Next.js 14, React 18, Tailwind CSS
- **Design System:** Custom "Cosmic Cyber-Zen" aesthetic (Glassmorphism, Material Symbols, Tailwind Typography)
- **Database & Auth:** Firebase Firestore (Real-time sync), Firebase Authentication
- **AI Integration:** Google Gemini API (`@google/generative-ai`)
- **Deployment:** Vercel (Auto CI/CD)

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js 18+ and `pnpm`
- A Firebase Project (with Firestore and Auth enabled)
- A Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ThirupathiBurra/StadiumOpsAI.git
   cd StadiumOpsAI/apps/web
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in `apps/web` with the following variables:
   ```env
   # Firebase Client Config
   NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-auth-domain"
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
   NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"

   # Google Gemini API
   GEMINI_API_KEY="your-gemini-api-key"
   ```

4. **Run the Development Server**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## 🏗️ Architecture Notes

- **Real-time Sync:** The platform uses Firebase's `onSnapshot` listeners to ensure the Live Dashboard and Incident Feeds update instantly across all connected clients without refreshing.
- **Serverless AI Routing:** Gemini AI queries are routed through Next.js Route Handlers (`/api/ai-console`), ensuring API keys remain secure on the server while leveraging Firebase Auth tokens for endpoint protection.
- **State Engine:** The simulation triggers batch writes to Firestore to update multiple zones and generate realistic incident logs simultaneously.

---
*Built for the future of enterprise venue operations.*
