# 🚀 Vercel Deployment Guide: StadiumOps AI

This guide provides a comprehensive, step-by-step walkthrough to deploy the **StadiumOps AI** platform (a Next.js monorepo) perfectly to Vercel. 

---

## 🌟 Why Vercel is the Perfect Choice
1. **100% Free Serverless APIs**: Vercel allows you to run dynamic backend routes (like our Gemini AI console, orchestrator, and simulation triggers) completely for free on their Hobby plan, without requiring a credit card.
2. **Instant Git Integration**: Every time you push a commit to GitHub, Vercel will automatically build and deploy a preview or production version of your application.
3. **Optimized Next.js Engine**: Built by the creators of Next.js, ensuring maximum speed, automatic edge routing, and global CDN delivery.

---

## 1️⃣ Connect Your Repository to GitHub
If you haven't pushed your repository to GitHub yet, do this first:

1. Create a new repository on your [GitHub account](https://github.com/) (keep it *Private* if you want to protect your Firebase credentials).
2. Open your terminal at the root of your project directory and run:
   ```bash
   # Add your GitHub repository as the remote origin
   git remote add origin https://github.com/your-username/stadium-ops-ai.git
   
   # Push your local committed changes to the main branch
   git push -u origin main
   ```

---

## 2️⃣ Import Project in Vercel Dashboard
1. Go to the [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New** > **Project**.
3. Select **Import** next to your `stadium-ops-ai` repository in the list.
4. **Configure Project settings:**
   * **Framework Preset**: Select **Next.js**.
   * **Root Directory**: Select **`apps/web`** (click Edit, select the `apps/web` folder, and click Continue). 
     *(This is very important! It tells Vercel to build the Next.js application inside the monorepo).*
   * **Build & Development Settings**: Leave these as default (Vercel automatically detects Next.js build scripts).

---

## 3️⃣ Add Environment Variables
Before clicking "Deploy", scroll down to the **Environment Variables** section. You need to copy-paste your credentials.

Add the following environment variables (make sure to match these exact names):

### 📱 Client-Side Variables (Firebase Web Config)
Find these in your Firebase Console under **Project Settings > General**.

| Key | Value (Example) | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyBsdYP2tnsWKK7V...` | Firebase Web API Key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `stadiumopsai.firebaseapp.com` | Firebase Auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `stadiumopsai` | Your Firebase Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `stadiumopsai.firebasestorage.app` | Storage Bucket Domain |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `171715681770` | Messaging sender id |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:171715681770:web:65b3e...` | Firebase App ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | `G-WEYXVP5FFP` | Google Analytics ID |
| `NEXT_PUBLIC_APP_ENV` | `production` | Set to `production` |

### 🧠 Server-Side Secrets (Gemini AI & Firebase Admin)
These are server-side secrets that must never be exposed to the client.

| Key | Value (Example) | Description |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | `AIzaSyD_2yvzaSKMq432O8uZH9K4nBd1_rZ4Cv4` | Your Google Gemini AI Studio key |
| `FIREBASE_PROJECT_ID` | `stadiumopsai` | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | `firebase-adminsdk-fbsvc@stadiumopsai.iam.gserviceaccount.com` | Service account email |
| `FIREBASE_PRIVATE_KEY` | `-----BEGIN PRIVATE KEY-----\nMIIEvQIBAD...` | Service account private key |

> [!WARNING]
> When pasting `FIREBASE_PRIVATE_KEY` into Vercel, make sure you paste the **entire private key** starting from `-----BEGIN PRIVATE KEY-----` all the way to `-----END PRIVATE KEY-----`. If there are literal newline `\n` characters, Vercel will parse them correctly.

---

## 4️⃣ Click Deploy! 🚀
After adding all variables, click the **Deploy** button.

Vercel will:
1. Clone your GitHub repository.
2. Install dependencies via **pnpm**.
3. Compile Next.js pages and optimize static chunks.
4. Output your live production URL (e.g. `https://stadium-ops-ai.vercel.app`).

---

## 5️⃣ Authorized Domain Setup in Firebase (Crucial Step!)
To make sure you do not get "Failed to sign in" popup errors during Google Login:

1. Go to your **Firebase Console** > **Authentication** > **Settings** > **Authorized domains**.
2. Click **Add domain**.
3. Add your Vercel URL **exactly** (without `https://` or trailing slashes):
   * **`stadium-ops-ai.vercel.app`**
4. Click **Add**.

---

## ⚡ Fast local deployments via Vercel CLI
If you want to deploy directly from your local terminal instead of waiting for Git pushes:

1. **Log in to Vercel CLI:**
   ```bash
   npx vercel login
   ```
2. **Link the repository locally:**
   ```bash
   npx vercel link
   ```
   *(Select your account, select "Link to existing project", and choose `stadium-ops-ai`).*
3. **Deploy to production instantly:**
   ```bash
   npx vercel --prod --yes
   ```
