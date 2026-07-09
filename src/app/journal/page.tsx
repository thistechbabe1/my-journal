'use client';

import React, { useState, useEffect } from 'react';
import { useJournal } from '@/hooks/use-journal';
import { JournalEntry } from '@/types';
import {
  Calendar,
  Smile,
  Tag,
  Search,
  Plus,
  Trash2,
  Check,
  BookOpen,
  ArrowRight,
  Filter,
  Settings
} from 'lucide-react';
import {
  SectionTitle,
  FieldLabel,
  ActionButton,
  NotebookPage
} from '@/components/editorial';
import { useToast } from '@/components/feedback/ToastProvider';
import ConfirmationModal from '@/components/feedback/ConfirmationModal';
import JournalSettings from '@/components/editorial/JournalSettings';
import VoiceRecorder from '@/components/feedback/VoiceRecorder';

export default function JournalPage() {
  const { toast } = useToast();

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

  // Design state
  const [notebookView, setNotebookView] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);

  // Modal feedback state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleApplyTemplate = (type: string) => {
    if (!type) return;

    const templates = {
      'thinking-space': `## Mind Sweep
- 

## Today's Narrative
- 

## Emotional Diagnostics
- How did I feel?
- Why did I feel that way?

## Fears & Crucible Conversations
- What am I afraid of / avoiding?
- Crucible conversations & relational reflections:

## Faith & Grounding
- Prayers & Gratitude:
- Scriptural Anchors:
- The Unresolved Box:`,

      'growth-archive': `## Curation Sync
- Today's Anchor Word: 
- Today's Headline: 
- Today's Biggest Lesson: 
- Today's Increment Progress: 
- Today's Spark (Idea/Quote): 
- Three Gratitude Items:
  1. 
  2. 
  3. 
- Vector for Tomorrow: 
- Message to Future Self: `,
      
      'clear': ''
    };

    const targetContent = templates[type as keyof typeof templates];
    
    if (content.trim()) {
      if (confirm('Applying this template will overwrite your current writing. Continue?')) {
        setContent(targetContent);
        toast('Template applied.', 'success');
      }
    } else {
      setContent(targetContent);
      toast('Template applied.', 'success');
    }
  };

  const handleVoiceTranscribe = (text: string) => {
    setContent((prev) => prev ? `${prev}\n\n${text}` : text);
  };


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
    if (error) {
      toast(`Error saving entry: ${error}`, 'error');
    } else if (data) {
      setActiveEntry(data);
      toast('Journal entry saved.', 'success');
    }
  };

  const handleNew = () => {
    setActiveEntry({
      date: new Date().toISOString().split('T')[0],
      mood: 4,
      tags: []
    });
  };

  const handleDeleteTrigger = (id: string) => {
    setDeleteTargetId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    const { error } = await deleteEntry(deleteTargetId);
    setIsDeleteModalOpen(false);
    setDeleteTargetId(null);

    if (error) {
      toast(`Error deleting entry: ${error}`, 'error');
    } else {
      toast('Journal entry deleted.', 'success');
      if (activeEntry?.id === deleteTargetId) {
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
    <div className="space-y-10 max-w-5xl mx-auto py-2">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-card-border/60 pb-6 text-left">
        <div>
          <h1 className="text-4xl font-serif font-light tracking-wide text-foreground">
            Journal
          </h1>
          <p className="text-xs text-sharon-muted mt-1.5 font-sans">
            A quiet space to record your day, capture reflections, and ground your thoughts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeEntry && (
            <button
              onClick={() => setNotebookView(!notebookView)}
              className="px-4 py-2 rounded-lg border border-card-border bg-card text-foreground font-semibold text-xs transition-colors cursor-pointer hover:bg-sharon-muted-light/60 font-sans"
            >
              {notebookView ? 'Standard View' : 'Notebook View'}
            </button>
          )}
          <ActionButton onClick={handleNew} variant="primary">
            <Plus size={14} />
            <span>New Entry</span>
          </ActionButton>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Entries List & Filters */}
        {!notebookView && (
          <div className="lg:col-span-5 space-y-6">
            
            {/* Filters card */}
            <div className="sharon-card p-4 space-y-4 text-left font-sans">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-sharon-muted">
                <Filter size={12} />
                <span>Filters</span>
              </div>

              {/* Text Search */}
              <div className="relative">
                <Search size={13} className="absolute left-3 top-2.5 text-sharon-muted" />
                <input
                  type="text"
                  placeholder="Search journal..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg py-1.5 pl-9 pr-4 text-xs outline-none focus:border-sharon-primary text-foreground font-medium"
                />
              </div>

              {/* Date Range filters */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-sharon-muted uppercase tracking-wider">Start</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-background border border-card-border rounded-lg p-2 text-[10px] outline-none text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-sharon-muted uppercase tracking-wider">End</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-background border border-card-border rounded-lg p-2 text-[10px] outline-none text-foreground"
                  />
                </div>
              </div>

              {/* Tag and Mood filters */}
              <div className="grid grid-cols-2 gap-2">
                {/* Tag Dropdown */}
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-sharon-muted uppercase tracking-wider">Tag</span>
                  <select
                    value={tagFilter}
                    onChange={(e) => setTagFilter(e.target.value)}
                    className="w-full bg-background border border-card-border rounded-lg p-1.5 text-[10px] outline-none text-foreground"
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
                  <span className="text-[9px] font-bold text-sharon-muted uppercase tracking-wider">Mood</span>
                  <select
                    value={moodFilter || ''}
                    onChange={(e) => setMoodFilter(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full bg-background border border-card-border rounded-lg p-1.5 text-[10px] outline-none text-foreground"
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
            <div className="space-y-4 text-left">
              <SectionTitle>Historical Logs</SectionTitle>
              {loading ? (
                <div className="py-10 text-center">
                  <div className="w-5 h-5 border border-sharon-primary border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : entries.length > 0 ? (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      onClick={() => setActiveEntry(entry)}
                      className={`p-3.5 rounded-lg border text-left cursor-pointer transition-colors ${
                        activeEntry?.id === entry.id
                          ? 'border-sharon-primary bg-sharon-muted-light/40 font-semibold'
                          : 'border-card-border hover:border-sharon-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar size={12} className="text-sharon-muted" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-sharon-muted">
                            {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <span className="text-xs" title={moodNames[entry.mood - 1]}>
                          {moodEmojis[entry.mood - 1]}
                        </span>
                      </div>

                      <p className="text-sm font-serif italic text-foreground mt-2 line-clamp-2 leading-relaxed">
                        {entry.content}
                      </p>

                      <div className="flex flex-wrap gap-1 mt-3">
                        {entry.tags.map((t) => (
                          <span key={t} className="text-[9px] font-semibold bg-sharon-muted-light border border-card-border px-1.5 py-0.5 rounded text-sharon-muted">
                            {t}
                          </span>
                        ))}
                      </div>

                      <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-card-border/30">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTrigger(entry.id);
                          }}
                          className="text-sharon-muted hover:text-danger p-1 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="sharon-card p-8 text-center text-sharon-muted rounded-lg bg-sharon-muted-light/30">
                  <p className="text-xs italic">No journal logs match your criteria.</p>
                  <p className="text-[11px] mt-1 font-sans">Refine your filters above or draft a new log.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right Side: Entry Editor / View Panel */}
        <div className={notebookView ? "lg:col-span-12 w-full text-left" : "lg:col-span-7 w-full text-left"}>
          {activeEntry ? (
            <NotebookPage className={notebookView ? "border border-card-border p-8 sm:p-12 shadow-sm font-serif max-w-2xl mx-auto bg-card" : "bg-card border border-card-border p-6 shadow-sm font-serif rounded-lg"}>
              {/* Header inside notebook */}
              <div className="flex justify-between items-start border-b border-card-border/60 pb-4 mb-6">
                <div className="space-y-1">
                  <div className="text-xs text-sharon-muted font-sans tracking-widest uppercase">
                    {new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-transparent border-0 outline-none text-left cursor-pointer text-[10px] text-sharon-muted font-sans font-semibold hover:text-foreground transition-colors"
                  />
                </div>
                <div className="flex gap-2">
                  {notebookView && (
                    <ActionButton
                      onClick={() => setNotebookView(false)}
                      className="px-3 py-1.5 text-[10px] font-sans"
                    >
                      Show Sidebar
                    </ActionButton>
                  )}
                  <ActionButton
                    onClick={handleSave}
                    disabled={saving}
                    variant="primary"
                    className="px-3.5 py-1.5 text-[10px] font-sans"
                  >
                    {saving ? <div className="w-3.5 h-3.5 border border-background/30 border-t-background rounded-full animate-spin" /> : <Check size={12} />}
                    <span>Save Reflection</span>
                  </ActionButton>
                </div>
              </div>

              {/* Editor Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-card-border/30 pb-3 mb-4 font-sans select-none">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-sharon-muted uppercase tracking-wider">Template:</span>
                  <select
                    onChange={(e) => handleApplyTemplate(e.target.value)}
                    value=""
                    className="bg-sharon-muted-light/40 border border-card-border rounded px-2 py-1 text-[10px] outline-none text-foreground font-semibold cursor-pointer"
                  >
                    <option value="" disabled>Choose Template...</option>
                    <option value="thinking-space">Private Thinking Space (Digital)</option>
                    <option value="growth-archive">Growth Archive Prep (Physical)</option>
                    <option value="clear">Clear Template</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <VoiceRecorder onTranscribe={handleVoiceTranscribe} />
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-card-border bg-card text-sharon-muted hover:text-foreground hover:bg-sharon-muted-light/60 text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all"
                  >
                    <Settings size={11} />
                    <span>Settings</span>
                  </button>
                </div>
              </div>

              {/* Distraction-Free Notebook Canvas */}
              <div className="space-y-6">
                
                {/* Main Reflection Area */}
                <div className="space-y-2">
                  <textarea
                    rows={12}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="How are you today? Write down your thoughts, happenings, and realizations..."
                    className="w-full bg-transparent border-0 text-base font-journal font-light focus:outline-none focus:ring-0 text-foreground resize-none leading-relaxed min-h-[300px]"
                  />
                </div>

                {/* Collapsible Refinement Prompts */}
                <div className="border-t border-card-border/60 pt-4 mt-6 font-sans">
                  <button
                    type="button"
                    onClick={() => setShowPrompts(!showPrompts)}
                    className="flex items-center justify-between w-full text-[10px] font-bold uppercase tracking-widest text-sharon-muted hover:text-foreground transition-colors py-2 cursor-pointer font-sans"
                  >
                    <span>{showPrompts ? 'Hide Refinement Prompts' : 'Show Refinement Prompts (Lessons, Gratitude, Tags...)'}</span>
                    <span className="text-[9px]">{showPrompts ? '▲' : '▼'}</span>
                  </button>

                  {showPrompts && (
                    <div className="space-y-5 mt-5 animate-fade-in font-sans">
                      {/* Mood Selector */}
                      <div className="space-y-2">
                        <FieldLabel>Emotional Alignment</FieldLabel>
                        <div className="flex flex-wrap gap-2">
                          {moodEmojis.map((emoji, idx) => {
                            const active = mood === idx + 1;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setMood(idx + 1)}
                                className={`flex flex-col items-center flex-1 py-2 px-1 rounded-lg border text-base cursor-pointer transition-all ${
                                  active
                                    ? 'border-sharon-primary bg-sharon-muted-light/60 font-semibold'
                                    : 'border-card-border hover:bg-sharon-muted-light/20'
                                }`}
                              >
                                <span>{emoji}</span>
                                <span className="text-[9px] text-sharon-muted mt-1 font-medium">{moodNames[idx]}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Learned */}
                      <div className="space-y-1">
                        <FieldLabel>Lessons</FieldLabel>
                        <textarea
                          rows={2}
                          value={learned}
                          onChange={(e) => setLearned(e.target.value)}
                          placeholder="What did today teach you?"
                          className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg py-2 px-3 text-xs focus:border-sharon-primary outline-none text-foreground resize-none leading-relaxed"
                        />
                      </div>

                      {/* Challenged */}
                      <div className="space-y-1">
                        <FieldLabel>Obstacles & Distractions</FieldLabel>
                        <textarea
                          rows={2}
                          value={challenged}
                          onChange={(e) => setChallenged(e.target.value)}
                          placeholder="Frictions or stressors encountered today?"
                          className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg py-2 px-3 text-xs focus:border-sharon-primary outline-none text-foreground resize-none leading-relaxed"
                        />
                      </div>

                      {/* Grateful */}
                      <div className="space-y-1">
                        <FieldLabel>Gratitude</FieldLabel>
                        <textarea
                          rows={2}
                          value={grateful}
                          onChange={(e) => setGrateful(e.target.value)}
                          placeholder="What brought appreciation or grace today?"
                          className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg py-2 px-3 text-xs focus:border-sharon-primary outline-none text-foreground resize-none leading-relaxed"
                        />
                      </div>

                      {/* Excited */}
                      <div className="space-y-1">
                        <FieldLabel>Anticipation</FieldLabel>
                        <textarea
                          rows={2}
                          value={excited}
                          onChange={(e) => setExcited(e.target.value)}
                          placeholder="What are you looking forward to?"
                          className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg py-2 px-3 text-xs focus:border-sharon-primary outline-none text-foreground resize-none leading-relaxed"
                        />
                      </div>

                      {/* Better */}
                      <div className="space-y-1">
                        <FieldLabel>Refinements</FieldLabel>
                        <textarea
                          rows={2}
                          value={better}
                          onChange={(e) => setBetter(e.target.value)}
                          placeholder="How could you show up better tomorrow?"
                          className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg py-2 px-3 text-xs focus:border-sharon-primary outline-none text-foreground resize-none leading-relaxed"
                        />
                      </div>

                      {/* Tags input */}
                      <div className="space-y-1">
                        <FieldLabel>Tags (comma separated)</FieldLabel>
                        <div className="relative flex items-center">
                          <Tag size={11} className="absolute left-3 text-sharon-muted" />
                          <input
                            type="text"
                            value={tagsInput}
                            onChange={(e) => setTagsInput(e.target.value)}
                            placeholder="e.g. Wellness, Projects, Mindset"
                            className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg py-2 pl-9 pr-3 text-xs focus:border-sharon-primary outline-none text-foreground font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </NotebookPage>
          ) : (
            <div className="sharon-card p-16 text-center text-sharon-muted flex flex-col items-center justify-center space-y-4 font-sans">
              <div className="w-12 h-12 rounded-full bg-sharon-muted-light/60 flex items-center justify-center text-sharon-primary">
                <BookOpen size={20} />
              </div>
              <div className="space-y-1 text-center">
                <h3 className="font-serif text-lg text-foreground font-medium">Capture Daily Clarity</h3>
                <p className="text-xs">
                  Open an entry in the historical log list, or draft a new journal today.
                </p>
              </div>
              <button
                onClick={handleNew}
                className="px-4 py-2 rounded-lg border border-sharon-primary hover:bg-sharon-muted-light/60 text-foreground font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>New Reflection</span>
                <ArrowRight size={12} />
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete this journal entry?"
        message="This action can't be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setDeleteTargetId(null);
        }}
      />

      <JournalSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
