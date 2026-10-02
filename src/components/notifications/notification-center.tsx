'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Check, Trash2, ExternalLink } from 'lucide-react';
import { useNotifications } from '@/hooks/use-notifications';

export function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    clearNotification
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'unread' | 'all'>('unread');
  const panelRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const displayedNotifications = filter === 'unread'
    ? notifications.filter((n) => !n.is_read)
    : notifications;

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg text-sharon-muted hover:text-foreground hover:bg-sharon-muted-light/40 transition-all cursor-pointer relative"
        title="Notifications & Reminders"
        aria-label="Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Drawer Popover */}
      {isOpen && (
        <div className="absolute right-0 top-11 w-80 sm:w-96 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden font-sans animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-100">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-extrabold border border-rose-500/30">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] font-semibold text-sharon-primary hover:text-sharon-primary transition-colors flex items-center gap-1"
              >
                <Check size={12} />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center border-b border-slate-800/80 bg-slate-950 px-4 pt-2 gap-4">
            <button
              onClick={() => setFilter('unread')}
              className={`pb-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                filter === 'unread'
                  ? 'border-teal-400 text-sharon-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`pb-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                filter === 'all'
                  ? 'border-teal-400 text-sharon-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              All ({notifications.length})
            </button>
          </div>

          {/* Notification Items List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-800/60">
            {loading ? (
              <div className="py-8 text-center text-slate-500 text-xs font-mono animate-pulse">
                Loading notifications...
              </div>
            ) : displayedNotifications.length === 0 ? (
              <div className="py-10 px-4 text-center space-y-1">
                <p className="text-xs font-semibold text-slate-300">🎉 All caught up!</p>
                <p className="text-[11px] text-slate-500">
                  {filter === 'unread' ? 'No unread notifications right now.' : 'Notification history is clean.'}
                </p>
              </div>
            ) : (
              displayedNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 space-y-2 transition-colors ${
                    notif.is_read ? 'bg-slate-950/40 opacity-75' : 'bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded border ${
                        notif.tier === 'immediate'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-amber-500/20 text-sharon-primary border-amber-500/30'
                      }`}>
                        {notif.tier === 'immediate' ? '🔴 Immediate' : '🟠 High'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {notif.notification_date}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {!notif.is_read && (
                        <button
                          onClick={() => markAsRead(notif.id)}
                          className="p-1 text-slate-500 hover:text-sharon-primary rounded transition-colors"
                          title="Mark read"
                        >
                          <Check size={12} />
                        </button>
                      )}
                      <button
                        onClick={() => clearNotification(notif.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                        title="Clear notification"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-slate-100">{notif.title}</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{notif.message}</p>
                  </div>

                  {notif.rationale && notif.rationale.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {notif.rationale.map((r, idx) => (
                        <span key={idx} className="text-[9px] text-sharon-primary bg-teal-950/60 px-1.5 py-0.5 rounded border border-teal-900/40">
                          {r}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="pt-1 flex items-center justify-end">
                    <Link
                      href={notif.action_url}
                      onClick={() => setIsOpen(false)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-sharon-primary hover:text-teal-200 bg-sharon-primary/20 hover:bg-sharon-primary/30 px-2.5 py-1 rounded border border-teal-500/40 transition-colors"
                    >
                      <span>[{notif.action_label}]</span>
                      <ExternalLink size={10} />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
