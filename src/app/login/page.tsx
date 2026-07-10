'use client';

import React, { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import Link from 'next/link';
import { Sparkles, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { signIn, isDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await signIn(email, password);
      if (res.error) {
        setError(res.error.message || 'Authentication failed. Check your credentials.');
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
      await signIn('sharon@growth.com', 'sharon123');
    } catch (err: any) {
      setError(err.message || 'Demo mode bypass failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-[#121A16] via-[#1E2E25] to-[#121A16] px-4 py-12 relative overflow-hidden font-sans">
      {/* Decorative blurry backgrounds */}
      <div className="absolute -top-[10%] -right-[10%] w-[350px] h-[350px] rounded-full bg-white/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-[10%] -left-[10%] w-[300px] h-[300px] rounded-full bg-white/5 blur-2xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="bg-card/90 dark:bg-card/75 border border-card-border/60 shadow-2xl rounded-2xl p-8 sm:p-10 max-w-md w-full text-center space-y-7 backdrop-blur-md relative z-10">
        
        {/* Brand Monogram */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#5C7465] flex items-center justify-center text-[#FAF7F2] font-serif font-bold text-lg shadow-sm select-none">
            S
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-serif font-medium text-foreground tracking-wide">
              Welcome back
            </h2>
            <p className="text-xs text-sharon-muted leading-relaxed font-sans">
              Sign in to your personal operating space
            </p>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3.5 rounded-lg bg-danger/10 border border-danger/30 text-danger text-xs font-semibold text-left">
              {error}
            </div>
          )}

          <div className="space-y-4 text-left">
            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-sharon-muted">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sharon-muted">
                  <Mail size={14} />
                </div>
                <input
                  type="email"
                  placeholder="sharon@growth.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-sharon-muted-light/35 border border-card-border/60 rounded-lg py-2.5 pl-9 pr-4 text-xs focus:border-sharon-primary outline-none transition-colors text-foreground font-semibold"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-sharon-muted">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sharon-muted">
                  <Lock size={14} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-sharon-muted-light/35 border border-card-border/60 rounded-lg py-2.5 pl-9 pr-10 text-xs focus:border-sharon-primary outline-none transition-colors text-foreground font-semibold"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-sharon-muted hover:text-foreground cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-sharon-primary hover:bg-sharon-primary-light text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={13} />
                </>
              )}
            </button>

            {/* Demo Button */}
            {isDemo && (
              <button
                type="button"
                onClick={handleDemoMode}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg border border-sharon-primary text-sharon-primary hover:bg-sharon-muted-light/60 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Explore in Demo Mode</span>
                <Sparkles size={12} className="text-sharon-accent animate-pulse" />
              </button>
            )}
          </div>
        </form>

        {/* Footer Navigation */}
        <div className="text-center pt-2">
          <Link
            href="/register"
            className="text-xs text-sharon-primary hover:text-sharon-primary-light transition-colors cursor-pointer font-semibold"
          >
            Don't have an account? Register Space
          </Link>
        </div>
      </div>
    </div>
  );
}
