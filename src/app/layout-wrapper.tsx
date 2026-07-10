'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import Sidebar from '@/components/sidebar';
import CommandPalette from '@/components/command-palette';
import JournalSettings from '@/components/editorial/JournalSettings';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  // Listen to global open-settings trigger
  useEffect(() => {
    const handleOpen = () => setIsSettingsOpen(true);
    window.addEventListener('open-settings', handleOpen);
    return () => window.removeEventListener('open-settings', handleOpen);
  }, []);

  // Clean, editorial loading screen
  if (loading) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center text-foreground z-50">
        <div className="flex flex-col items-center gap-3">
          <span className="font-serif text-3xl font-light tracking-wide text-foreground">Sharon</span>
          <span className="text-[10px] uppercase tracking-widest text-sharon-muted font-bold tracking-widest animate-pulse">
            Preparing your space
          </span>
        </div>
      </div>
    );
  }

  const isAuthPage = pathname === '/login' || pathname === '/register';

  // If auth page, render without sidebar layout
  if (isAuthPage) {
    return <div className="min-h-screen flex flex-col bg-background">{children}</div>;
  }

  // If no user (and auth provider is redirecting), show clean spinner to prevent content flashing
  if (!user) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center text-foreground z-50">
        <div className="w-6 h-6 border-2 border-sharon-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground overflow-hidden">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-5 py-3.5 bg-card border-b border-card-border sticky top-0 z-30">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="p-1 -ml-1 rounded-lg hover:bg-sharon-muted-light/60 text-sharon-muted hover:text-foreground cursor-pointer transition-colors"
          aria-label="Open navigation"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <span className="font-serif text-xl font-medium tracking-wide text-foreground">Sharon</span>
        <div className="w-6" /> {/* Balance space */}
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="md:hidden fixed inset-0 bg-black/25 backdrop-blur-xs z-30 transition-opacity duration-200"
        />
      )}

      {/* Side navigation */}
      <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />

      {/* Main content pane */}
      <main className="flex-1 h-[calc(100vh-53px)] md:h-screen overflow-y-auto px-4 py-6 md:px-8 lg:px-12 md:py-8 scrollbar-thin">
        <div className="max-w-5xl mx-auto w-full space-y-8 animate-fade-in">
          {children}
        </div>
      </main>

      {/* Command search palette */}
      <CommandPalette />

      {/* Sanctuary Settings global modal */}
      <JournalSettings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
