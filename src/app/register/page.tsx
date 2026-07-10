'use client';

import React, { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const res = await signUp(email, password);
      if (res.error) {
        setError(res.error.message || 'Registration failed.');
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
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
        
        {success ? (
          <div className="space-y-6 py-4">
            <div className="w-12 h-12 rounded-full bg-[#5C7465]/10 border border-[#5C7465]/20 flex items-center justify-center mx-auto text-[#5C7465]">
              <CheckCircle2 size={24} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-serif font-medium text-foreground tracking-wide">
                Space Registered
              </h2>
              <p className="text-xs text-sharon-muted leading-relaxed font-sans max-w-xs mx-auto">
                Your account was created successfully. Please check your email to verify your address, then click below to sign in.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-sharon-primary hover:bg-sharon-primary-light text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                <span>Go to Sign In</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Brand Monogram */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded bg-[#5C7465] flex items-center justify-center text-[#FAF7F2] font-serif font-bold text-lg shadow-sm select-none">
                S
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-serif font-medium text-foreground tracking-wide">
                  Create space
                </h2>
                <p className="text-xs text-sharon-muted leading-relaxed font-sans">
                  Initialize your private growth operating system
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

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-sharon-muted">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sharon-muted">
                      <Lock size={14} />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-sharon-muted-light/35 border border-card-border/60 rounded-lg py-2.5 pl-9 pr-10 text-xs focus:border-sharon-primary outline-none transition-colors text-foreground font-semibold"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-sharon-muted hover:text-foreground cursor-pointer transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
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
                      <span>Register Space</span>
                      <ArrowRight size={13} />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Footer Navigation */}
            <div className="text-center pt-2">
              <Link
                href="/login"
                className="text-xs text-sharon-primary hover:text-sharon-primary-light transition-colors cursor-pointer font-semibold"
              >
                Already have an account? Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
