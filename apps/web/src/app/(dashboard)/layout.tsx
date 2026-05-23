'use client';

// ─── Dashboard Layout ─────────────────────────────────────────────────────────
// Shell layout for all dashboard routes.
// Includes sidebar navigation, top bar, auth guard, and sign-out.

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { subscribeToAuthState, signOutUser } from '@/lib/firebase/auth';
import type { User } from 'firebase/auth';

const NAV_ITEMS = [
  {
    href: '/dashboard',
    label: 'Live Dashboard',
    icon: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z',
    id: 'nav-dashboard',
  },
  {
    href: '/incidents',
    label: 'Incident Command',
    icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
    id: 'nav-incidents',
  },
  {
    href: '/ai-console',
    label: 'AI Console',
    icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z',
    id: 'nav-ai-console',
  },
  {
    href: '/audit',
    label: 'Audit Logs',
    icon: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z',
    id: 'nav-audit',
  },
  {
    href: '/simulation',
    label: 'Simulation',
    icon: 'M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z',
    id: 'nav-simulation',
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null | 'loading'>('loading');

  // Auth guard
  useEffect(() => {
    const unsub = subscribeToAuthState((u) => {
      setUser(u);
      if (!u) {
        router.replace('/login');
      }
    });
    return unsub;
  }, [router]);

  const handleSignOut = async () => {
    try {
      await signOutUser();
      router.replace('/login');
    } catch (err) {
      console.error('Sign-out failed:', err);
    }
  };

  // Show loading splash while determining auth state
  if (user === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-base">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Not authenticated — router.replace() will redirect; render nothing
  if (!user) return null;

  return (
    <div className="flex h-screen bg-surface-base overflow-hidden">
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside
        className="w-64 flex-shrink-0 bg-surface-raised border-r border-surface-border flex flex-col"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-surface-border">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-100 leading-tight">StadiumOps AI</p>
            <p className="text-xs text-slate-500">APL Grand Final</p>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Dashboard navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            return (
              <a
                key={item.href}
                href={item.href}
                id={item.id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                  isActive
                    ? 'bg-brand-500/15 border border-brand-500/25 text-slate-100'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-surface-overlay border border-transparent'
                }`}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <svg
                  className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-brand-400' : 'group-hover:text-brand-400'}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                </svg>
                <span className="text-sm font-medium">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1 h-4 rounded-full bg-brand-500" />
                )}
              </a>
            );
          })}
        </nav>

        {/* User + Footer */}
        <div className="px-5 py-4 border-t border-surface-border space-y-2">
          {user && typeof user !== 'string' && (
            <div className="flex items-center gap-2 mb-2">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center text-[10px] text-white font-bold">
                  {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                </div>
              )}
              <p className="text-xs text-slate-400 truncate">{user.displayName || user.email}</p>
            </div>
          )}
          <p className="text-xs text-slate-600">© 2026 StadiumOps AI</p>
          <p className="text-xs text-slate-600">v0.1.0 — APL Grand Final MVP</p>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex-shrink-0 h-14 bg-surface-raised border-b border-surface-border flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" aria-label="System online" />
            <span className="text-xs text-slate-400">Live Operations</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500" id="current-time">
              APL Grand Final 2026
            </span>
            <button
              id="btn-sign-out"
              onClick={handleSignOut}
              className="btn-ghost py-1.5 text-xs"
              aria-label="Sign out"
            >
              Sign out
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6" role="main">
          {children}
        </main>
      </div>
    </div>
  );
}
