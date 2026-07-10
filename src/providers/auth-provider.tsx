'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: any | null;
  session: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any; session: any | null }>;
  signOut: () => Promise<void>;
  isDemo: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if running on real supabase or mock
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    setIsDemo(!supabaseUrl || !supabaseAnonKey);

    // Get session
    supabase.auth.getSession().then((res: any) => {
      const session = res.data?.session;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      const isAuthRoute = pathname === '/login' || pathname === '/register';
      // Redirect logic: if no user and not on auth pages, redirect to login
      if (!session && !isAuthRoute) {
        router.push('/login');
      }
    });

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      const isAuthRoute = pathname === '/login' || pathname === '/register';
      if (session) {
        if (isAuthRoute) {
          router.push('/');
        }
      } else if (!isAuthRoute) {
        router.push('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setLoading(false);
        return { error };
      }
      setSession(data.session);
      setUser(data.user);
      router.push('/');
      return { error: null };
    } catch (err: any) {
      setLoading(false);
      return { error: err.message || err };
    }
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setLoading(false);
        return { error, session: null };
      }
      setSession(data.session);
      setUser(data.user);
      
      // If a session is established immediately (e.g. email confirmation disabled), redirect
      if (data.session) {
        router.push('/');
      } else {
        setLoading(false);
      }
      return { error: null, session: data.session };
    } catch (err: any) {
      setLoading(false);
      return { error: err.message || err, session: null };
    }
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setLoading(false);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut, isDemo }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
