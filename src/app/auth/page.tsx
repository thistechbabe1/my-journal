'use client';

import React, { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Sparkles, Mail, Lock, CheckCircle, ArrowRight } from 'lucide-react';

export default function AuthPage() {
  const { signIn, signUp, isDemo } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (isSignUp) {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    }

    setLoading(true);
    try {
      const res = isSignUp
        ? await signUp(email, password)
        : await signIn(email, password);
      if (res.error) {
        setError(res.error.message || 'Authentication failed. Check your inputs.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoMode = async () => {
    setError(null);
    setLoading(true);
    try {
      // Sign in using the mock credentials which will write to localStorage session
      await signIn('sharon@growth.com', 'sharon123');
    } catch (err: any) {
      setError(err.message || 'Demo mode bypass failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-[#0B0F19] text-white">
      {/* Left pane: Inspiring brand section */}
      <div className="hidden lg:flex lg:col-span-7 bg-gradient-to-tr from-[#1E1145] via-[#0F0A24] to-[#0A0718] flex-col justify-between p-12 relative overflow-hidden border-r border-gray-800/50">
        {/* Decorative background shapes */}
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-sharon-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-sharon-primary-light/5 blur-[100px]" />
        <div className="absolute top-[30%] left-[20%] w-[300px] h-[300px] rounded-full bg-sharon-accent/5 blur-[80px]" />

        {/* Brand logo */}
        <div className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 rounded-2xl bg-sharon-primary flex items-center justify-center text-white shadow-2xl relative overflow-hidden">
            <span className="font-bold text-xl">S</span>
            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-sharon-accent rounded-full animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-sharon-primary to-sharon-primary-light bg-clip-text text-transparent">
              PROJECT SHARON
            </span>
            <span className="text-[9px] text-gray-500 font-semibold tracking-widest uppercase">
              Personal Operating System
            </span>
          </div>
        </div>

        {/* Vision notes */}
        <div className="my-auto max-w-lg z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sharon-primary/20 border border-sharon-primary/30 text-sharon-primary-light text-xs font-semibold">
            <Sparkles size={12} className="text-sharon-accent" />
            <span>Designed for 5-10 Years of Intentional Growth</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
            Become the most conscious version of yourself.
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Project Sharon is your personal growth headquarters. A structured space for core identity discovery, daily journaling, habits integration, life reviews, and vision mapping.
          </p>
          <div className="space-y-3 pt-4">
            {[
              'Protected by Row Level Security (RLS)',
              'Scalable Supabase Auth and Database architecture',
              'Life balance wheel and analytics visualization',
              'Command palette Ctrl+K search system'
            ].map((text, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs text-gray-300">
                <CheckCircle size={14} className="text-sharon-accent shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-[10px] text-gray-500 font-medium z-10 flex items-center justify-between">
          <span>PROJECT SHARON V1.0</span>
          <span>© {new Date().getFullYear()} ALL RIGHTS RESERVED</span>
        </div>
      </div>

      {/* Right pane: Auth Form */}
      <div className="lg:col-span-5 flex flex-col justify-center p-8 sm:p-12 md:p-16 relative bg-[#090D16]">
        <div className="max-w-md w-full mx-auto space-y-8">
          {/* Header */}
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">
              {isSignUp ? 'Create your growth account' : 'Welcome back, Sharon'}
            </h2>
            <p className="text-sm text-gray-400">
              {isSignUp
                ? 'Begin your intentional growth journey today'
                : 'Sign in to access your personal growth dashboard'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    placeholder="sharon@growth.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#111622] border border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-sharon-primary outline-none transition-colors text-white"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#111622] border border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-sharon-primary outline-none transition-colors text-white"
                  />
                </div>
              </div>

              {/* Confirm Password (Sign Up only) */}
              {isSignUp && (
                <div className="space-y-1.5 animate-slide-down">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                      <Lock size={16} />
                    </div>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-[#111622] border border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-sharon-primary outline-none transition-colors text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-sharon-primary hover:bg-sharon-primary-light text-white font-semibold text-sm transition-all shadow-lg shadow-sharon-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isSignUp ? 'Sign Up' : 'Sign In'}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              {/* Demo Mode Button */}
              {isDemo && (
                <button
                  type="button"
                  onClick={handleDemoMode}
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sharon-accent/20 to-sharon-primary/20 hover:from-sharon-accent/35 hover:to-sharon-primary/35 border border-sharon-accent/30 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Explore in Demo Mode</span>
                  <Sparkles size={14} className="text-sharon-accent animate-pulse" />
                </button>
              )}
            </div>
          </form>

          {/* Form Switcher */}
          <div className="text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-xs text-sharon-primary-light hover:text-white transition-colors cursor-pointer"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
