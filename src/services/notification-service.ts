import { supabase } from '@/lib/supabase';
import { AttentionItem, NotificationItem } from '@/types';
import { getLocalDateStr } from '@/lib/date-utils';

const LOCAL_NOTIFS_KEY = 'sharon_local_notifications_v1';

// Local storage fallback helpers
const getLocalNotifs = (): NotificationItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_NOTIFS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalNotifs = (items: NotificationItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_NOTIFS_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('Failed saving local notifications', e);
  }
};

export const notificationService = {
  /**
   * Sync and generate daily notifications from active Attention Feed items.
   * Deduplication rule: Max 1 notification per entity condition per day.
   */
  async syncDailyNotifications(
    userId: string,
    attentionItems: AttentionItem[]
  ): Promise<NotificationItem[]> {
    const todayStr = getLocalDateStr();

    // Filter items that qualify for notifications (Immediate & High priority items)
    const qualifyingItems = attentionItems.filter(
      (item) => !item.is_dismissed && (item.tier === 'immediate' || item.tier === 'high')
    );

    if (qualifyingItems.length === 0) {
      return this.getNotifications(userId);
    }

    try {
      // 1. Fetch existing notifications for today to perform deduplication check
      const { data: existing, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('notification_date', todayStr);

      if (error) {
        // If table doesn't exist yet in remote Supabase schema cache, use local storage fallback
        return this.syncLocalDailyNotifications(userId, qualifyingItems, todayStr);
      }

      const existingKeys = new Set(
        (existing || []).map((n: any) => `${n.entity_type}:${n.entity_id}:${n.notification_date}`)
      );

      // Prepare new entries that don't exist yet today
      const newEntries = qualifyingItems
        .filter((item) => !existingKeys.has(`${item.entity_type}:${item.entity_id}:${todayStr}`))
        .map((item) => ({
          user_id: userId,
          entity_type: item.entity_type,
          entity_id: item.entity_id,
          title: item.title,
          message: item.subtitle || `${item.tier.toUpperCase()} priority attention required`,
          rationale: item.rationale,
          tier: item.tier,
          action_url: item.action_url,
          action_label: item.action_label,
          is_read: false,
          notification_date: todayStr
        }));

      if (newEntries.length > 0) {
        await supabase.from('notifications').insert(newEntries);
      }

      return this.getNotifications(userId);
    } catch {
      return this.syncLocalDailyNotifications(userId, qualifyingItems, todayStr);
    }
  },

  /**
   * Local storage fallback sync for offline / dev environments
   */
  syncLocalDailyNotifications(
    userId: string,
    qualifyingItems: AttentionItem[],
    todayStr: string
  ): NotificationItem[] {
    const allLocal = getLocalNotifs();
    const existingKeys = new Set(
      allLocal
        .filter((n) => n.user_id === userId)
        .map((n) => `${n.entity_type}:${n.entity_id}:${n.notification_date}`)
    );

    const newLocalItems: NotificationItem[] = qualifyingItems
      .filter((item) => !existingKeys.has(`${item.entity_type}:${item.entity_id}:${todayStr}`))
      .map((item) => ({
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        user_id: userId,
        entity_type: item.entity_type,
        entity_id: item.entity_id,
        title: item.title,
        message: item.subtitle || `${item.tier.toUpperCase()} priority attention required`,
        rationale: item.rationale,
        tier: item.tier,
        action_url: item.action_url,
        action_label: item.action_label,
        is_read: false,
        notification_date: todayStr,
        created_at: new Date().toISOString()
      }));

    if (newLocalItems.length > 0) {
      const updated = [...newLocalItems, ...allLocal];
      saveLocalNotifs(updated);
      return updated.filter((n) => n.user_id === userId);
    }

    return allLocal.filter((n) => n.user_id === userId);
  },

  /**
   * Fetch all notifications for user
   */
  async getNotifications(userId: string): Promise<NotificationItem[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as NotificationItem[];
      }
    } catch {
      // Fallback
    }

    return getLocalNotifs().filter((n) => n.user_id === userId);
  },

  /**
   * Mark a single notification as read
   */
  async markAsRead(userId: string, notificationId: string): Promise<void> {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', userId);
    } catch {
      // Fallback
    }

    const local = getLocalNotifs().map((n) =>
      n.id === notificationId && n.user_id === userId ? { ...n, is_read: true } : n
    );
    saveLocalNotifs(local);
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);
    } catch {
      // Fallback
    }

    const local = getLocalNotifs().map((n) =>
      n.user_id === userId ? { ...n, is_read: true } : n
    );
    saveLocalNotifs(local);
  },

  /**
   * Clear / Delete a notification
   */
  async clearNotification(userId: string, notificationId: string): Promise<void> {
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', userId);
    } catch {
      // Fallback
    }

    const local = getLocalNotifs().filter((n) => !(n.id === notificationId && n.user_id === userId));
    saveLocalNotifs(local);
  }
};
