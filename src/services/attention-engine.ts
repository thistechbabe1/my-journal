import { Task, Person, CalendarEvent, AttentionItem, AttentionTier } from '@/types';
import { getLocalDateStr, diffDaysFromToday } from '@/lib/date-utils';

// ─── Helper: Get Attention Tier ───────────────────────────────────────────────

export const getAttentionTier = (score: number): AttentionTier => {
  if (score >= 80) return 'immediate';
  if (score >= 50) return 'high';
  return 'standard';
};

// ─── Task Attention Calculation ───────────────────────────────────────────────

export const computeTaskAttention = (task: Task, activeSeasonId?: string | null): AttentionItem | null => {
  if (task.status === 'complete') return null;

  let score = 0;
  const rationale: string[] = [];

  // 1. Base Priority
  if (task.priority === 'high') {
    score += 30;
    rationale.push('High Priority');
  } else if (task.priority === 'medium') {
    score += 15;
    rationale.push('Medium Priority');
  } else {
    score += 5;
  }

  // 2. Deadline / Urgency
  if (task.due_date) {
    const diff = diffDaysFromToday(task.due_date);
    if (diff < 0) {
      // Overdue: +10 per day overdue, capped at +40
      const daysOverdue = Math.abs(diff);
      const overduePenalty = Math.min(daysOverdue * 10, 40);
      score += overduePenalty;
      rationale.push(`Overdue by ${daysOverdue} day${daysOverdue > 1 ? 's' : ''}`);
    } else if (diff === 0) {
      // Due Today
      score += 35;
      rationale.push('Due Today');
    } else if (diff <= 3) {
      // Due Soon
      score += 10;
      rationale.push(`Due in ${diff} day${diff > 1 ? 's' : ''}`);
    }
  }

  // 3. Strategic Alignment (Campaign / Milestone / Goal)
  if (task.campaign) {
    score += 20;
    rationale.push(`Campaign: ${task.campaign.title}`);
  }
  if (task.milestone) {
    score += 15;
    rationale.push(`Milestone: ${task.milestone.text}`);
  }
  if (task.goal && !task.campaign) {
    score += 15;
    rationale.push(`Goal: ${task.goal.title}`);
  } else if (task.life_area && !task.campaign && !task.goal) {
    score += 5;
    rationale.push(`Area: ${task.life_area.name}`);
  }

  // 4. Seasonal Attention Boost (Active Season Goals ONLY)
  if (activeSeasonId && task.goal && (task.goal as any).season_id === activeSeasonId) {
    score += 15;
    rationale.push(`Active Seasonal Goal`);
  }

  const tier = getAttentionTier(score);

  return {
    id: `attn-task-${task.id}`,
    entity_id: task.id,
    entity_type: 'task',
    title: task.title,
    subtitle: task.notes || (task.due_date ? `Due: ${task.due_date}` : 'Task'),
    attention_score: score,
    tier,
    rationale,
    action_label: 'Complete',
    action_url: `/tasks?focus=${task.id}`,
    due_date: task.due_date
  };
};

// ─── Person Attention Calculation ──────────────────────────────────────────────

export const computePersonAttention = (person: Person): AttentionItem | null => {
  if (person.status === 'archived') return null;

  let score = 0;
  const rationale: string[] = [];

  // Check follow-up date
  if (person.next_follow_up_date) {
    const diff = diffDaysFromToday(person.next_follow_up_date);
    if (diff < 0) {
      const daysOverdue = Math.abs(diff);
      const overduePenalty = Math.min(daysOverdue * 10, 40);
      score += 30 + overduePenalty;
      rationale.push(`Follow-up overdue by ${daysOverdue} day${daysOverdue > 1 ? 's' : ''}`);
    } else if (diff === 0) {
      score += 30;
      rationale.push('Follow-up Due Today');
    }
  }

  // Waiting On item
  if (person.waiting_on && person.waiting_on.trim()) {
    score += 15;
    rationale.push(`Waiting on: ${person.waiting_on}`);
  }

  // Next Action item
  if (person.next_action && person.next_action.trim()) {
    score += 10;
    rationale.push(`Next: ${person.next_action}`);
  }

  // Life Area linked
  if (person.life_area) {
    score += 5;
  }

  // Only return items that actually require attention (score > 0)
  if (score === 0) return null;

  const tier = getAttentionTier(score);

  return {
    id: `attn-person-${person.id}`,
    entity_id: person.id,
    entity_type: 'person',
    title: person.name,
    subtitle: person.waiting_on
      ? `Waiting on: ${person.waiting_on}`
      : person.next_action
      ? `Action: ${person.next_action}`
      : person.type || 'Contact',
    attention_score: score,
    tier,
    rationale,
    action_label: 'Contact',
    action_url: `/people?selected=${person.id}`,
    person_name: person.name,
    due_date: person.next_follow_up_date
  };
};

// ─── Event Attention Calculation ───────────────────────────────────────────────

export const computeEventAttention = (event: CalendarEvent): AttentionItem | null => {
  if (event.status === 'cancelled') return null;

  const todayStr = getLocalDateStr();
  if (event.event_date !== todayStr) return null; // Today's events only for dashboard attention

  let score = 0;
  const rationale: string[] = [];

  if (event.is_all_day) {
    // All-day events get +0 time proximity bonus. Score comes only from linked goals/context.
  } else if (event.start_time) {
    const now = new Date();
    const [hours, minutes] = event.start_time.split(':').map(Number);
    const eventTime = new Date();
    eventTime.setHours(hours, minutes, 0, 0);

    const diffMinutes = Math.round((eventTime.getTime() - now.getTime()) / 60000);

    if (diffMinutes > 0 && diffMinutes <= 120) {
      // Starting in less than 2 hours
      score += 35;
      rationale.push(`Starts in ${diffMinutes} mins`);
    } else if (diffMinutes > 120 && diffMinutes <= 240) {
      // Starting in 2-4 hours
      score += 20;
      rationale.push(`Starts in ${Math.round(diffMinutes / 60)} hours`);
    } else if (diffMinutes > 240) {
      score += 10;
      rationale.push(`Scheduled today at ${event.start_time.substring(0, 5)}`);
    } else if (diffMinutes <= 0 && diffMinutes >= -120) {
      // In progress
      score += 25;
      rationale.push('Event currently in progress');
    } else {
      // Ended
      return null;
    }
  }

  if (event.goal) {
    score += 10;
    rationale.push(`${event.goal.title}`);
  }

  // Only return if event has positive attention score
  if (score === 0) return null;

  const tier = getAttentionTier(score);

  return {
    id: `attn-event-${event.id}`,
    entity_id: event.id,
    entity_type: 'event',
    title: event.title,
    subtitle: `${event.is_all_day ? 'All Day' : event.start_time ? `At ${event.start_time.substring(0, 5)}` : 'Today'}${event.location ? ` · ${event.location}` : ''}`,
    attention_score: score,
    tier,
    rationale,
    action_label: 'View',
    action_url: `/calendar?date=${event.event_date}`,
    start_time: event.start_time
  };
};

// ─── Feed Generator & Sorter ──────────────────────────────────────────────────

export const generateAttentionFeed = (
  tasks: Task[],
  people: Person[],
  events: CalendarEvent[],
  activeSeasonId?: string | null
): AttentionItem[] => {
  const items: AttentionItem[] = [];

  // 1. Process tasks
  tasks.forEach((task) => {
    const item = computeTaskAttention(task, activeSeasonId);
    if (item) items.push(item);
  });

  // 2. Process people
  people.forEach((person) => {
    const item = computePersonAttention(person);
    if (item) items.push(item);
  });

  // 3. Process events
  events.forEach((event) => {
    const item = computeEventAttention(event);
    if (item) items.push(item);
  });

  // Sort strictly by attention_score descending
  items.sort((a, b) => b.attention_score - a.attention_score);

  return items;
};
