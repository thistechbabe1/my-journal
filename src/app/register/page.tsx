'use client';

import React, { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import Link from 'next/link';
import { Sparkles, Mail, Lock, CheckCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const { signUp, isDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verificationRequired, setVerificationRequired] = useState(false);

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
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await signUp(email, password);
      if (res.error) {
        setError(res.error.message || 'Registration failed. Check your inputs.');
      } else if (!res.session) {
        // Registration succeeded, but session is null - email confirmation is required!
        setVerificationRequired(true);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 overflow-y-auto bg-background text-foreground font-sans">
      
      {/* Left pane: Inspiring brand section */}
      <div className="hidden lg:flex lg:col-span-6 bg-[#5C7465] text-[#FAF7F2] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-[10%] -right-[10%] w-[450px] h-[450px] rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[350px] h-[350px] rounded-full bg-white/5 blur-2xl pointer-events-none" />

        <div className="flex items-center gap-3 z-10">
          <div className="w-8 h-8 rounded bg-[#FAF7F2] flex items-center justify-center text-[#5C7465] font-serif font-bold text-base shadow-sm">
            S
          </div>
          <div className="flex flex-col text-left">
            <span className="font-serif font-bold text-base tracking-wide uppercase">
              Sharon
            </span>
            <span className="text-[8px] text-[#FAF7F2]/60 font-semibold tracking-widest uppercase">
              Sanctuary Operating System
            </span>
          </div>
        </div>

        <div className="my-auto max-w-md z-10 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#FAF7F2] text-[10px] font-bold uppercase tracking-wider">
            <Sparkles size={11} className="text-[#EAE6E1]" />
            <span>Built for Intentional Growth & Legacy</span>
          </div>
          <h1 className="text-3xl xl:text-4xl font-serif font-light leading-tight tracking-wide text-white">
            A quiet sanctuary for your thoughts and progress.
          </h1>
          <p className="text-[#FAF7F2]/80 text-xs leading-relaxed font-normal font-sans">
            Project Sharon decouples emotional processing from long-term curation. A private, distraction-free space for core identity discovery, rhythms tracking, and legacy archiving.
          </p>
          <div className="space-y-3 pt-3">
            {[
              'Protected by Supabase Row Level Security (RLS)',
              'Secure local storage credentials integration',
              'Visual life balance areas & rhythmic trackers',
              'AI speech-to-text dictation mapping your writing style'
            ].map((text, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs text-[#FAF7F2]/90">
                <CheckCircle size={13} className="text-white/80 shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-[9px] text-[#FAF7F2]/50 font-bold uppercase tracking-widest z-10 flex items-center justify-between">
          <span>Sharon Sanctuary</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>

      {/* Right pane: Register Form / Verification Box */}
      <div className="lg:col-span-6 flex flex-col justify-center px-6 py-12 sm:p-16 md:p-20 relative bg-background">
        <div className="max-w-sm w-full mx-auto space-y-8">
          
          {verificationRequired ? (
            <div className="text-center space-y-6 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-[#5C7465]/10 text-[#5C7465] flex items-center justify-center mx-auto">
                <Mail size={28} />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-serif font-medium text-foreground tracking-wide">
                  Verify your email
                </h2>
                <p className="text-xs text-sharon-muted leading-relaxed font-sans">
                  We've sent an activation link to <strong className="text-foreground">{email}</strong>. 
                  Please click the link in that email to verify your email address and activate your account.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="w-full inline-block text-center py-2 px-4 rounded-lg bg-[#5C7465] hover:bg-[#5C7465]/90 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center lg:text-left space-y-1.5">
                <h2 className="text-3xl font-serif font-medium text-foreground tracking-wide">
                  Establish your sanctuary
                </h2>
                <p className="text-xs text-sharon-muted leading-relaxed font-sans">
                  Begin your intentional growth journey today
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3.5 rounded-lg bg-danger/10 border border-danger/30 text-danger text-xs font-semibold text-left">
                    {error}
                  </div>
                )}

                <div className="space-y-4 text-left">
                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-sharon-muted">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sharon-muted">
                        <Mail size={14} />
                      </div>
                      <input
                        type="email"
                        placeholder="sharon@growth.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg py-2 pl-9 pr-4 text-xs focus:border-sharon-primary outline-none transition-colors text-foreground font-semibold"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-sharon-muted">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sharon-muted">
                        <Lock size={14} />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg py-2 pl-9 pr-10 text-xs focus:border-sharon-primary outline-none transition-colors text-foreground font-semibold"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sharon-muted hover:text-foreground cursor-pointer transition-colors"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-sharon-muted">Confirm Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sharon-muted">
                        <Lock size={14} />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg py-2 pl-9 pr-10 text-xs focus:border-sharon-primary outline-none transition-colors text-foreground font-semibold"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sharon-muted hover:text-foreground cursor-pointer transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 px-4 rounded-lg bg-sharon-primary hover:bg-sharon-primary-light text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Sign Up</span>
                        <ArrowRight size={13} />
                      </>
                    )}
                  </button>
                </div>
              </form>

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
    </div>
  );
}
