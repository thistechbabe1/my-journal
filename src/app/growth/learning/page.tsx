'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';
import { Plus, Trash2, Check, BookOpen, ArrowLeft, X, Bookmark, Globe } from 'lucide-react';
import { useToast } from '@/components/feedback/ToastProvider';
import ConfirmationModal from '@/components/feedback/ConfirmationModal';
import Link from 'next/link';
import { Divider } from '@/components/editorial';

interface LearningResource {
  id: string;
  user_id: string;
  title: string;
  author: string | null;
  resource_type: 'book' | 'podcast' | 'course' | 'video' | 'article';
  start_date: string | null;
  completion_date: string | null;
  rating: number;
  lessons: string | null;
  quotes: string[];
  reflections: string | null;
  status: 'reading' | 'completed' | 'backlog';
  category: string | null;
  created_at: string;
}

export default function LearningPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [resources, setResources] = useState<LearningResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeResource, setActiveResource] = useState<LearningResource | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [resourceType, setResourceType] = useState<'book' | 'podcast' | 'course' | 'video' | 'article'>('book');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<'reading' | 'completed' | 'backlog'>('reading');
  const [lessons, setLessons] = useState('');
  const [reflections, setReflections] = useState('');

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const fetchResources = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('learning_resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (err: any) {
      toast(`Error loading resources: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [user]);

  // Sync details editing
  useEffect(() => {
    if (activeResource) {
      setLessons(activeResource.lessons || '');
      setReflections(activeResource.reflections || '');
    } else {
      setLessons('');
      setReflections('');
    }
  }, [activeResource]);

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user) return;

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('learning_resources')
        .insert({
          user_id: user.id,
          title,
          author: author || null,
          resource_type: resourceType,
          category: category || null,
          status,
          lessons: '',
          reflections: '',
          quotes: []
        })
        .select()
        .single();

      if (error) throw error;

      toast('Learning resource logged.', 'success');
      setTitle('');
      setAuthor('');
      setCategory('');
      setStatus('reading');
      setShowAddForm(false);
      fetchResources();
    } catch (err: any) {
      toast(`Save failed: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateDetails = async () => {
    if (!activeResource) return;
    try {
      const { error } = await supabase
        .from('learning_resources')
        .update({
          lessons,
          reflections
        })
        .eq('id', activeResource.id);

      if (error) throw error;
      toast('Insights updated.', 'success');
      fetchResources();
    } catch (err: any) {
      toast(`Update failed: ${err.message}`, 'error');
    }
  };

  const handleToggleStatus = async (resource: LearningResource, nextStatus: 'reading' | 'completed' | 'backlog') => {
    try {
      const { error } = await supabase
        .from('learning_resources')
        .update({ status: nextStatus })
        .eq('id', resource.id);

      if (error) throw error;
      toast(`Status set to ${nextStatus}.`, 'success');
      fetchResources();
      if (activeResource?.id === resource.id) {
        setActiveResource({ ...resource, status: nextStatus });
      }
    } catch (err: any) {
      toast(`Update failed: ${err.message}`, 'error');
    }
  };

  const handleDeleteTrigger = (id: string) => {
    setDeleteTargetId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      const { error } = await supabase
        .from('learning_resources')
        .delete()
        .eq('id', deleteTargetId);

      if (error) throw error;
      toast('Resource deleted.', 'success');
      if (activeResource?.id === deleteTargetId) {
        setActiveResource(null);
      }
      fetchResources();
    } catch (err: any) {
      toast(`Delete failed: ${err.message}`, 'error');
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteTargetId(null);
    }
  };

  const typeLabels = {
    book: '📖 Book',
    podcast: '🎙️ Podcast',
    course: '🎓 Course',
    video: '🎥 Video',
    article: '📄 Article'
  };

  return (
    <div className="space-y-10 max-w-4xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-card-border/60 pb-6 text-left font-sans">
        <div>
          <Link
            href="/growth"
            className="text-[10px] font-bold text-sharon-primary hover:text-sharon-primary-light uppercase tracking-wider flex items-center gap-1 mb-2"
          >
            <ArrowLeft size={10} />
            <span>Growth Hub</span>
          </Link>
          <h1 className="text-4xl font-serif font-light tracking-wide text-foreground">
            Learning & Skills
          </h1>
          <p className="text-xs text-sharon-muted mt-1.5 font-sans">
            Curate books, courses, videos, podcast notes, and skill milestones.
          </p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="px-3.5 py-1.5 rounded-lg border border-sharon-primary hover:bg-sharon-muted-light/60 text-foreground font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus size={13} />
            <span>Log Resource</span>
          </button>
        )}
      </div>

      {showAddForm ? (
        /* Create Form (Borderless paper style) */
        <form onSubmit={handleCreateResource} className="space-y-6 text-left font-sans py-2 max-w-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-2xl font-light text-foreground">Log Resource</h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs font-semibold text-sharon-muted hover:text-foreground transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1 col-span-1 md:col-span-2">
              <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest block">Resource Title</span>
              <input
                type="text"
                placeholder="e.g. Designing Data-Intensive Applications"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1.5 px-0 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold placeholder:text-sharon-muted/30"
                required
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest block">Author / Host</span>
              <input
                type="text"
                placeholder="e.g. Martin Kleppmann"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1.5 px-0 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold placeholder:text-sharon-muted/30"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest block">Resource Type</span>
              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value as any)}
                className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1.5 px-0 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold"
              >
                <option value="book">Book</option>
                <option value="podcast">Podcast</option>
                <option value="course">Course</option>
                <option value="video">Video</option>
                <option value="article">Article</option>
              </select>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest block">Subject / Category</span>
              <input
                type="text"
                placeholder="e.g. System Design, Leadership"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1.5 px-0 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold placeholder:text-sharon-muted/30"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest block">Initial Status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1.5 px-0 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold"
              >
                <option value="reading">Active Study</option>
                <option value="backlog">Backlog / Queue</option>
                <option value="completed">Finished</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-sharon-primary hover:bg-sharon-primary-light text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50 transition-colors"
            >
              Log Resource
            </button>
          </div>
        </form>
      ) : (
        /* Double-Pane main learning view (borderless) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left: Index list */}
          <div className="lg:col-span-5 space-y-6 text-left font-sans">
            <div>
              <h3 className="font-serif text-lg font-medium text-foreground">Resource Index</h3>
              <p className="text-[11px] text-sharon-muted mt-1">
                Your accumulated knowledge capsules.
              </p>
            </div>

            {loading ? (
              <div className="py-8 flex justify-center">
                <div className="w-5 h-5 border border-sharon-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : resources.length > 0 ? (
              <div className="space-y-3">
                {resources.map((res) => {
                  const isSelected = activeResource?.id === res.id;
                  return (
                    <div
                      key={res.id}
                      onClick={() => setActiveResource(res)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-sharon-primary bg-sharon-muted-light/20 font-semibold'
                          : 'border-card-border/40 hover:border-sharon-primary/30'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className={`text-xs font-serif leading-tight ${isSelected ? 'text-sharon-primary font-bold' : 'text-foreground'}`}>
                          {res.title}
                        </span>
                        <span className="text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border shrink-0 bg-sharon-muted-light border-card-border/40 text-sharon-muted">
                          {res.status}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-card-border/10 text-[9px] text-sharon-muted">
                        <span>{typeLabels[res.resource_type]} {res.author && `• ${res.author}`}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTrigger(res.id);
                          }}
                          className="text-sharon-muted hover:text-danger p-0.5 transition-colors"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-sharon-muted italic py-6">No learning materials logged yet.</p>
            )}
          </div>

          {/* Right: Selected Resource Details & Curation (borderless textareas) */}
          <div className="lg:col-span-7 w-full text-left">
            {activeResource ? (
              <div className="space-y-6 font-sans relative">
                
                {/* Details Header */}
                <div className="flex justify-between items-start border-b border-card-border/20 pb-4">
                  <div>
                    <span className="text-[9px] font-bold text-sharon-primary bg-sharon-primary/10 border border-sharon-primary/20 px-2 py-0.5 rounded uppercase tracking-wider">
                      {activeResource.category || 'Core Skill'} • {typeLabels[activeResource.resource_type]}
                    </span>
                    <h3 className="font-serif text-2xl font-light text-foreground mt-2 leading-snug">
                      {activeResource.title}
                    </h3>
                    {activeResource.author && <p className="text-xs text-sharon-muted mt-1 font-semibold">Author: {activeResource.author}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {activeResource.status !== 'completed' ? (
                      <button
                        onClick={() => handleToggleStatus(activeResource, 'completed')}
                        className="px-3 py-1.5 bg-sharon-accent hover:bg-sharon-accent/90 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                      >
                        Finish Study
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleStatus(activeResource, 'reading')}
                        className="px-3 py-1.5 border border-card-border bg-card text-foreground hover:bg-sharon-muted-light/60 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                      >
                        Resume Study
                      </button>
                    )}
                  </div>
                </div>

                {/* Lessons Learned */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest block">Lessons & Takeaways</span>
                  <textarea
                    placeholder="Decant the core ideas and learning logs..."
                    rows={6}
                    value={lessons}
                    onChange={(e) => setLessons(e.target.value)}
                    onBlur={handleUpdateDetails}
                    className="w-full bg-transparent border-0 border-b border-card-border/45 rounded-none py-1.5 px-0 text-xs outline-none text-foreground font-sans leading-relaxed placeholder:text-sharon-muted/30 focus:border-sharon-primary"
                  />
                </div>

                {/* Personal reflections */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest block">Personal Reflections & Application</span>
                  <textarea
                    placeholder="How does this apply to your work or leadership constitution?"
                    rows={6}
                    value={reflections}
                    onChange={(e) => setReflections(e.target.value)}
                    onBlur={handleUpdateDetails}
                    className="w-full bg-transparent border-0 border-b border-card-border/45 rounded-none py-1.5 px-0 text-xs outline-none text-foreground font-sans leading-relaxed placeholder:text-sharon-muted/30 focus:border-sharon-primary"
                  />
                </div>

                <div className="text-[10px] text-sharon-muted italic select-none">
                  Changes save automatically when focus is left.
                </div>

              </div>
            ) : (
              <p className="text-xs text-sharon-muted italic py-12 text-center bg-sharon-muted-light/10 rounded-lg">Select a learning resource from the index to log insights.</p>
            )}
          </div>

        </div>
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete resource?"
        message="This action can't be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setDeleteTargetId(null);
        }}
      />
    </div>
  );
}
