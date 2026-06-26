'use client';

import React, { useState, useEffect } from 'react';
import { useJournal } from '@/hooks/use-journal';
import { JournalEntry } from '@/types';
import {
  Sparkles,
  Calendar,
  Smile,
  Tag,
  Search,
  Plus,
  Trash2,
  Save,
  BookOpen,
  ArrowRight,
  Filter
} from 'lucide-react';

export default function JournalPage() {
  // Query Filters state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [moodFilter, setMoodFilter] = useState<number | undefined>(undefined);
  const [tagFilter, setTagFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const {
    entries,
    loading,
    saveEntry,
    deleteEntry
  } = useJournal({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    mood: moodFilter,
    tag: tagFilter || undefined,
    search: searchTerm || undefined
  });

  const [activeEntry, setActiveEntry] = useState<Partial<JournalEntry> | null>(null);
  const [saving, setSaving] = useState(false);

  // Editor states
  const [content, setContent] = useState('');
  const [learned, setLearned] = useState('');
  const [challenged, setChallenged] = useState('');
  const [grateful, setGrateful] = useState('');
  const [excited, setExcited] = useState('');
  const [better, setBetter] = useState('');
  const [mood, setMood] = useState<number>(4);
  const [tagsInput, setTagsInput] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Sync editor with active entry selection
  useEffect(() => {
    if (activeEntry) {
      setContent(activeEntry.content || '');
      setLearned(activeEntry.learned || '');
      setChallenged(activeEntry.challenged || '');
      setGrateful(activeEntry.grateful || '');
      setExcited(activeEntry.excited || '');
      setBetter(activeEntry.better || '');
      setMood(activeEntry.mood || 4);
      setTagsInput(activeEntry.tags ? activeEntry.tags.join(', ') : '');
      setDate(activeEntry.date || new Date().toISOString().split('T')[0]);
    } else {
      setContent('');
      setLearned('');
      setChallenged('');
      setGrateful('');
      setExcited('');
      setBetter('');
      setMood(4);
      setTagsInput('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [activeEntry]);

  // Load selected journal from query param if available (for Command Palette link)
  useEffect(() => {
    if (typeof window !== 'undefined' && entries.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const entryId = params.get('id');
      if (entryId) {
        const found = entries.find((e) => e.id === entryId);
        if (found) setActiveEntry(found);
      }
    }
  }, [entries]);

  const handleSave = async () => {
    if (!content.trim()) return;

    setSaving(true);
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const entryToSave = {
      ...activeEntry,
      content,
      learned,
      challenged,
      grateful,
      excited,
      better,
      mood,
      tags,
      date
    };

    const { data, error } = await saveEntry(entryToSave);
    setSaving(false);
    if (!error && data) {
      setActiveEntry(data);
    }
  };

  const handleNew = () => {
    setActiveEntry({
      date: new Date().toISOString().split('T')[0],
      mood: 4,
      tags: []
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this journal entry?')) {
      const { error } = await deleteEntry(id);
      if (!error && activeEntry?.id === id) {
        setActiveEntry(null);
      }
    }
  };

  const moodEmojis = ['😢', '😔', '😐', '🙂', '✨'];
  const moodNames = ['Terrible', 'Struggling', 'Neutral', 'Aligned', 'Radiant'];

  // Aggregate tags for filters
  const allTags = Array.from(
    new Set(entries.flatMap((e) => e.tags || []))
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-card-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-sharon-primary via-indigo-500 to-sharon-primary-light bg-clip-text text-transparent">
            Daily Journal
          </h1>
          <p className="text-sm text-sharon-muted mt-1.5">
            Reflect on your day, capture lessons, and log your emotional alignment.
          </p>
        </div>
        <button
          onClick={handleNew}
          className="px-4 py-2 rounded-xl bg-sharon-primary hover:bg-sharon-primary-light text-white font-semibold text-sm transition-all shadow-md shadow-sharon-primary/10 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus size={16} />
          <span>New Entry</span>
        </button>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Entries List & Filters */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Filters card */}
          <div className="sharon-card p-4 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sharon-muted">
              <Filter size={14} />
              <span>Filters</span>
            </div>

            {/* Text Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-3 text-sharon-muted" />
              <input
                type="text"
                placeholder="Search text..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#111622]/10 border border-card-border rounded-xl py-2 pl-9 pr-4 text-xs outline-none focus:border-sharon-primary text-foreground"
              />
            </div>

            {/* Date Range filters */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-sharon-muted">Start Date</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#111622]/10 border border-card-border rounded-xl p-2 text-[10px] outline-none text-foreground"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-sharon-muted">End Date</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-[#111622]/10 border border-card-border rounded-xl p-2 text-[10px] outline-none text-foreground"
                />
              </div>
            </div>

            {/* Tag and Mood filters */}
            <div className="grid grid-cols-2 gap-2">
              {/* Tag Dropdown */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-sharon-muted">Filter by Tag</span>
                <select
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  className="w-full bg-[#111622]/10 border border-card-border rounded-xl p-2 text-[10px] outline-none text-foreground"
                >
                  <option value="">All Tags</option>
                  {allTags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mood Dropdown */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-sharon-muted">Filter by Mood</span>
                <select
                  value={moodFilter || ''}
                  onChange={(e) => setMoodFilter(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full bg-[#111622]/10 border border-card-border rounded-xl p-2 text-[10px] outline-none text-foreground"
                >
                  <option value="">All Moods</option>
                  {moodNames.map((name, idx) => (
                    <option key={idx} value={idx + 1}>
                      {moodEmojis[idx]} {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Past entries list */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-sharon-muted px-1 uppercase tracking-wider">Historical Logs</h3>
            {loading ? (
              <div className="py-10 text-center">
                <div className="w-6 h-6 border-2 border-sharon-primary border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : entries.length > 0 ? (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    onClick={() => setActiveEntry(entry)}
                    className={`sharon-card p-4 cursor-pointer text-left ${
                      activeEntry?.id === entry.id
                        ? 'border-sharon-primary bg-sharon-primary-light/5'
                        : 'hover:border-sharon-primary-light'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar size={13} className="text-sharon-muted" />
                        <span className="text-xs font-bold">
                          {new Date(entry.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </span>
                      </div>
                      <span className="text-sm" title={moodNames[entry.mood - 1]}>
                        {moodEmojis[entry.mood - 1]}
                      </span>
                    </div>

                    <p className="text-xs text-foreground font-medium line-clamp-2 mt-2 leading-relaxed">
                      {entry.content}
                    </p>

                    <div className="flex flex-wrap gap-1 mt-3">
                      {entry.tags.map((t) => (
                        <span key={t} className="text-[9px] font-bold uppercase tracking-wider bg-sharon-muted-light border border-card-border px-1.5 py-0.5 rounded text-sharon-muted">
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-card-border/50">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(entry.id);
                        }}
                        className="text-sharon-muted hover:text-danger p-1 rounded hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="sharon-card p-8 text-center text-sharon-muted">
                <p className="text-xs font-bold">No journal logs match filters.</p>
                <p className="text-[10px] mt-1">Select new filters or click "New Entry" to write.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Entry Editor / View Panel */}
        <div className="lg:col-span-7">
          {activeEntry ? (
            <div className="sharon-card p-6 space-y-6 border-t-3 border-sharon-primary">
              <div className="flex items-center justify-between border-b border-card-border pb-4">
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-sharon-primary" />
                  <h2 className="font-bold text-lg">
                    {activeEntry.id ? 'Edit Entry Reflection' : 'Draft New Entry'}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-[#111622]/10 border border-card-border rounded-lg px-2.5 py-1 text-xs outline-none text-foreground font-bold"
                  />
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-3.5 py-1.5 rounded-lg bg-sharon-primary hover:bg-sharon-primary-light text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {saving ? <div className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={13} />}
                    <span>Save</span>
                  </button>
                </div>
              </div>

              {/* Mood selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-sharon-muted flex items-center gap-1">
                  <Smile size={12} className="text-sharon-accent-dark" />
                  <span>Emotional Alignment (Mood)</span>
                </label>
                <div className="flex gap-2">
                  {moodEmojis.map((emoji, idx) => {
                    const active = mood === idx + 1;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setMood(idx + 1)}
                        className={`flex flex-col items-center flex-1 p-2 rounded-xl border text-lg cursor-pointer transition-all ${
                          active
                            ? 'border-sharon-primary bg-sharon-primary-light/10 scale-105'
                            : 'border-card-border hover:bg-sharon-muted-light/40'
                        }`}
                      >
                        <span>{emoji}</span>
                        <span className="text-[9px] font-bold text-sharon-muted mt-1">{moodNames[idx]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Prompts list */}
              <div className="space-y-4">
                {/* Content: What happened */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-sharon-muted">What happened today? (Core Log)</label>
                  <textarea
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write a brief overview of today's events, projects, and activities..."
                    className="w-full bg-[#111622]/10 border border-card-border rounded-xl py-2 px-3 text-xs focus:border-sharon-primary outline-none text-foreground resize-none leading-relaxed"
                  />
                </div>

                {/* Learned */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-sharon-muted">What did I learn today?</label>
                  <textarea
                    rows={2}
                    value={learned}
                    onChange={(e) => setLearned(e.target.value)}
                    placeholder="Lessons from errors, coding blocks, articles, or realizations..."
                    className="w-full bg-[#111622]/10 border border-card-border rounded-xl py-2 px-3 text-xs focus:border-sharon-primary outline-none text-foreground resize-none"
                  />
                </div>

                {/* Challenged */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-sharon-muted">What challenged me today?</label>
                  <textarea
                    rows={2}
                    value={challenged}
                    onChange={(e) => setChallenged(e.target.value)}
                    placeholder="Obstacles, distractions, friction points, or stress triggers..."
                    className="w-full bg-[#111622]/10 border border-card-border rounded-xl py-2 px-3 text-xs focus:border-sharon-primary outline-none text-foreground resize-none"
                  />
                </div>

                {/* Grateful */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-sharon-muted">What am I grateful for today?</label>
                  <textarea
                    rows={2}
                    value={grateful}
                    onChange={(e) => setGrateful(e.target.value)}
                    placeholder="A person, environment details, health, progress, or moments..."
                    className="w-full bg-[#111622]/10 border border-card-border rounded-xl py-2 px-3 text-xs focus:border-sharon-primary outline-none text-foreground resize-none"
                  />
                </div>

                {/* Excited */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-sharon-muted">What am I excited about?</label>
                  <textarea
                    rows={2}
                    value={excited}
                    onChange={(e) => setExcited(e.target.value)}
                    placeholder="Future self letter releases, dashboard progress, upcoming plans..."
                    className="w-full bg-[#111622]/10 border border-card-border rounded-xl py-2 px-3 text-xs focus:border-sharon-primary outline-none text-foreground resize-none"
                  />
                </div>

                {/* Better */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-sharon-muted">What could I have done better?</label>
                  <textarea
                    rows={2}
                    value={better}
                    onChange={(e) => setBetter(e.target.value)}
                    placeholder="How could you have increased focus, boundaries, or energy?"
                    className="w-full bg-[#111622]/10 border border-card-border rounded-xl py-2 px-3 text-xs focus:border-sharon-primary outline-none text-foreground resize-none"
                  />
                </div>

                {/* Tags input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-sharon-muted flex items-center gap-1">
                    <Tag size={11} />
                    <span>Tags (comma separated)</span>
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="e.g. Work, Wellness, Relationships, Leadership"
                    className="w-full bg-[#111622]/10 border border-card-border rounded-xl py-2.5 px-4 text-xs focus:border-sharon-primary outline-none text-foreground"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="sharon-card p-16 text-center text-sharon-muted flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-sharon-primary-light/10 flex items-center justify-center text-sharon-primary animate-pulse">
                <BookOpen size={28} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">Write Your Daily Reflection</h3>
                <p className="text-xs mt-1">
                  Select a past entry from the log history, or click "New Entry" to start.
                </p>
              </div>
              <button
                onClick={handleNew}
                className="px-4 py-2 rounded-xl bg-sharon-primary hover:bg-sharon-primary-light text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow shadow-sharon-primary/10 cursor-pointer"
              >
                <span>Write Today</span>
                <ArrowRight size={13} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
