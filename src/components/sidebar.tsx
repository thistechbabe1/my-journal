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
  Compass,
  Mail,
  Settings
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export default function Sidebar({ mobileOpen = false, setMobileOpen }: SidebarProps) {
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
    { name: 'Reviews', path: '/reviews', icon: ClipboardList },
    { name: 'Seasons', path: '/seasons', icon: Compass },
    { name: 'Future Letters', path: '/letters', icon: Mail }
  ];

  return (
    <aside
      className={`fixed md:sticky top-0 bottom-0 left-0 h-screen bg-card border-r border-card-border flex flex-col justify-between transition-transform md:transition-all duration-200 z-40 md:z-20 shrink-0 ${
        collapsed ? 'md:w-20' : 'md:w-60'
      } ${
        mobileOpen ? 'translate-x-0 w-60' : '-translate-x-full md:translate-x-0'
      }`}
    >
      {/* Collapse button - Desktop only */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden md:flex absolute -right-3 top-6 w-6 h-6 rounded-full bg-card text-sharon-muted border border-card-border items-center justify-center cursor-pointer hover:bg-sharon-muted-light/60 transition-colors"
      >
        {collapsed ? <ChevronRight size={11} /> : <ChevronLeft size={11} />}
      </button>

      {/* Top Section */}
      <div className="flex flex-col pt-6 overflow-y-auto flex-1">
        {/* Brand Logo */}
        <div className={`flex items-center px-5 mb-6 justify-between gap-3.5 ${collapsed ? 'justify-center' : ''}`}>
          <div className="flex items-center gap-3.5">
            <div className="w-8 h-8 rounded bg-sharon-primary flex items-center justify-center text-background shadow-xs font-serif font-bold text-base select-none">
              S
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-serif font-bold text-lg tracking-wide text-foreground">
                  Sharon
                </span>
              </div>
            )}
          </div>
          
          {/* Close drawer button (Mobile only) */}
          {setMobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-1 rounded-lg text-sharon-muted hover:text-foreground cursor-pointer hover:bg-sharon-muted-light/60 transition-colors"
              aria-label="Close navigation"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Quiet Search button */}
        {!collapsed && (
          <div className="px-4 mb-5">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('toggle-search'))}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-sharon-muted border border-card-border rounded-lg hover:bg-sharon-muted-light/40 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Search size={13} />
                <span>Search...</span>
              </div>
              <kbd className="px-1.5 py-0.5 text-[9px] bg-card border border-card-border rounded text-sharon-muted">
                ⌘K
              </kbd>
            </button>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition-all relative ${
                  isActive
                    ? 'text-sharon-primary bg-sharon-muted-light/50 font-semibold'
                    : 'text-sharon-muted hover:text-foreground hover:bg-sharon-muted-light/30'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.name : ''}
              >
                <Icon size={16} className={isActive ? 'text-sharon-primary' : 'text-sharon-muted'} />
                {!collapsed && <span>{item.name}</span>}
                {isActive && !collapsed && (
                  <div className="absolute right-3 w-1 h-1 rounded-full bg-sharon-primary-light" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-3.5 border-t border-card-border space-y-3.5">
        {/* User Card */}
        <div className={`flex items-center gap-2.5 ${collapsed ? 'justify-center' : 'px-1.5'}`}>
          <img
            src={profile?.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'}
            alt="Sharon"
            className="w-8 h-8 rounded-full border border-card-border object-cover select-none"
          />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-xs truncate text-foreground">{profile?.name || 'Sharon'}</p>
              <p className="text-[9px] font-bold text-sharon-muted tracking-wider uppercase mt-0.5">Sanctuary</p>
            </div>
          )}
        </div>

        {/* Toolbar Controls */}
        <div className={`flex items-center justify-between gap-1.5 ${collapsed ? 'flex-col' : ''}`}>
          {/* Theme Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg text-sharon-muted hover:text-foreground hover:bg-sharon-muted-light/40 transition-all cursor-pointer"
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Sanctuary Settings */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('open-settings'))}
            className="p-2 rounded-lg text-sharon-muted hover:text-foreground hover:bg-sharon-muted-light/40 transition-all cursor-pointer"
            title="Sanctuary Settings"
          >
            <Settings size={16} />
          </button>

          {/* Sign Out */}
          <button
            type="button"
            onClick={signOut}
            className={`p-2 rounded-lg text-sharon-muted hover:text-danger hover:bg-red-500/5 transition-all cursor-pointer flex items-center gap-2 ${
              collapsed ? '' : 'flex-1 justify-center'
            }`}
            title="Log Out"
          >
            <LogOut size={16} />
            {!collapsed && <span className="text-xs font-semibold">Log Out</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
