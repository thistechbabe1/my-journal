'use client';

import React, { useState, useEffect } from 'react';
import { X, Key, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../feedback/ToastProvider';
import ActionButton from './ActionButton';
import FieldLabel from './FieldLabel';

interface JournalSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function JournalSettings({ isOpen, onClose }: JournalSettingsProps) {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [voiceProfile, setVoiceProfile] = useState('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setApiKey(localStorage.getItem('sharon_gemini_key') || '');
      setVoiceProfile(localStorage.getItem('sharon_voice_profile') || '');
    }
  }, [isOpen]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('sharon_gemini_key', apiKey.trim());
      localStorage.setItem('sharon_voice_profile', voiceProfile.trim());
      toast('Journal settings updated successfully.', 'success');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-card border border-card-border p-6 rounded-lg max-w-md w-full shadow-sm text-left space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-card-border pb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-sharon-primary" />
            <h3 className="font-serif text-lg font-medium text-foreground">Sanctuary AI Settings</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sharon-muted hover:text-foreground cursor-pointer transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <FieldLabel className="flex items-center gap-1.5">
              <Key size={11} />
              <span>Gemini API Key</span>
            </FieldLabel>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                placeholder="Paste your gemini-1.5 api key..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg py-2 pl-3 pr-10 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sharon-muted hover:text-foreground cursor-pointer transition-colors"
              >
                {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
            <p className="text-[10px] text-sharon-muted leading-relaxed">
              Your API key remains local. Get a free key from the{' '}
              <a
                href="https://aistudio.google.com/"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-foreground"
              >
                Google AI Studio Console
              </a>.
            </p>
          </div>

          <div className="space-y-1.5">
            <FieldLabel className="flex items-center gap-1.5">
              <Sparkles size={11} />
              <span>Writing Voice Profile</span>
            </FieldLabel>
            <textarea
              rows={5}
              placeholder="e.g. Write in an introspective, direct, and conversational tone. Focus heavily on faith, engineering analogies, and specific leadership learnings. Avoid corporate fluff."
              value={voiceProfile}
              onChange={(e) => setVoiceProfile(e.target.value)}
              className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg py-2 px-3 text-xs outline-none focus:border-sharon-primary text-foreground resize-none leading-relaxed"
            />
            <p className="text-[10px] text-sharon-muted leading-relaxed">
              Paste instructions or ChatGPT's analysis of your writing voice. The Gemini transcriber will format your spoken notes to match this style.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-card-border/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-card-border hover:bg-sharon-muted-light/60 text-foreground text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <ActionButton type="submit" variant="primary" className="px-4 py-2">
              Save Settings
            </ActionButton>
          </div>
        </form>
      </div>
    </div>
  );
}
