'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { useTheme } from '@/providers/theme-provider';
import { useIdentity } from '@/hooks/use-identity';
import {
  LayoutDashboard,
  User,
  BookOpen,
  CheckSquare,
  Target,
  ClipboardList,
  LogOut,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Search,
  Sparkles
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { profile } = useIdentity();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Identity', path: '/identity', icon: User },
    { name: 'Journal', path: '/journal', icon: BookOpen },
    { name: 'Habits', path: '/habits', icon: CheckSquare },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'Reviews', path: '/reviews', icon: ClipboardList }
  ];

  return (
    <aside
      className={`relative h-screen bg-card border-r border-card-border flex flex-col justify-between transition-all duration-300 z-20 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-sharon-primary text-white border border-card-border flex items-center justify-center cursor-pointer hover:bg-sharon-primary-light transition-colors"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Top Section */}
      <div className="flex flex-col pt-6 overflow-y-auto flex-1">
        {/* Brand Logo */}
        <div className={`flex items-center px-6 mb-8 gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 rounded-xl bg-sharon-primary flex items-center justify-center text-white shadow-md relative overflow-hidden">
            <span className="font-bold text-lg">S</span>
            <div className="absolute top-0 right-0 w-2 h-2 bg-sharon-accent rounded-full animate-pulse" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-sharon-primary to-sharon-primary-light bg-clip-text text-transparent">
                Sharon
              </span>
              <span className="text-[10px] text-sharon-muted font-medium uppercase tracking-widest">
                Operating System
              </span>
            </div>
          )}
        </div>

        {/* Ctrl+K Search Reminder */}
        {!collapsed && (
          <div className="px-4 mb-6">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('toggle-search'))}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-sharon-muted border border-card-border rounded-lg bg-sharon-muted-light/30 hover:bg-sharon-muted-light/60 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Search size={14} />
                <span>Search system...</span>
              </div>
              <kbd className="px-1.5 py-0.5 text-[9px] bg-card border border-card-border rounded text-sharon-muted">
                Ctrl K
              </kbd>
            </button>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all relative ${
                  isActive
                    ? 'text-sharon-primary bg-sharon-primary-light/10 dark:bg-sharon-primary/20'
                    : 'text-sharon-muted hover:text-foreground hover:bg-sharon-muted-light/50'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.name : ''}
              >
                <Icon size={18} className={isActive ? 'text-sharon-primary' : 'text-sharon-muted'} />
                {!collapsed && <span>{item.name}</span>}
                {isActive && !collapsed && (
                  <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-sharon-accent" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-3 border-t border-card-border space-y-4">
        {/* User Card */}
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : 'px-2'}`}>
          <img
            src={profile?.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'}
            alt="Sharon"
            className="w-10 h-10 rounded-full border border-sharon-primary-light/30 object-cover shadow-sm"
          />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{profile?.name || 'Sharon'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Sparkles size={11} className="text-sharon-accent animate-pulse" />
                <span className="text-[10px] font-bold text-sharon-accent-dark dark:text-sharon-accent bg-sharon-accent/10 px-1.5 py-0.5 rounded">
                  Score {profile?.growth_score ?? 10}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Toolbar Controls */}
        <div className={`flex items-center justify-between gap-1.5 ${collapsed ? 'flex-col' : ''}`}>
          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-sharon-muted hover:text-foreground hover:bg-sharon-muted-light/50 transition-all cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Sign Out */}
          <button
            onClick={signOut}
            className={`p-2 rounded-xl text-sharon-muted hover:text-danger hover:bg-red-500/10 transition-all cursor-pointer flex items-center gap-2 ${
              collapsed ? '' : 'flex-1 justify-center'
            }`}
            title="Log Out"
          >
            <LogOut size={18} />
            {!collapsed && <span className="text-xs font-semibold">Log Out</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
