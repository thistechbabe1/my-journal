'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { checkinService } from '@/services/checkin-service';
import { DailyCheckIn, IntellectualGrowthLog } from '@/types';

export function useCheckIn(date: string) {
  const { user } = useAuth();
  const [checkIn, setCheckIn] = useState<DailyCheckIn | null>(null);
  const [growthLog, setGrowthLog] = useState<IntellectualGrowthLog | null>(null);
  const [weeklyLogs, setWeeklyLogs] = useState<IntellectualGrowthLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getWeekRange = useCallback(() => {
    const today = new Date(date);
    const day = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
    
    // Calculate Monday of the current week
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(new Date(date).setDate(diff));
    monday.setHours(0, 0, 0, 0);

    // Sunday of the current week
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return {
      mondayStr: monday.toISOString().split('T')[0],
      sundayStr: sunday.toISOString().split('T')[0]
    };
  }, [date]);

  const fetchCheckInData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      // Get daily check-in
      const { data: ciData } = await checkinService.getDailyCheckIn(user.id, date);
      setCheckIn(ciData || null);

      // Get intellectual growth log for the date
      const { data: glData } = await checkinService.getIntellectualGrowthLog(user.id, date);
      setGrowthLog(glData || null);

      // Get weekly growth logs to calculate scorecard
      const { mondayStr, sundayStr } = getWeekRange();
      const { data: wlData } = await checkinService.getWeeklyGrowthLogs(user.id, mondayStr, sundayStr);
      setWeeklyLogs(wlData || []);
    } catch (err: any) {
      setError(err.message || 'Error loading check-in data');
    } finally {
      setLoading(false);
    }
  }, [user, date, getWeekRange]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchCheckInData();
  }, [user, fetchCheckInData]);

  const saveCheckIn = async (payload: Partial<DailyCheckIn>) => {
    if (!user) return { error: 'No authenticated user' };
    try {
      const { data, error } = await checkinService.saveDailyCheckIn(user.id, {
        ...payload,
        date
      });
      if (error) throw error;
      setCheckIn(data);
      return { data, error: null };
    } catch (err: any) {
      return { error: err.message || err };
    }
  };

  const saveGrowthLog = async (rotationType: string, responseText: string) => {
    if (!user) return { error: 'No authenticated user' };
    try {
      const { data, error } = await checkinService.saveIntellectualGrowthLog(user.id, {
        date,
        rotation_type: rotationType,
        response: responseText,
        completed: true
      });
      if (error) throw error;
      setGrowthLog(data);
      
      // Refresh weekly logs
      const { mondayStr, sundayStr } = getWeekRange();
      const { data: wlData } = await checkinService.getWeeklyGrowthLogs(user.id, mondayStr, sundayStr);
      setWeeklyLogs(wlData || []);

      return { data, error: null };
    } catch (err: any) {
      return { error: err.message || err };
    }
  };

  // Calculate consistency scorecard
  const getWeeklyConsistency = () => {
    const days = [
      { key: 'logic', label: 'Logic (Mon)', dayOfWeekIndex: 1 },
      { key: 'reading', label: 'Reading (Tue)', dayOfWeekIndex: 2 },
      { key: 'writing', label: 'Writing (Wed)', dayOfWeekIndex: 3 },
      { key: 'problem-solving', label: 'Problem Solving (Thu)', dayOfWeekIndex: 4 },
      { key: 'creativity', label: 'Creativity (Fri)', dayOfWeekIndex: 5 },
      { key: 'strategy', label: 'Strategy (Sat)', dayOfWeekIndex: 6 },
      { key: 'reflection', label: 'Reflection (Sun)', dayOfWeekIndex: 0 }
    ];

    const todayDate = new Date(date);
    const day = todayDate.getDay();
    const diff = todayDate.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(new Date(date).setDate(diff));

    const scorecard = days.map((d, index) => {
      // Find date for this day of the week
      const targetDate = new Date(monday);
      // If Sunday, add 6 to Monday
      const dayOffset = d.dayOfWeekIndex === 0 ? 6 : d.dayOfWeekIndex - 1;
      targetDate.setDate(monday.getDate() + dayOffset);
      const targetDateStr = targetDate.toISOString().split('T')[0];

      // Check if log completed for this date
      const log = weeklyLogs.find((l) => l.date === targetDateStr && l.completed);
      return {
        ...d,
        dateStr: targetDateStr,
        completed: !!log
      };
    });

    const completedCount = scorecard.filter((s) => s.completed).length;
    const rate = Math.round((completedCount / 7) * 100);

    return {
      scorecard,
      rate
    };
  };

  const weeklyConsistency = getWeeklyConsistency();

  return {
    checkIn,
    growthLog,
    weeklyConsistency,
    loading,
    error,
    refresh: fetchCheckInData,
    saveCheckIn,
    saveGrowthLog
  };
}
