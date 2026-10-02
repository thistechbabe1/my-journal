'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useAttention } from '@/hooks/use-attention';
import { notificationService } from '@/services/notification-service';
import { NotificationItem } from '@/types';

export function useNotifications() {
  const { user } = useAuth();
  const { attentionFeed } = useAttention();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAndSync = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const synced = await notificationService.syncDailyNotifications(user.id, attentionFeed);
      setNotifications(synced);
    } catch (e) {
      console.warn('Error syncing notifications:', e);
    } finally {
      setLoading(false);
    }
  }, [user, attentionFeed]);

  useEffect(() => {
    fetchAndSync();
  }, [fetchAndSync]);

  const markAsRead = async (id: string) => {
    if (!user) return;
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    await notificationService.markAsRead(user.id, id);
  };

  const markAllAsRead = async () => {
    if (!user) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await notificationService.markAllAsRead(user.id);
  };

  const clearNotification = async (id: string) => {
    if (!user) return;
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await notificationService.clearNotification(user.id, id);
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    clearNotification,
    refreshNotifications: fetchAndSync
  };
}
