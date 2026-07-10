'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useCampaigns } from '@/hooks/use-campaigns';
import { campaignsService } from '@/services/campaigns-service';
import { useIdentity } from '@/hooks/use-identity';
import { Campaign, CampaignTask } from '@/types';
import { 
  Megaphone, Plus, Calendar, Check, Edit3, Sparkles, 
  ArrowLeft, CheckSquare, Globe, Trash2, Send, Mic 
} from 'lucide-react';
import { useToast } from '@/components/feedback/ToastProvider';
import { 
  ActionButton, SectionTitle, FieldLabel 
} from '@/components/editorial';
import VoiceRecorder from '@/components/feedback/VoiceRecorder';

export default function CampaignsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { profile } = useIdentity();
  const { 
    campaigns, 
    activeCampaign, 
    loading: campaignsLoading, 
    refresh: refreshCampaigns 
  } = useCampaigns();

  // Selected Campaign & Tasks State
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [tasks, setTasks] = useState<CampaignTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [selectedTask, setSelectedTask] = useState<CampaignTask | null>(null);

  // Form states
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [promptsText, setPromptsText] = useState('');
  const [savingCampaign, setSavingCampaign] = useState(false);

  // Task Drafting states
  const [draftContent, setDraftContent] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [savingTask, setSavingTask] = useState(false);
  const [refiningAI, setRefiningAI] = useState(false);

  // Set initial selected campaign
  useEffect(() => {
    if (activeCampaign && !selectedCampaign) {
      setSelectedCampaign(activeCampaign);
    } else if (campaigns.length > 0 && !selectedCampaign) {
      setSelectedCampaign(campaigns[0]);
    }
  }, [campaigns, activeCampaign, selectedCampaign]);

  // Fetch tasks when selected campaign changes
  const fetchTasksForCampaign = useCallback(async (campaignId: string) => {
    setLoadingTasks(true);
    try {
      const { data, error } = await campaignsService.getCampaignTasks(campaignId);
      if (error) throw error;
      setTasks(data || []);
      
      // Auto select the first task if none selected or task belongs to another campaign
      if (data && data.length > 0) {
        setSelectedTask(data[0]);
      } else {
        setSelectedTask(null);
      }
    } catch (err: any) {
      toast(`Error loading campaign stages: ${err.message}`, 'error');
    } finally {
      setLoadingTasks(false);
    }
  }, [toast]);

  useEffect(() => {
    if (selectedCampaign) {
      fetchTasksForCampaign(selectedCampaign.id);
    } else {
      setTasks([]);
      setSelectedTask(null);
    }
  }, [selectedCampaign, fetchTasksForCampaign]);

  // Sync draft editor with selected task selection
  useEffect(() => {
    if (selectedTask) {
      setDraftContent(selectedTask.draft || '');
      setIsCompleted(selectedTask.completed || false);
      setIsPublished(selectedTask.published || false);
    } else {
      setDraftContent('');
      setIsCompleted(false);
      setIsPublished(false);
    }
  }, [selectedTask]);

  // Save/Update Task Draft
  const handleSaveTask = async () => {
    if (!selectedTask) return;
    setSavingTask(true);
    try {
      const updated = {
        ...selectedTask,
        draft: draftContent,
        completed: isCompleted,
        published: isPublished
      };

      const { data, error } = await campaignsService.saveCampaignTask(updated);
      if (error) throw error;

      // Update local state list
      setTasks((prev) => prev.map((t) => (t.id === data.id ? data : t)));
      setSelectedTask(data);
      toast(`${selectedTask.title} draft saved.`, 'success');
      refreshCampaigns();
    } catch (err: any) {
      toast(`Error saving task: ${err.message}`, 'error');
    } finally {
      setSavingTask(false);
    }
  };

  // voice note transcribe helper
  const handleVoiceTranscribe = (text: string) => {
    setDraftContent((prev) => (prev ? `${prev}\n\n${text}` : text));
    toast('Transcribed speech appended to draft.', 'success');
  };

  // AI Refine Storytelling Draft using Gemini API Key & User Profile Style
  const handleAIRefine = async () => {
    if (!selectedTask || !draftContent.trim()) {
      toast('Please write some draft content to polish first.', 'warning');
      return;
    }

    const apiKey = profile?.gemini_api_key;
    const voiceProfile = profile?.voice_profile || 'Write in a natural, conversational, and direct tone.';

    if (!apiKey) {
      toast('Please configure your Gemini API Key in Settings first (bottom toolbar).', 'warning');
      return;
    }

    setRefiningAI(true);
    try {
      const promptMessage = `
        You are Sharon's personal storytelling and branding assistant.
        Please polish and refine the following draft post for LinkedIn/X.
        
        Write in accordance with Sharon's writing voice/style guide:
        "${voiceProfile}"
        
        The storytelling prompt for this post is: "${selectedTask.prompt}"
        
        Original Draft:
        ${draftContent}
        
        Return ONLY the refined post content, polished, beautifully written, ready to copy and paste.
        Do not add greeting intros, quotes, or markdown wrappers outside the post itself.
      `;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: promptMessage
                  }
                ]
              }
            ]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API returned status ${response.status}`);
      }

      const data = await response.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (responseText && responseText.trim()) {
        setDraftContent(responseText.trim());
        toast('Draft polished with Gemini AI.', 'success');
      } else {
        toast('Gemini returned an empty response. Try again.', 'error');
      }
    } catch (err: any) {
      console.error(err);
      toast(`AI Refine failed: ${err.message || err}`, 'error');
    } finally {
      setRefiningAI(false);
    }
  };

  // Create Campaign & Batch Tasks
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startDate || !endDate) {
      toast('Please fill in all required fields.', 'warning');
      return;
    }

    setSavingCampaign(true);
    try {
      // 1. Save Campaign
      const { data: newCampaign, error: campErr } = await campaignsService.saveCampaign(user!.id, {
        title,
        description,
        start_date: startDate,
        end_date: endDate,
        status: 'active'
      });

      if (campErr) throw campErr;

      // 2. Parse and Insert batch tasks if provided
      const promptLines = promptsText
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      if (promptLines.length > 0) {
        // Create ordered tasks: Day X down to Day 1
        const tasksToInsert = promptLines.map((promptLine, idx) => {
          const totalTasks = promptLines.length;
          const orderIndex = totalTasks - idx; // Higher orderIndex for starting stages
          return {
            campaign_id: newCampaign.id,
            title: `Day ${orderIndex}`,
            prompt: promptLine,
            draft: '',
            completed: false,
            published: false,
            order_index: orderIndex
          };
        });

        await campaignsService.saveCampaignTasksBatch(tasksToInsert);
      }

      toast('New writing campaign launched successfully.', 'success');
      setIsCreating(false);
      setTitle('');
      setDescription('');
      setStartDate('');
      setEndDate('');
      setPromptsText('');
      
      await refreshCampaigns();
      setSelectedCampaign(newCampaign);
    } catch (err: any) {
      toast(`Error creating campaign: ${err.message}`, 'error');
    } finally {
      setSavingCampaign(false);
    }
  };

  // Delete Campaign
  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign? All tasks and drafts under it will be lost.')) return;
    try {
      const { error } = await campaignsService.deleteCampaign(user!.id, id);
      if (error) throw error;
      
      toast('Campaign deleted.', 'success');
      setSelectedCampaign(null);
      await refreshCampaigns();
    } catch (err: any) {
      toast(`Error deleting campaign: ${err.message}`, 'error');
    }
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto py-2">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-card-border/60 pb-6 text-left">
        <div>
          <h1 className="text-4xl font-serif font-light tracking-wide text-foreground">
            Writing Campaigns
          </h1>
          <p className="text-xs text-sharon-muted mt-1.5 font-sans">
            Plan storytelling pipelines, schedule content check-offs, and draft posts with AI.
          </p>
        </div>
        <div>
          {!isCreating ? (
            <ActionButton onClick={() => setIsCreating(true)} variant="primary">
              <Plus size={14} />
              <span>Create Campaign</span>
            </ActionButton>
          ) : (
            <ActionButton onClick={() => setIsCreating(false)}>
              <ArrowLeft size={14} />
              <span>Back to Desk</span>
            </ActionButton>
          )}
        </div>
      </div>

      {isCreating ? (
        /* Create Campaign Desk View */
        <div className="sharon-card p-6 md:p-8 max-w-2xl mx-auto text-left font-sans space-y-6 bg-card border-card-border">
          <div>
            <h3 className="font-serif text-2xl font-light text-foreground">Initialize Campaign</h3>
            <p className="text-xs text-sharon-muted mt-1">Define your storytelling chapter and batch-load prompts.</p>
          </div>

          <form onSubmit={handleCreateCampaign} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-1 md:col-span-2">
                <FieldLabel>Campaign Title</FieldLabel>
                <input
                  type="text"
                  placeholder="e.g. Graduation 2026 Countdown"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-sharon-muted-light/35 border border-card-border rounded-lg py-2 px-3 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold"
                  required
                />
              </div>

              <div className="space-y-1.5 col-span-1 md:col-span-2">
                <FieldLabel>Description / Objectives</FieldLabel>
                <textarea
                  placeholder="What is the objective of this content campaign?"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-sharon-muted-light/35 border border-card-border rounded-lg py-2 px-3 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <FieldLabel>Start Date</FieldLabel>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-sharon-muted-light/35 border border-card-border rounded-lg py-2 px-3 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <FieldLabel>End Date</FieldLabel>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-sharon-muted-light/35 border border-card-border rounded-lg py-2 px-3 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold"
                  required
                />
              </div>

              <div className="space-y-1.5 col-span-1 md:col-span-2">
                <div className="flex justify-between items-center">
                  <FieldLabel>Batch Storytelling Prompts (One prompt per line)</FieldLabel>
                  <span className="text-[9px] font-bold text-sharon-muted uppercase">Line count = Days</span>
                </div>
                <textarea
                  placeholder="e.g.&#10;Why I chose Software Engineering&#10;My lowest academic point and what it taught me&#10;Discovering tech communities..."
                  rows={6}
                  value={promptsText}
                  onChange={(e) => setPromptsText(e.target.value)}
                  className="w-full bg-sharon-muted-light/35 border border-card-border rounded-lg py-2.5 px-3.5 text-xs outline-none focus:border-sharon-primary text-foreground font-mono leading-relaxed"
                />
                <span className="text-[10px] text-sharon-muted italic block mt-1">
                  The system will automatically generate Day tasks starting from the bottom of your prompts (e.g. Day 1 starts with your first line).
                </span>
              </div>
            </div>

            <div className="pt-2">
              <ActionButton
                type="submit"
                disabled={savingCampaign}
                variant="primary"
                className="w-full py-2"
              >
                {savingCampaign ? 'Launching...' : 'Initialize & Launch Campaign'}
              </ActionButton>
            </div>
          </form>
        </div>
      ) : (
        /* Double-Pane Main Campaigns View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Pane: Campaigns Selector Drawer */}
          <div className="lg:col-span-4 space-y-5 text-left font-sans">
            <div className="sharon-card p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-card-border/40 pb-2.5">
                <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest flex items-center gap-1.5">
                  <Megaphone size={12} />
                  <span>Campaign Hub</span>
                </span>
              </div>

              {campaignsLoading ? (
                <div className="py-12 flex justify-center">
                  <div className="w-5 h-5 border border-sharon-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : campaigns.length > 0 ? (
                <div className="space-y-2">
                  {campaigns.map((c) => {
                    const isSelected = selectedCampaign?.id === c.id;
                    const isActive = c.status === 'active';
                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCampaign(c)}
                        className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-sharon-primary bg-sharon-muted-light/40 font-semibold'
                            : 'border-card-border hover:border-sharon-primary/50'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className={`text-xs font-serif leading-tight ${isSelected ? 'text-sharon-primary font-bold' : 'text-foreground'}`}>
                            {c.title}
                          </span>
                          <span className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border shrink-0 ${
                            isActive 
                              ? 'bg-sharon-primary/10 border-sharon-primary/20 text-sharon-primary'
                              : 'bg-sharon-muted-light border-card-border text-sharon-muted'
                          }`}>
                            {c.status}
                          </span>
                        </div>
                        
                        <p className="text-[10px] text-sharon-muted truncate mt-1">
                          {c.description || 'No description provided.'}
                        </p>

                        <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-card-border/20">
                          <span className="text-[9px] font-semibold text-sharon-muted flex items-center gap-1">
                            <Calendar size={10} />
                            {new Date(c.start_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} - {new Date(c.end_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCampaign(c.id);
                            }}
                            className="text-sharon-muted hover:text-danger p-1 rounded transition-colors"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-10 text-center text-sharon-muted border border-dashed border-card-border rounded-lg bg-sharon-muted-light/20">
                  <p className="text-xs italic">No writing campaigns initialized.</p>
                  <p className="text-[10px] mt-1">Click "Create Campaign" above to launch your first storytelling loop.</p>
                </div>
              )}
            </div>

            {/* Tasks Pipeline for selected campaign */}
            {selectedCampaign && (
              <div className="sharon-card p-4 space-y-4">
                <div className="flex justify-between items-center border-b border-card-border/40 pb-2.5">
                  <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest">
                    Campaign stages
                  </span>
                  <span className="text-[9px] font-bold text-sharon-muted bg-sharon-muted-light border border-card-border px-1.5 py-0.5 rounded">
                    {tasks.filter((t) => t.completed).length} / {tasks.length} Done
                  </span>
                </div>

                {loadingTasks ? (
                  <div className="py-12 flex justify-center">
                    <div className="w-5 h-5 border border-sharon-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : tasks.length > 0 ? (
                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                    {tasks.map((task) => {
                      const isTaskSelected = selectedTask?.id === task.id;
                      return (
                        <div
                          key={task.id}
                          onClick={() => setSelectedTask(task)}
                          className={`p-2.5 rounded border text-left cursor-pointer transition-all flex items-center justify-between ${
                            isTaskSelected
                              ? 'border-sharon-primary bg-sharon-muted-light/30'
                              : 'border-card-border/80 hover:border-sharon-primary/30'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate flex-1">
                            <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                              task.completed 
                                ? 'bg-sharon-accent border-sharon-accent text-white' 
                                : 'border-card-border bg-transparent'
                            }`}>
                              {task.completed && <Check size={8} />}
                            </div>
                            <div className="truncate text-left">
                              <span className={`text-[11px] font-bold block ${task.completed ? 'line-through text-sharon-muted' : 'text-foreground'}`}>
                                {task.title}
                              </span>
                              <span className="text-[9px] text-sharon-muted truncate block">
                                {task.prompt}
                              </span>
                            </div>
                          </div>
                          
                          {task.published && (
                            <span title="Published" className="ml-2 shrink-0">
                              <Globe size={11} className="text-sharon-primary" />
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-sharon-muted italic py-6 text-center">No stages created for this campaign.</p>
                )}
              </div>
            )}
          </div>

          {/* Right Pane: Selected Task Drafting Board */}
          <div className="lg:col-span-8 w-full text-left">
            {selectedTask ? (
              <div className="sharon-card p-6 md:p-8 space-y-6 bg-card border-card-border font-sans relative">
                
                {/* Stage Header */}
                <div className="flex justify-between items-start border-b border-card-border/50 pb-4">
                  <div>
                    <span className="text-[9px] font-bold text-sharon-primary bg-sharon-primary/10 border border-sharon-primary/20 px-2 py-0.5 rounded uppercase tracking-wider">
                      {selectedCampaign?.title} • {selectedTask.title}
                    </span>
                    <h3 className="font-serif text-2xl font-light text-foreground mt-2 leading-snug">
                      {selectedTask.prompt}
                    </h3>
                  </div>
                  <div>
                    <ActionButton
                      onClick={handleSaveTask}
                      disabled={savingTask}
                      variant="primary"
                      className="px-4 py-2"
                    >
                      {savingTask ? (
                        <div className="w-3.5 h-3.5 border border-background/30 border-t-background rounded-full animate-spin" />
                      ) : (
                        <Check size={13} />
                      )}
                      <span>Save Draft</span>
                    </ActionButton>
                  </div>
                </div>

                {/* Editor Actions Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-card-border/30 pb-3 font-sans select-none">
                  <div className="flex items-center gap-3">
                    <VoiceRecorder onTranscribe={handleVoiceTranscribe} />
                    
                    <button
                      onClick={handleAIRefine}
                      disabled={refiningAI || !draftContent.trim()}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-card-border bg-card text-sharon-muted hover:text-foreground hover:bg-sharon-muted-light/60 text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all disabled:opacity-50"
                      title="Refine with Gemini AI using your profile voice guidelines"
                    >
                      {refiningAI ? (
                        <div className="w-3 h-3 border border-sharon-muted border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Sparkles size={11} className="text-sharon-primary" />
                      )}
                      <span>Refine with AI</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Completed Checkbox */}
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-sharon-muted hover:text-foreground transition-colors select-none">
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={(e) => setIsCompleted(e.target.checked)}
                        className="rounded border-card-border text-sharon-accent focus:ring-sharon-accent w-3.5 h-3.5"
                      />
                      <span>Draft Written</span>
                    </label>

                    {/* Published Checkbox */}
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-sharon-muted hover:text-foreground transition-colors select-none">
                      <input
                        type="checkbox"
                        checked={isPublished}
                        onChange={(e) => setIsPublished(e.target.checked)}
                        className="rounded border-card-border text-sharon-primary focus:ring-sharon-primary w-3.5 h-3.5"
                      />
                      <span>Posted to Socials</span>
                    </label>
                  </div>
                </div>

                {/* Drafting Workspace Textarea */}
                <div className="space-y-2">
                  <FieldLabel>Draft Content (LinkedIn / X Post workspace)</FieldLabel>
                  <div className="relative">
                    <textarea
                      placeholder="Start drafting your storytelling post here... Use the voice recorder or write manually."
                      rows={12}
                      value={draftContent}
                      onChange={(e) => setDraftContent(e.target.value)}
                      className="w-full bg-sharon-muted-light/20 border border-card-border/60 rounded-xl p-4 text-sm outline-none focus:border-sharon-primary text-foreground font-sans leading-relaxed focus:bg-card transition-all"
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-sharon-muted">
                    <span>{draftContent.length} characters</span>
                    <span>Words: {draftContent.trim() === '' ? 0 : draftContent.trim().split(/\s+/).length}</span>
                  </div>
                </div>

                {/* Prompt Info Box */}
                <div className="p-4 rounded-xl bg-sharon-muted-light/30 border border-card-border/40 text-xs text-sharon-muted leading-relaxed">
                  <span className="font-bold text-[9px] uppercase tracking-wider block text-foreground mb-1">Sharon OS Storytelling Guidelines</span>
                  Public storytelling decants your lessons and builds credibility. Focus on sharing your authentic software engineering journey, student leadership challenges, and technical milestones. decant and structure clearly.
                </div>
              </div>
            ) : (
              <div className="sharon-card p-12 text-center text-sharon-muted rounded-lg bg-card border-card-border">
                <Megaphone size={32} className="mx-auto text-card-border mb-3" />
                <p className="text-sm italic">No stage selected.</p>
                <p className="text-xs mt-1">Select a campaign and choose a day task from the pipeline to open the drafting desk.</p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
