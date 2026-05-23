import { redirect } from 'next/navigation';

// ─── Root Page ────────────────────────────────────────────────────────────────
// Redirects to the main dashboard.
// Auth check is handled in the dashboard layout.

export default function RootPage() {
  redirect('/dashboard');
}
