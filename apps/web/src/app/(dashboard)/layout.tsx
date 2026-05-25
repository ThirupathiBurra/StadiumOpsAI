'use client';

// ─── Dashboard Layout ─────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { subscribeToAuthState, signOutUser } from '@/lib/firebase/auth';
import type { User } from 'firebase/auth';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Live Dashboard', icon: 'dashboard', id: 'nav-dashboard' },
  { href: '/incidents', label: 'Incident Command', icon: 'crisis_alert', id: 'nav-incidents' },
  { href: '/ai-console', label: 'AI Intelligence Hub', icon: 'memory', id: 'nav-ai-console' },
  { href: '/audit', label: 'Audit Logs', icon: 'manage_search', id: 'nav-audit' },
  { href: '/simulation', label: 'Simulation', icon: 'sports_esports', id: 'nav-simulation' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null | 'loading'>('loading');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const unsub = subscribeToAuthState((u) => {
      setUser(u);
      if (!u) router.replace('/login');
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

  if (user === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin glow-emerald" />
          <p className="text-xs text-outline-variant font-mono uppercase tracking-widest animate-pulse">Initializing UI...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      {/* Vignette Overlay (Cosmic Cyber-Zen feel) */}
      <div className="vignette" />

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside
        className={`flex-shrink-0 bg-surface-container-lowest/80 backdrop-blur-md border-r border-glass-border flex flex-col transition-all duration-300 ease-in-out z-10 ${sidebarOpen ? 'w-64' : 'w-20'}`}
        aria-label="Main navigation"
      >
        <div className="flex items-center gap-3 px-5 py-6 border-b border-glass-border">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center glow-emerald">
            <span className="material-symbols-outlined text-primary text-[20px]">stadium</span>
          </div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-on-surface leading-tight tracking-tight" style={{ fontFamily: 'Geist, sans-serif' }}>StadiumOps AI</p>
              <p className="text-[10px] text-primary font-mono uppercase tracking-widest mt-0.5">Command Center</p>
            </div>
          )}
          <button
            id="btn-toggle-sidebar"
            onClick={() => setSidebarOpen(v => !v)}
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-outline-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <span className="material-symbols-outlined text-[18px]">
              {sidebarOpen ? 'keyboard_double_arrow_left' : 'keyboard_double_arrow_right'}
            </span>
          </button>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto custom-scrollbar" aria-label="Dashboard navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            return (
              <a
                key={item.href}
                href={item.href}
                id={item.id}
                className={`flex items-center gap-4 px-3 py-3 rounded-lg transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-primary/10 border-transparent text-primary'
                    : 'text-outline hover:text-on-surface hover:bg-surface-container border-transparent'
                }`}
                aria-label={item.label}
                title={!sidebarOpen ? item.label : undefined}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r bg-primary glow-emerald" />
                )}
                <span className={`material-symbols-outlined text-[20px] transition-colors ${isActive ? 'text-primary' : 'group-hover:text-primary'}`}>
                  {item.icon}
                </span>
                {sidebarOpen && (
                  <span className={`text-[13px] font-semibold tracking-wide ${isActive ? 'text-on-surface' : ''}`}>
                    {item.label}
                  </span>
                )}
              </a>
            );
          })}
        </nav>

        <div className={`px-5 py-5 border-t border-glass-border space-y-3 bg-surface-container-low/50 ${sidebarOpen ? '' : 'items-center flex flex-col'}`}>
          {user && typeof user !== 'string' && (
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full ring-2 ring-primary/20" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-surface-container border border-glass-border flex items-center justify-center text-[12px] text-primary font-bold">
                  {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                </div>
              )}
              {sidebarOpen && (
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-on-surface truncate">{user.displayName || user.email}</p>
                  <p className="text-[10px] text-primary font-mono uppercase tracking-wider">Commander</p>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden z-10 relative">
        <header className="flex-shrink-0 h-16 bg-surface-container-lowest/80 backdrop-blur-md border-b border-glass-border flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(v => !v)}
              className="p-2 rounded-lg text-outline-variant hover:text-on-surface hover:bg-surface-container transition-colors md:hidden"
            >
              <span className="material-symbols-outlined text-[20px]">menu</span>
            </button>
            <div className="pulse-indicator w-2 h-2 rounded-full bg-primary" />
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-primary">System Online</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-outline-variant font-mono uppercase tracking-widest hidden sm:block">
              {new Date().toISOString().split('T')[0]} | LOC
            </span>
            <button
              id="btn-sign-out"
              onClick={handleSignOut}
              className="btn-ghost py-1.5 px-3 text-xs flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span>Sign out</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8" role="main">
          {children}
        </main>
      </div>
    </div>
  );
}
