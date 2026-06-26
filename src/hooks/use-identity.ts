'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { identityService } from '@/services/identity-service';
import { profileService } from '@/services/profile-service';
import { PersonalIdentity, LifeArea, UserProfile } from '@/types';

export function useIdentity() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [identity, setIdentity] = useState<PersonalIdentity | null>(null);
  const [lifeAreas, setLifeAreas] = useState<LifeArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIdentityData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [profRes, identRes, areasRes] = await Promise.all([
        profileService.getProfile(user.id),
        identityService.getIdentity(user.id),
        identityService.getLifeAreas(user.id)
      ]);

      if (profRes.error) throw new Error(profRes.error.message || 'Profile fetch error');
      setProfile(profRes.data);

      // Identity might not exist yet, which is fine
      setIdentity(identRes.data);

      if (areasRes.error) throw new Error(areasRes.error.message || 'Life areas fetch error');
      setLifeAreas(areasRes.data || []);
    } catch (err: any) {
      setError(err.message || 'Error loading identity data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchIdentityData();
  }, [fetchIdentityData]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: 'No authenticated user' };
    setError(null);
    try {
      const { data, error } = await profileService.updateProfile(user.id, updates);
      if (error) throw error;
      setProfile(data);
      return { data, error: null };
    } catch (err: any) {
      return { error: err.message || err };
    }
  };

  const updateIdentity = async (updates: Partial<PersonalIdentity>) => {
    if (!user) return { error: 'No authenticated user' };
    setError(null);
    try {
      const { data, error } = await identityService.saveIdentity(user.id, updates);
      if (error) throw error;
      setIdentity(data);
      return { data, error: null };
    } catch (err: any) {
      return { error: err.message || err };
    }
  };

  const updateLifeAreaRating = async (name: string, score: number, notes: string | null = null) => {
    if (!user) return { error: 'No authenticated user' };
    setError(null);
    try {
      const { data, error } = await identityService.updateLifeArea(user.id, name, score, notes);
      if (error) throw error;
      
      // Update local state
      setLifeAreas((prev) => {
        const idx = prev.findIndex((a) => a.name === name);
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = data!;
          return next;
        }
        return [...prev, data!].sort((a, b) => a.name.localeCompare(b.name));
      });

      // Award 2 points to Growth Score for rating adjustments
      await profileService.incrementGrowthScore(user.id, 2);
      const updatedProfile = await profileService.getProfile(user.id);
      if (updatedProfile.data) setProfile(updatedProfile.data);

      return { data, error: null };
    } catch (err: any) {
      return { error: err.message || err };
    }
  };

  return {
    profile,
    identity,
    lifeAreas,
    loading,
    error,
    refresh: fetchIdentityData,
    updateProfile,
    updateIdentity,
    updateLifeAreaRating
  };
}
