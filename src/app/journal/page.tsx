'use client';

import React, { useState, useEffect } from 'react';
import { useJournal } from '@/hooks/use-journal';
import { JournalEntry } from '@/types';
import { 
  Calendar, Smile, Tag, Search, Plus, Trash2, 
  Check, Sparkles, BookOpen, Clock, Settings, ArrowLeft 
} from 'lucide-react';
import { useToast } from '@/components/feedback/ToastProvider';
import ConfirmationModal from '@/components/feedback/ConfirmationModal';
import VoiceRecorder from '@/components/feedback/VoiceRecorder';
import { Divider } from '@/components/editorial';

export default function JournalPage() {
  const { toast } = useToast();

  // Search filter state
  const [searchTerm, setSearchTerm] = useState('');

  const {
    entries,
    loading,
    saveEntry,
    deleteEntry
  } = useJournal({
    search: searchTerm || undefined
  });

  const [activeEntry, setActiveEntry] = useState<Partial<JournalEntry> | null>(null);
  const [saving, setSaving] = useState(false);

  // Editor states
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<number>(4);
  const [tagsInput, setTagsInput] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Design state
  const [showTemplates, setShowTemplates] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Load selected entry or default blank for today
  useEffect(() => {
    if (activeEntry) {
      setContent(activeEntry.content || '');
      setMood(activeEntry.mood || 4);
      setTagsInput(activeEntry.tags?.join(', ') || '');
      setDate(activeEntry.date || new Date().toISOString().split('T')[0]);
    } else {
      setContent('');
      setMood(4);
      setTagsInput('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [activeEntry]);

  // Set today's entry as active by default if it exists
  useEffect(() => {
    if (entries.length > 0 && !activeEntry) {
      const todayStr = new Date().toISOString().split('T')[0];
      const todayEntry = entries.find((e) => e.date === todayStr);
      if (todayEntry) {
        setActiveEntry(todayEntry);
      }
    }
  }, [entries, activeEntry]);

  const handleNewEntry = () => {
    setActiveEntry(null);
    toast('New journal draft opened.', 'success');
  };

  const handleApplyTemplate = (type: string) => {
    const templates: Record<string, string> = {
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
- What I built/implemented: 

## Physical Check
- Sleep / Rest quality:
- Rhythms maintained:

## Learnings & Curations
- Reading / Podcast notes:`,

      'manifesto': `## Identity Alignment
- Who did I choose to be today?
- Did I live my core values?

## Seasons Alignment
- How does today align with my active Season Chapter?
- Intention retrospective:`
    };

    if (templates[type]) {
      setContent((prev) => (prev ? `${prev}\n\n${templates[type]}` : templates[type]));
      setShowTemplates(false);
      toast('Template injected into draft.', 'success');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast('Please write something before saving.', 'warning');
      return;
    }

    setSaving(true);
    try {
      const tagsArray = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const entryPayload: Partial<JournalEntry> = {
        ...activeEntry,
        date,
        content,
        mood,
        tags: tagsArray
      };

      const { data, error } = await saveEntry(entryPayload);
      if (error) throw error;

      setActiveEntry(data || null);
      toast(activeEntry?.id ? 'Journal entry updated.' : 'New journal entry recorded.', 'success');
    } catch (err: any) {
      toast(`Save failed: ${err.message}`, 'error');
    } finally {
      setSaving(true);
      // Wait minor tick to allow refresh
      setTimeout(() => setSaving(false), 300);
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteTargetId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      const { error } = await deleteEntry(deleteTargetId);
      if (error) throw error;

      toast('Journal entry deleted.', 'success');
      if (activeEntry?.id === deleteTargetId) {
        setActiveEntry(null);
      }
    } catch (err: any) {
      toast(`Deletion failed: ${err.message}`, 'error');
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteTargetId(null);
    }
  };

  const handleVoiceTranscribe = (text: string) => {
    setContent((prev) => (prev ? `${prev}\n\n${text}` : text));
    toast('Audio text appended to journal.', 'success');
  };

  const moodEmojis = ['😢', '😔', '😐', '🙂', '✨'];
  const moodNames = ['Heavy', 'Quiet', 'Neutral', 'Grounded', 'Inspired'];

  return (
    <div className="max-w-2xl mx-auto space-y-10 py-6 px-4 text-left font-sans animate-fade-in relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif font-light text-foreground ">
            Journal
          </h1>
          <p className="text-xs text-sharon-muted mt-1 font-sans">
            Write down your thoughts, logs, and autobiographical entries.
          </p>
        </div>
        <div>
          <button
            onClick={handleNewEntry}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-card-border bg-card text-foreground hover:bg-sharon-muted-light/60 font-semibold text-xs transition-colors cursor-pointer"
          >
            <Plus size={13} />
            <span>New Entry</span>
          </button>
        </div>
      </div>

      <Divider />

      {/* Understated Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none text-sharon-muted/60">
          <Search size={14} />
        </div>
        <input
          type="text"
          placeholder="Search journal entries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-2 pl-7 pr-3 text-xs outline-none text-foreground font-semibold placeholder:text-sharon-muted/30 focus:border-sharon-primary transition-colors"
        />
      </div>

      <Divider />

      {/* Main Write Canvas */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Date & Mood bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 font-sans select-none border-b border-card-border/20 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-sharon-muted ">Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent border-0 border-b border-transparent focus:border-card-border/60 rounded-none py-0.5 px-0 text-xs text-foreground font-bold outline-none cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-sharon-muted ">Mood</span>
            <div className="flex gap-2">
              {moodEmojis.map((emoji, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setMood(idx + 1)}
                  className={`text-sm p-1 rounded transition-all cursor-pointer ${
                    mood === idx + 1 ? 'bg-sharon-muted-light/60 scale-110' : 'opacity-40 hover:opacity-100'
                  }`}
                  title={moodNames[idx]}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Text Area Writing Slate */}
        <div className="space-y-2">
          <div className="flex justify-between items-center select-none">
            <span className="text-[10px] font-bold text-sharon-muted ">
              {activeEntry?.id ? 'Edit Entry' : 'Today\'s Log'}
            </span>

            {/* Quick Templates Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTemplates(!showTemplates)}
                className="text-[10px] font-bold text-sharon-primary hover:text-sharon-primary-light flex items-center gap-1 cursor-pointer"
              >
                <Plus size={10} />
                <span>Templates</span>
              </button>

              {showTemplates && (
                <div className="absolute right-0 mt-1.5 w-48 bg-card border border-card-border rounded-lg shadow-lg py-1.5 z-30 animate-fade-in font-sans text-left">
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate('thinking-space')}
                    className="w-full text-left px-3 py-1.5 text-xs text-foreground hover:bg-sharon-muted-light/50 font-medium"
                  >
                    🧠 Mind Sweep / Faith
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate('growth-archive')}
                    className="w-full text-left px-3 py-1.5 text-xs text-foreground hover:bg-sharon-muted-light/50 font-medium"
                  >
                    🌱 Curation Sync
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate('manifesto')}
                    className="w-full text-left px-3 py-1.5 text-xs text-foreground hover:bg-sharon-muted-light/50 font-medium"
                  >
                    🧭 Identity Alignment
                  </button>
                </div>
              )}
            </div>
          </div>

          <textarea
            placeholder="Type your authentic narrative here... Rely on spacing and clear reflection."
            rows={14}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-transparent border-0 rounded-none p-0 text-base outline-none text-foreground font-serif leading-relaxed placeholder:text-sharon-muted/30 focus:ring-0"
          />
        </div>

        {/* Tags bar */}
        <div className="space-y-1.5 border-t border-card-border/20 pt-4">
          <label className="text-[10px] font-bold text-sharon-muted block">Tags (comma separated)</label>
          <input
            type="text"
            placeholder="e.g. reflections, code, faith"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="w-full bg-transparent border-0 border-b border-card-border/40 focus:border-sharon-primary rounded-none py-1 px-0 text-xs outline-none text-foreground font-semibold placeholder:text-sharon-muted/30"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between border-t border-card-border/20 pt-5">
          <div className="flex items-center gap-2">
            <VoiceRecorder onTranscribe={handleVoiceTranscribe} />
          </div>

          <div className="flex items-center gap-3">
            {activeEntry?.id && (
              <button
                type="button"
                onClick={() => confirmDelete(activeEntry.id!)}
                className="px-3 py-2 rounded-lg border border-card-border bg-card text-danger hover:bg-danger/10 font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>
            )}
            
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sharon-primary hover:bg-sharon-primary-light text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Log'}
            </button>
          </div>
        </div>
      </form>

      <Divider />

      {/* Index list of Previous Entries */}
      <div className="space-y-5">
        <span className="text-[10px] font-bold text-sharon-muted block">
          Previous Entries
        </span>

        {loading ? (
          <div className="py-6 flex justify-center">
            <div className="w-4 h-4 border border-sharon-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : entries.length > 0 ? (
          <div className="space-y-4">
            {entries.map((entry) => {
              const entryDate = new Date(entry.date);
              const dateLabel = entryDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });
              const previewText = entry.content
                ? entry.content.replace(/[#\-\*`]/g, '').trim().substring(0, 80) + '...'
                : 'Empty entry.';

              const isSelected = activeEntry?.id === entry.id;

              return (
                <div
                  key={entry.id}
                  onClick={() => setActiveEntry(entry)}
                  className={`py-2 px-1 border-b border-card-border/10 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:opacity-100 transition-opacity select-none ${
                    isSelected ? 'opacity-100 font-bold' : 'opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold shrink-0 font-sans ${isSelected ? 'text-sharon-primary' : 'text-foreground'}`}>
                      {dateLabel}
                    </span>
                    <p className="text-xs text-sharon-muted truncate italic font-serif leading-none">
                      {previewText}
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                    {entry.mood && (
                      <span className="text-xs" title={moodNames[entry.mood - 1]}>
                        {moodEmojis[entry.mood - 1]}
                      </span>
                    )}
                    {entry.tags && entry.tags.length > 0 && (
                      <span className="text-[9px] font-bold bg-sharon-muted-light/60 border border-card-border/40 px-1.5 py-0.5 rounded text-sharon-muted font-sans ">
                        {entry.tags[0]}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center border border-dashed border-card-border rounded-lg bg-sharon-muted-light/10">
            <p className="text-xs italic text-sharon-muted font-sans">Your digital autobiography is empty.</p>
            <p className="text-[10px] text-sharon-muted font-sans mt-0.5">Write your first log using the workspace above.</p>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Log"
        message="Are you sure you want to delete this journal log forever? This cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setDeleteTargetId(null);
        }}
      />
    </div>
  );
}
