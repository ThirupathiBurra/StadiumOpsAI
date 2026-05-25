# 🚀 Firebase Deployment Guide: StadiumOps AI

This guide provides a comprehensive, step-by-step walkthrough to deploy the **StadiumOps AI** platform (a Next.js monorepo) perfectly to Firebase. 

StadiumOps AI uses:
1. **Firebase Hosting (Framework-Aware)** to build and host the Next.js web application (including server-side SSR routes via Cloud Functions).
2. **Cloud Firestore** for real-time zones, incidents, alerts, and audit logs.
3. **Firebase Storage** for media assets (if needed).
4. **Firebase Authentication** with Google Sign-In.
5. **Google Gemini (AI Studio)** for real-time operations, crowd intelligence, routing, and incident analysis.

---

## 📋 Prerequisites
Ensure you have the following installed on your machine:
* **Node.js** (v20 or higher recommended)
* **pnpm** (v9 or higher)
* **Firebase CLI** (`npm install -g firebase-tools` or run via `npx`)

---

## 1️⃣ Firebase Console Setup
First, we must provision the required services in the Firebase Console.

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project** and name it (e.g., `stadium-ops-ai`).
3. **Google Analytics**: Enable it for your project (recommended for production).
4. Create the project and wait for provisioning to complete.

### A. Enable Authentication
1. Navigate to **Build** > **Authentication** and click **Get Started**.
2. Go to the **Sign-in method** tab.
3. Select **Google** under *Additional providers*.
4. Enable it, configure your support email, and click **Save**.
5. *Crucial*: In **Settings** > **Authorized domains**, make sure the following domains are added:
   * `localhost`
   * Your custom domain (if any)
   * `stadium-ops-ai.web.app` (Firebase default)
   * `stadium-ops-ai.firebaseapp.com` (Firebase default)
   * `stadium-ops-ai.vercel.app` (if you also keep the Vercel mirror active)

### B. Enable Cloud Firestore
1. Navigate to **Build** > **Firestore Database** and click **Create database**.
2. Select **Start in test mode** or **Production mode** (we will deploy our secure `firestore.rules` anyways).
3. Choose a database location close to your users (e.g., `us-central1` or `asia-east1`).
4. Click **Create** and wait for the database to provision.

### C. Enable Cloud Storage
1. Navigate to **Build** > **Storage** and click **Get Started**.
2. Select **Start in test mode** (we will deploy `storage.rules` anyways).
3. Click **Next** and use the default bucket region.
4. Click **Done**.

### D. Generate a Service Account (For Local Emulators & Server-Side Functions)
1. In the Firebase Console, click the **Gear Icon (Project Settings)** > **Service Accounts**.
2. Click **Generate New Private Key** at the bottom.
3. Save the downloaded JSON file as `service-account.json` at the root of your project directory. 
   *(Note: This file contains private keys. It is already added to `.gitignore` to prevent leaking it to GitHub).*

---

## 2️⃣ Configure Environment Variables
You need to configure environment variables for both the **client-side** (baked into Next.js during build) and the **server-side** (injected into Cloud Functions at runtime).

### A. Client-Side Variables (`apps/web/.env.production`)
Create a file named `.env.production` inside the `apps/web/` folder with your Firebase web app config. 

> [!NOTE]
> You can find these values in the Firebase Console under **Project Settings** > **General** > **Your apps** > **Web App** (click "Add app" if you haven't created a web app in the console yet).

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=stadium-ops-ai.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=stadium-ops-ai
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=stadium-ops-ai.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcdef123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXX
NEXT_PUBLIC_APP_ENV=production
```

### B. Server-Side Variables (Cloud Functions for SSR)
Since Next.js runs inside Google Cloud Functions when deployed to Firebase Hosting (framework-aware), the server-side code requires access to **Gemini API** and **Firebase Admin**.

There are two ways to inject these:

#### Option A: Local `.env` Bundle (Easiest)
Create a file named `.env` in the root of your repository (or inside `apps/web/`) containing:
```env
GEMINI_API_KEY=AIzaSyYourGeminiApiKeyFromAIStudio
FIREBASE_PROJECT_ID=stadium-ops-ai
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@stadium-ops-ai.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqh..."
```
*Note: Make sure the `FIREBASE_PRIVATE_KEY` has standard newline `\n` characters embedded in a single string.*

#### Option B: Google Cloud Run Environment Configuration (Most Secure)
Once deployed, Firebase Frameworks will create a Cloud Run service (usually named `ssrweb` or similar) in your Google Cloud Console.
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Select your Firebase project.
3. Search for **Cloud Run** and click on your deployed Next.js service.
4. Click **Edit & Deploy New Revision**.
5. Under **Variables & Secrets**, add:
   * `GEMINI_API_KEY` = `your_gemini_key`
6. Click **Deploy**.

---

## 3️⃣ Local Authentication & Project Selection
Open your terminal at the root of the project directory and run the following:

1. **Log in to Firebase CLI:**
   ```bash
   pnpm firebase login
   ```
   *(A browser window will open. Sign in using the Google account associated with your Firebase project).*

2. **Select your default project:**
   Verify that your `.firebaserc` file matches your active project ID:
   ```json
   {
     "projects": {
       "default": "your-firebase-project-id"
     }
   }
   ```
   If not, link it manually:
   ```bash
   pnpm firebase use --add
   ```
   Select your project from the interactive list and give it the alias `default`.

---

## 4️⃣ Build the Workspace
Before deploying, we must compile the shared workspaces to ensure there are no TypeScript or build issues:

```bash
# Build the shared packages first, then compile the Web application
pnpm build
```

This command runs the monorepo build pipeline, compiling `@stadium/shared` first and then compiling the Next.js bundle inside `apps/web/`.

---

## 5️⃣ Deployment Commands
We have pre-configured workspace shortcuts in the root `package.json` for easy deployment. Run the commands below:

### ⚡ Full Deployment (Hosting + Firestore Rules/Indexes + Storage Rules)
To deploy the entire project at once:
```bash
pnpm deploy
```
*(This triggers `firebase deploy` which detects Next.js, automatically builds the serverless functions, uploads static assets to CDN, and uploads all Firestore/Storage rules & indexes).*

### 📁 Granular Deployments (For quick updates)
If you only changed specific parts of the project, use these commands to deploy much faster:

* **Deploy only Security Rules (Firestore & Storage):**
  ```bash
  pnpm deploy:rules
  ```

* **Deploy only the Web frontend (Next.js & Hosting):**
  ```bash
  pnpm deploy:hosting
  ```

---

## 🛠️ Post-Deployment Verification
Once deployment completes, the CLI will output your live URL:
`✔  Deploy complete! Project Console: https://console.firebase.google.com/project/stadium-ops-ai/overview`
`Hosting URL: https://stadium-ops-ai.web.app`

### 1. Check Live Web App
Open `https://stadium-ops-ai.web.app` (or your custom domain) and check:
* **Authentication**: Sign in via Google. (If it fails, confirm that your domain is added to *Authorized domains* in the Firebase Console).
* **AI Console / Simulation**: Click **Run Scenario** (e.g. Gate Congestion). If it runs successfully and shows Firestore updates in real-time, your Server-Side Cloud Function and Gemini API Key are working perfectly.

### 2. Verify Security Rules
Check **Firestore Database** > **Rules** in the console to verify that the active rules match `firestore.rules`. This protects your stadium data against unauthorized access while allowing AI agents and simulation engines to safely write updates.
