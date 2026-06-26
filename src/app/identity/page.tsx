'use client';

import React, { useState } from 'react';
import { useIdentity } from '@/hooks/use-identity';
import { useAuth } from '@/providers/auth-provider';
import {
  Sparkles,
  Award,
  ChevronRight,
  Shield,
  Heart,
  TrendingUp,
  FileText,
  Save,
  Plus,
  X,
  Brain
} from 'lucide-react';

export default function IdentityPage() {
  const { user } = useAuth();
  const {
    profile,
    identity,
    lifeAreas,
    loading,
    error,
    updateIdentity,
    updateLifeAreaRating
  } = useIdentity();

  const [activeTab, setActiveTab] = useState<'who' | 'becoming' | 'stand'>('who');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Form states matching table columns
  const [personality, setPersonality] = useState(identity?.personality || '');
  const [convictions, setConvictions] = useState(identity?.convictions || '');
  const [futureVision, setFutureVision] = useState(identity?.future_vision || '');
  const [legacyStatement, setLegacyStatement] = useState(identity?.legacy_statement || '');
  const [missionStatement, setMissionStatement] = useState(identity?.mission_statement || '');

  // Tag list states
  const [coreValues, setCoreValues] = useState<string[]>(identity?.core_values || []);
  const [newValue, setNewValue] = useState('');
  const [strengths, setStrengths] = useState<string[]>(identity?.strengths || []);
  const [newStrength, setNewStrength] = useState('');
  const [weaknesses, setWeaknesses] = useState<string[]>(identity?.weaknesses || []);
  const [newWeakness, setNewWeakness] = useState('');
  const [traits, setTraits] = useState<string[]>(identity?.traits || []);
  const [newTrait, setNewTrait] = useState('');
  const [nonNegotiables, setNonNegotiables] = useState<string[]>(identity?.non_negotiables || []);
  const [newNonNegotiable, setNewNonNegotiable] = useState('');
  const [lifePrinciples, setLifePrinciples] = useState<string[]>(identity?.life_principles || []);
  const [newPrinciple, setNewPrinciple] = useState('');

  // Local sync when identity loaded
  React.useEffect(() => {
    if (identity) {
      setPersonality(identity.personality || '');
      setConvictions(identity.convictions || '');
      setFutureVision(identity.future_vision || '');
      setLegacyStatement(identity.legacy_statement || '');
      setMissionStatement(identity.mission_statement || '');
      setCoreValues(identity.core_values || []);
      setStrengths(identity.strengths || []);
      setWeaknesses(identity.weaknesses || []);
      setTraits(identity.traits || []);
      setNonNegotiables(identity.non_negotiables || []);
      setLifePrinciples(identity.life_principles || []);
    }
  }, [identity]);

  const handleSaveIdentity = async () => {
    setSaving(true);
    setMessage(null);
    const { error } = await updateIdentity({
      personality,
      convictions,
      future_vision: futureVision,
      legacy_statement: legacyStatement,
      mission_statement: missionStatement,
      core_values: coreValues,
      strengths,
      weaknesses,
      traits,
      non_negotiables: nonNegotiables,
      life_principles: lifePrinciples
    });
    setSaving(false);
    if (error) {
      setMessage(`Error: ${error.message || error}`);
    } else {
      setMessage('Identity parameters saved successfully! Growth Score updated.');
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleAddTag = (
    value: string,
    setValue: React.Dispatch<React.SetStateAction<string>>,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (value.trim() && !list.includes(value.trim())) {
      setList([...list, value.trim()]);
      setValue('');
    }
  };

  const handleRemoveTag = (item: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    setList(list.filter((x) => x !== item));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-sharon-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-sharon-muted mt-4">Exploring identity records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-card-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-sharon-primary via-indigo-500 to-sharon-primary-light bg-clip-text text-transparent">
            Identity Hub
          </h1>
          <p className="text-sm text-sharon-muted mt-1.5">
            Clarify who you are, what you stand for, and who you are becoming over the next decade.
          </p>
        </div>
        <button
          onClick={handleSaveIdentity}
          disabled={saving}
          className="px-4 py-2 rounded-xl bg-sharon-primary hover:bg-sharon-primary-light text-white font-semibold text-sm transition-all shadow-md shadow-sharon-primary/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
          <span>Save Changes</span>
        </button>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-sharon-primary-light/10 border border-sharon-primary-light/30 text-sharon-primary text-xs font-semibold animate-fade-in dark:text-purple-300">
          {message}
        </div>
      )}

      {/* Grid: Details form & Life Wheel settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Core parameters */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Tab buttons */}
          <div className="flex border-b border-card-border gap-2">
            {[
              { id: 'who', label: 'Who Am I?', icon: Shield },
              { id: 'becoming', label: 'Who Am I Becoming?', icon: TrendingUp },
              { id: 'stand', label: 'What Do I Stand For?', icon: Heart }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-sharon-primary text-sharon-primary'
                      : 'border-transparent text-sharon-muted hover:text-foreground'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Content */}
          <div className="sharon-card p-6 space-y-6">
            
            {/* TAB 1: Who Am I */}
            {activeTab === 'who' && (
              <div className="space-y-6">
                {/* Core Values */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-sharon-muted">Core Values</label>
                  <div className="flex flex-wrap gap-1.5 p-2 border border-card-border rounded-xl bg-sharon-muted-light/20">
                    {coreValues.map((v) => (
                      <span key={v} className="inline-flex items-center gap-1 text-xs font-semibold bg-sharon-primary-light/10 text-sharon-primary px-2.5 py-1 rounded-lg border border-sharon-primary-light/20 dark:bg-purple-900/30 dark:text-purple-300">
                        <span>{v}</span>
                        <button type="button" onClick={() => handleRemoveTag(v, coreValues, setCoreValues)} className="text-sharon-muted hover:text-danger">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    <div className="flex items-center gap-1 flex-1 min-w-[120px]">
                      <input
                        type="text"
                        placeholder="Add value..."
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag(newValue, setNewValue, coreValues, setCoreValues))}
                        className="bg-transparent border-0 outline-none text-xs w-full py-1 text-foreground"
                      />
                      <button type="button" onClick={() => handleAddTag(newValue, setNewValue, coreValues, setCoreValues)} className="text-sharon-primary">
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Strengths */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-sharon-muted">Strengths</label>
                    <div className="flex flex-wrap gap-1.5 p-2 border border-card-border rounded-xl bg-sharon-muted-light/20">
                      {strengths.map((s) => (
                        <span key={s} className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-500/10 text-emerald-600 px-2.5 py-1 rounded-lg border border-emerald-500/20 dark:bg-emerald-900/20 dark:text-emerald-400">
                          <span>{s}</span>
                          <button type="button" onClick={() => handleRemoveTag(s, strengths, setStrengths)} className="text-sharon-muted hover:text-danger">
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                      <div className="flex items-center gap-1 flex-1 min-w-[100px]">
                        <input
                          type="text"
                          placeholder="Add strength..."
                          value={newStrength}
                          onChange={(e) => setNewStrength(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag(newStrength, setNewStrength, strengths, setStrengths))}
                          className="bg-transparent border-0 outline-none text-xs w-full py-1 text-foreground"
                        />
                        <button type="button" onClick={() => handleAddTag(newStrength, setNewStrength, strengths, setStrengths)} className="text-emerald-500">
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Weaknesses */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-sharon-muted">Weaknesses</label>
                    <div className="flex flex-wrap gap-1.5 p-2 border border-card-border rounded-xl bg-sharon-muted-light/20">
                      {weaknesses.map((w) => (
                        <span key={w} className="inline-flex items-center gap-1 text-xs font-semibold bg-red-500/10 text-red-600 px-2.5 py-1 rounded-lg border border-red-500/20 dark:bg-red-900/20 dark:text-red-400">
                          <span>{w}</span>
                          <button type="button" onClick={() => handleRemoveTag(w, weaknesses, setWeaknesses)} className="text-sharon-muted hover:text-danger">
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                      <div className="flex items-center gap-1 flex-1 min-w-[100px]">
                        <input
                          type="text"
                          placeholder="Add weakness..."
                          value={newWeakness}
                          onChange={(e) => setNewWeakness(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag(newWeakness, setNewWeakness, weaknesses, setWeaknesses))}
                          className="bg-transparent border-0 outline-none text-xs w-full py-1 text-foreground"
                        />
                        <button type="button" onClick={() => handleAddTag(newWeakness, setNewWeakness, weaknesses, setWeaknesses)} className="text-red-500">
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Personality */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-sharon-muted">Personality Profile (e.g. MBTI, Enneagram)</label>
                  <input
                    type="text"
                    value={personality}
                    onChange={(e) => setPersonality(e.target.value)}
                    placeholder="e.g. INFJ (Advocate), Enneagram 4w5"
                    className="w-full bg-[#111622]/20 border border-card-border rounded-xl py-2.5 px-4 text-sm focus:border-sharon-primary outline-none text-foreground"
                  />
                </div>

                {/* Spiritual Convictions */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-sharon-muted">Core Convictions & Values Manifesto</label>
                  <textarea
                    rows={4}
                    value={convictions}
                    onChange={(e) => setConvictions(e.target.value)}
                    placeholder="What truths do you hold to be self-evident? What guidelines frame your choices?"
                    className="w-full bg-[#111622]/20 border border-card-border rounded-xl py-2.5 px-4 text-sm focus:border-sharon-primary outline-none text-foreground resize-none"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: Who Am I Becoming */}
            {activeTab === 'becoming' && (
              <div className="space-y-6">
                {/* Desired Traits */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-sharon-muted">Desired Character Traits & Habits</label>
                  <div className="flex flex-wrap gap-1.5 p-2 border border-card-border rounded-xl bg-sharon-muted-light/20">
                    {traits.map((t) => (
                      <span key={t} className="inline-flex items-center gap-1 text-xs font-semibold bg-sharon-primary-light/10 text-sharon-primary px-2.5 py-1 rounded-lg border border-sharon-primary-light/20 dark:bg-purple-900/30 dark:text-purple-300">
                        <span>{t}</span>
                        <button type="button" onClick={() => handleRemoveTag(t, traits, setTraits)} className="text-sharon-muted hover:text-danger">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    <div className="flex items-center gap-1 flex-1 min-w-[120px]">
                      <input
                        type="text"
                        placeholder="Add trait..."
                        value={newTrait}
                        onChange={(e) => setNewTrait(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag(newTrait, setNewTrait, traits, setTraits))}
                        className="bg-transparent border-0 outline-none text-xs w-full py-1 text-foreground"
                      />
                      <button type="button" onClick={() => handleAddTag(newTrait, setNewTrait, traits, setTraits)} className="text-sharon-primary">
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Future Vision */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-sharon-muted">Vision of the Future Self (5-10 Year Outlook)</label>
                  <textarea
                    rows={5}
                    value={futureVision}
                    onChange={(e) => setFutureVision(e.target.value)}
                    placeholder="Describe your life 5-10 years from now. Where are you? What are you building? Who is around you?"
                    className="w-full bg-[#111622]/20 border border-card-border rounded-xl py-2.5 px-4 text-sm focus:border-sharon-primary outline-none text-foreground resize-none"
                  />
                </div>

                {/* Legacy Statement */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-sharon-muted">Legacy Statement</label>
                  <textarea
                    rows={4}
                    value={legacyStatement}
                    onChange={(e) => setLegacyStatement(e.target.value)}
                    placeholder="How do you want to be remembered? What imprint do you wish to leave on people?"
                    className="w-full bg-[#111622]/20 border border-card-border rounded-xl py-2.5 px-4 text-sm focus:border-sharon-primary outline-none text-foreground resize-none"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: What Do I Stand For */}
            {activeTab === 'stand' && (
              <div className="space-y-6">
                {/* Personal Mission Statement */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-sharon-muted">Personal Mission Statement</label>
                  <textarea
                    rows={3}
                    value={missionStatement}
                    onChange={(e) => setMissionStatement(e.target.value)}
                    placeholder="A single sentence that defines your life's purpose and guiding direction."
                    className="w-full bg-[#111622]/20 border border-card-border rounded-xl py-2.5 px-4 text-sm focus:border-sharon-primary outline-none text-foreground resize-none"
                  />
                </div>

                {/* Non-Negotiables */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-sharon-muted">Non-Negotiables (Daily Boundaries)</label>
                  <div className="flex flex-wrap gap-1.5 p-2 border border-card-border rounded-xl bg-sharon-muted-light/20">
                    {nonNegotiables.map((n) => (
                      <span key={n} className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-500/10 text-amber-600 px-2.5 py-1 rounded-lg border border-amber-500/20 dark:bg-amber-900/20 dark:text-amber-400">
                        <span>{n}</span>
                        <button type="button" onClick={() => handleRemoveTag(n, nonNegotiables, setNonNegotiables)} className="text-sharon-muted hover:text-danger">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    <div className="flex items-center gap-1 flex-1 min-w-[120px]">
                      <input
                        type="text"
                        placeholder="Add boundary..."
                        value={newNonNegotiable}
                        onChange={(e) => setNewNonNegotiable(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag(newNonNegotiable, setNewNonNegotiable, nonNegotiables, setNonNegotiables))}
                        className="bg-transparent border-0 outline-none text-xs w-full py-1 text-foreground"
                      />
                      <button type="button" onClick={() => handleAddTag(newNonNegotiable, setNewNonNegotiable, nonNegotiables, setNonNegotiables)} className="text-sharon-accent-dark">
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Life Principles */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-sharon-muted">Life Principles & Philosophies</label>
                  <div className="space-y-2">
                    {lifePrinciples.map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-card-border bg-[#111622]/10">
                        <span className="text-xs font-medium">{p}</span>
                        <button type="button" onClick={() => handleRemoveTag(p, lifePrinciples, setLifePrinciples)} className="text-sharon-muted hover:text-danger">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="text"
                        placeholder="e.g. Consistency beats motivation."
                        value={newPrinciple}
                        onChange={(e) => setNewPrinciple(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag(newPrinciple, setNewPrinciple, lifePrinciples, setLifePrinciples))}
                        className="w-full bg-[#111622]/20 border border-card-border rounded-xl py-2 px-3 text-xs focus:border-sharon-primary outline-none text-foreground"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddTag(newPrinciple, setNewPrinciple, lifePrinciples, setLifePrinciples)}
                        className="p-2 rounded-xl bg-sharon-primary hover:bg-sharon-primary-light text-white transition-colors cursor-pointer shrink-0"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Life Areas scoring */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sharon-card p-6 sharon-card-gold space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <Brain className="text-sharon-accent animate-pulse" size={20} />
                <h3 className="font-bold text-lg">Life Areas</h3>
              </div>
              <p className="text-xs text-sharon-muted mt-1">
                Rate your alignment (1-10) in the critical areas of life. These populate your radar wheel.
              </p>
            </div>

            {/* Slider list */}
            <div className="space-y-4">
              {lifeAreas.map((area) => (
                <div key={area.id} className="space-y-1.5 p-3 rounded-xl bg-sharon-muted-light/30 border border-card-border/50">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-foreground">{area.name}</span>
                    <span className="text-sharon-primary font-extrabold">{area.score}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={area.score}
                    onChange={(e) => updateLifeAreaRating(area.name, parseInt(e.target.value), area.notes)}
                    className="w-full accent-sharon-primary h-1 rounded bg-sharon-muted-light"
                  />
                  <input
                    type="text"
                    placeholder="Add focus note..."
                    defaultValue={area.notes || ''}
                    onBlur={(e) => updateLifeAreaRating(area.name, area.score, e.target.value)}
                    className="bg-transparent border-b border-transparent hover:border-card-border/80 focus:border-sharon-primary w-full text-[10px] text-sharon-muted py-0.5 outline-none font-medium truncate"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
