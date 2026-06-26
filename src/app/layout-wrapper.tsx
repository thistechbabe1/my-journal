'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import Sidebar from '@/components/sidebar';
import CommandPalette from '@/components/command-palette';
import { Sparkles } from 'lucide-react';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  // Premium loading screen
  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0B0F19] flex flex-col items-center justify-center text-white z-50">
        <div className="relative flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-sharon-primary flex items-center justify-center text-white shadow-2xl relative overflow-hidden animate-bounce">
            <span className="font-bold text-2xl">S</span>
            <div className="absolute top-0 right-0 w-3 h-3 bg-sharon-accent rounded-full animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="text-sharon-accent animate-spin" size={16} />
            <span className="text-sm font-bold tracking-widest uppercase text-sharon-primary-light">
              Project Sharon
            </span>
          </div>
          <div className="w-48 h-1.5 bg-gray-800 rounded-full overflow-hidden mt-2 border border-gray-700/50">
            <div className="h-full bg-gradient-to-r from-sharon-primary to-sharon-accent rounded-full animate-infinite-scroll" style={{ width: '40%', animation: 'loading-bar 1.5s infinite ease-in-out' }} />
          </div>
        </div>
        <style jsx>{`
          @keyframes loading-bar {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(250%); }
          }
        `}</style>
      </div>
    );
  }

  const isAuthPage = pathname === '/auth';

  // If auth page, render without sidebar layout
  if (isAuthPage) {
    return <div className="min-h-screen flex flex-col bg-background">{children}</div>;
  }

  // If no user (and auth provider is redirecting), show spinner to prevent content flashing
  if (!user) {
    return (
      <div className="fixed inset-0 bg-[#0B0F19] flex items-center justify-center text-white z-50">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sharon-primary" />
      </div>
    );
  }

  // Standard application wrapper layout
  return (
    <div className="min-h-screen flex bg-background text-foreground overflow-hidden">
      {/* Side navigation */}
      <Sidebar />

      {/* Main content pane */}
      <main className="flex-1 h-screen overflow-y-auto px-6 py-8 md:px-10 lg:px-12 scrollbar-thin">
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
          {children}
        </div>
      </main>

      {/* Command search palette */}
      <CommandPalette />
    </div>
  );
}
