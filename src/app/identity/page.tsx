'use client';

import React, { useState, useEffect } from 'react';
import { useIdentity } from '@/hooks/use-identity';
import { useAuth } from '@/providers/auth-provider';
import { Plus, X, Compass, ArrowRight, Save } from 'lucide-react';
import Link from 'next/link';
import { Divider } from '@/components/editorial';

export default function IdentityPage() {
  const { user } = useAuth();
  const {
    identity,
    loading,
    updateIdentity
  } = useIdentity();

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Form states matching table columns
  const [personality, setPersonality] = useState('');
  const [convictions, setConvictions] = useState('');
  const [futureVision, setFutureVision] = useState('');
  const [legacyStatement, setLegacyStatement] = useState('');
  const [missionStatement, setMissionStatement] = useState('');

  // Tag list states
  const [coreValues, setCoreValues] = useState<string[]>([]);
  const [newValue, setNewValue] = useState('');
  const [strengths, setStrengths] = useState<string[]>([]);
  const [newStrength, setNewStrength] = useState('');
  const [nonNegotiables, setNonNegotiables] = useState<string[]>([]);
  const [newNonNegotiable, setNewNonNegotiable] = useState('');
  const [lifePrinciples, setLifePrinciples] = useState<string[]>([]);
  const [newPrinciple, setNewPrinciple] = useState('');

  // Local sync
  useEffect(() => {
    if (identity) {
      setPersonality(identity.personality || '');
      setConvictions(identity.convictions || '');
      setFutureVision(identity.future_vision || '');
      setLegacyStatement(identity.legacy_statement || '');
      setMissionStatement(identity.mission_statement || '');
      setCoreValues(identity.core_values || []);
      setStrengths(identity.strengths || []);
      setNonNegotiables(identity.non_negotiables || []);
      setLifePrinciples(identity.life_principles || []);
    }
  }, [identity]);

  const handleSaveIdentity = async () => {
    setSaving(true);
    const { error } = await updateIdentity({
      personality,
      convictions,
      future_vision: futureVision,
      legacy_statement: legacyStatement,
      mission_statement: missionStatement,
      core_values: coreValues,
      strengths,
      non_negotiables: nonNegotiables,
      life_principles: lifePrinciples
    });
    setSaving(false);
    if (!error) {
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 2000);
    }
  };

  const handleAddTag = (
    value: string,
    setValue: React.Dispatch<React.SetStateAction<string>>,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (!value.trim()) return;
    if (!list.includes(value.trim())) {
      const updated = [...list, value.trim()];
      setList(updated);
      setValue('');
    }
  };

  const handleRemoveTag = (
    index: number,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const updated = list.filter((_, i) => i !== index);
    setList(updated);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 font-sans">
        <div className="w-5 h-5 border border-sharon-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-sharon-muted mt-4 tracking-wide">Opening Manifesto...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-12 py-6 px-4 text-left font-sans animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-card-border/60 pb-6 text-left">
        <div>
          <h1 className="text-4xl font-serif font-light tracking-wide text-foreground">
            Identity
          </h1>
          <p className="text-xs text-sharon-muted mt-1.5 font-sans">
            Your Personal Constitution & Life Manifesto.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/identity/seasons"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-card-border bg-card text-foreground hover:bg-sharon-muted-light/60 font-semibold text-xs transition-colors cursor-pointer"
          >
            <Compass size={13} className="text-sharon-primary" />
            <span>Seasonal Chapters</span>
          </Link>
          
          <button
            onClick={handleSaveIdentity}
            disabled={saving}
            className="px-3.5 py-1.5 bg-sharon-primary hover:bg-sharon-primary-light text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50 transition-colors"
          >
            <span>{saving ? 'Saving...' : successMsg ? 'Saved' : 'Save Manifesto'}</span>
          </button>
        </div>
      </div>

      {/* 1. Mission Statement */}
      <div className="space-y-4">
        <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest block">
          Mission Statement
        </span>
        <textarea
          placeholder="Clarify your central life mission and calling..."
          rows={3}
          value={missionStatement}
          onChange={(e) => setMissionStatement(e.target.value)}
          onBlur={handleSaveIdentity}
          className="w-full bg-transparent border-0 border-b border-card-border/40 focus:border-sharon-primary rounded-none py-1.5 px-0 text-xl font-serif italic text-foreground outline-none transition-all placeholder:text-sharon-muted/30 resize-none font-light leading-relaxed"
        />
      </div>

      <Divider />

      {/* 2. Core Values */}
      <div className="space-y-4">
        <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest block">
          Core Values
        </span>
        <div className="flex flex-wrap gap-2">
          {coreValues.map((val, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-serif italic bg-sharon-muted-light/40 border border-card-border/40 rounded-full text-foreground select-none"
            >
              <span>{val}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(idx, coreValues, setCoreValues)}
                className="text-sharon-muted hover:text-danger ml-0.5"
              >
                <X size={10} />
              </button>
            </span>
          ))}
          <div className="flex items-center gap-1">
            <input
              type="text"
              placeholder="+ Value"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag(newValue, setNewValue, coreValues, setCoreValues))}
              className="bg-transparent border-0 border-b border-card-border/60 focus:border-sharon-primary rounded-none py-0.5 px-1 text-xs outline-none text-foreground font-semibold placeholder:text-sharon-muted/30 w-20"
            />
          </div>
        </div>
      </div>

      <Divider />

      {/* 3. Core Principles */}
      <div className="space-y-4">
        <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest block">
          Life Principles & Constitution
        </span>
        
        <div className="space-y-3 pl-1">
          {lifePrinciples.length > 0 ? (
            <div className="space-y-3">
              {lifePrinciples.map((principle, idx) => (
                <div key={idx} className="flex items-start justify-between gap-3 group">
                  <p className="text-sm font-serif italic text-foreground/90 pl-3.5 border-l-2 border-sharon-primary/30 py-0.5 leading-relaxed">
                    {principle}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(idx, lifePrinciples, setLifePrinciples)}
                    className="text-sharon-muted opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-danger shrink-0 cursor-pointer"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-sharon-muted italic">No constitution principles established yet.</p>
          )}

          <div className="flex gap-2 pt-2">
            <input
              type="text"
              placeholder="Add principle to your personal constitution..."
              value={newPrinciple}
              onChange={(e) => setNewPrinciple(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag(newPrinciple, setNewPrinciple, lifePrinciples, setLifePrinciples))}
              className="w-full bg-transparent border-0 border-b border-card-border/60 focus:border-sharon-primary rounded-none py-1 px-0 text-xs outline-none text-foreground placeholder:text-sharon-muted/30"
            />
            <button
              onClick={() => handleAddTag(newPrinciple, setNewPrinciple, lifePrinciples, setLifePrinciples)}
              className="px-2.5 py-1 rounded bg-sharon-muted-light border border-card-border text-[10px] font-semibold text-sharon-primary cursor-pointer hover:bg-sharon-muted-light/80 transition-colors shrink-0"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      <Divider />

      {/* 4. Non-Negotiables */}
      <div className="space-y-4">
        <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest block">
          Non-Negotiables
        </span>
        <div className="space-y-3 pl-1">
          {nonNegotiables.length > 0 ? (
            <div className="space-y-3">
              {nonNegotiables.map((item, idx) => (
                <div key={idx} className="flex items-start justify-between gap-3 group">
                  <p className="text-sm font-semibold text-foreground/90 pl-3.5 border-l-2 border-sharon-accent/30 py-0.5 leading-relaxed">
                    {item}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(idx, nonNegotiables, setNonNegotiables)}
                    className="text-sharon-muted opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-danger shrink-0 cursor-pointer"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-sharon-muted italic">No non-negotiable standards defined.</p>
          )}

          <div className="flex gap-2 pt-2">
            <input
              type="text"
              placeholder="Add non-negotiable boundary standard..."
              value={newNonNegotiable}
              onChange={(e) => setNewNonNegotiable(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag(newNonNegotiable, setNewNonNegotiable, nonNegotiables, setNonNegotiables))}
              className="w-full bg-transparent border-0 border-b border-card-border/60 focus:border-sharon-primary rounded-none py-1 px-0 text-xs outline-none text-foreground placeholder:text-sharon-muted/30"
            />
            <button
              onClick={() => handleAddTag(newNonNegotiable, setNewNonNegotiable, nonNegotiables, setNonNegotiables)}
              className="px-2.5 py-1 rounded bg-sharon-muted-light border border-card-border text-[10px] font-semibold text-sharon-primary cursor-pointer hover:bg-sharon-muted-light/80 transition-colors shrink-0"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      <Divider />

      {/* 5. Personality, Convictions, Future Vision */}
      <div className="space-y-8">
        
        {/* Personality description */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest block">Personality Configuration</span>
          <textarea
            placeholder="Describe your character profile, cognitive focus, MBTI, etc..."
            rows={4}
            value={personality}
            onChange={(e) => setPersonality(e.target.value)}
            onBlur={handleSaveIdentity}
            className="w-full bg-transparent border-0 border-b border-card-border/40 focus:border-sharon-primary rounded-none py-1 px-0 text-xs outline-none text-foreground leading-relaxed placeholder:text-sharon-muted/30 resize-none font-semibold"
          />
        </div>

        {/* Core Convictions */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest block">Core Beliefs & Convictions</span>
          <textarea
            placeholder="What deep values or paradigms direct your standard of living?"
            rows={4}
            value={convictions}
            onChange={(e) => setConvictions(e.target.value)}
            onBlur={handleSaveIdentity}
            className="w-full bg-transparent border-0 border-b border-card-border/40 focus:border-sharon-primary rounded-none py-1 px-0 text-xs outline-none text-foreground leading-relaxed placeholder:text-sharon-muted/30 resize-none font-semibold"
          />
        </div>

        {/* Future Self Vision */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest block">Future Self Vision (Legacy)</span>
          <textarea
            placeholder="Describe where your character is leading. Who will you be in 10 years?"
            rows={4}
            value={futureVision}
            onChange={(e) => setFutureVision(e.target.value)}
            onBlur={handleSaveIdentity}
            className="w-full bg-transparent border-0 border-b border-card-border/40 focus:border-sharon-primary rounded-none py-1 px-0 text-xs outline-none text-foreground leading-relaxed placeholder:text-sharon-muted/30 resize-none font-semibold"
          />
        </div>

      </div>

    </div>
  );
}
