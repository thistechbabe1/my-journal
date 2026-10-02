import { Goal, Campaign, GoalMilestone, Task, StrategicProgress } from '@/types';
import { getLocalDateStr, diffDaysFromToday } from '@/lib/date-utils';

export const strategicService = {
  /**
   * Compute deterministic progress, velocity, and health metrics for a Goal or Campaign.
   * Progress semantics:
   *  - Primary strategic progress = Milestone completion percentage.
   *  - Execution / velocity signal = Linked task completions and activity recency.
   */
  calculateProgress(
    milestones: GoalMilestone[] = [],
    linkedTasks: Task[] = []
  ): StrategicProgress {
    const todayStr = getLocalDateStr();
    const totalMilestoneCount = milestones.length;
    const completedMilestoneCount = milestones.filter((m) => m.completed).length;

    // 1. Calculate Primary Strategic Progress Percentage
    let progressPercentage = 0;
    if (totalMilestoneCount > 0) {
      progressPercentage = Math.round((completedMilestoneCount / totalMilestoneCount) * 100);
    } else if (linkedTasks.length > 0) {
      const completedTasks = linkedTasks.filter((t) => t.status === 'complete').length;
      progressPercentage = Math.round((completedTasks / linkedTasks.length) * 100);
    }

    // 2. Overdue & Next Milestone Calculations
    const pendingMilestonesWithDates = milestones
      .filter((m) => !m.completed && m.target_date)
      .sort((a, b) => (a.target_date! > b.target_date! ? 1 : -1));

    const overdueMilestoneCount = milestones.filter(
      (m) => !m.completed && m.target_date && m.target_date < todayStr
    ).length;

    const nextMilestoneDate = pendingMilestonesWithDates.length > 0
      ? pendingMilestonesWithDates[0].target_date!
      : null;

    // 3. Execution & Velocity Signals
    const completedTasksList = linkedTasks.filter((t) => t.status === 'complete');
    const completedTaskCount = completedTasksList.length;

    // Filter tasks completed in the last 30 days
    const thirtyDaysAgoIso = new Date(Date.now() - 30 * 86400000).toISOString();
    const recentTasksCount = completedTasksList.filter(
      (t) => t.completed_at && t.completed_at >= thirtyDaysAgoIso
    ).length;

    // Calculate Last Activity Date (latest completed_at across milestones & tasks)
    const activityTimestamps: string[] = [];
    milestones.forEach((m) => {
      if (m.completed && m.completed_at) activityTimestamps.push(m.completed_at);
    });
    linkedTasks.forEach((t) => {
      if (t.status === 'complete' && t.completed_at) activityTimestamps.push(t.completed_at);
    });

    activityTimestamps.sort((a, b) => (a > b ? -1 : 1));
    const lastActivityAt = activityTimestamps.length > 0 ? activityTimestamps[0] : null;

    // 4. Compute Human-Readable Status Label
    let statusLabel = `${progressPercentage}% complete`;

    if (overdueMilestoneCount > 0) {
      statusLabel += ` · ⚠️ ${overdueMilestoneCount} milestone${overdueMilestoneCount > 1 ? 's' : ''} overdue`;
    } else if (nextMilestoneDate) {
      const diff = diffDaysFromToday(nextMilestoneDate);
      if (diff === 0) {
        statusLabel += ` · next milestone due today`;
      } else if (diff > 0) {
        statusLabel += ` · next milestone due in ${diff} day${diff === 1 ? '' : 's'}`;
      } else {
        statusLabel += ` · milestone overdue (${Math.abs(diff)}d ago)`;
      }
    } else if (completedMilestoneCount > 0) {
      statusLabel += ` · ${completedMilestoneCount} milestone${completedMilestoneCount > 1 ? 's' : ''} completed`;
    }

    if (lastActivityAt) {
      const daysSince = Math.max(0, Math.floor((Date.now() - new Date(lastActivityAt).getTime()) / 86400000));
      if (daysSince > 10 && progressPercentage < 100) {
        statusLabel += ` · no progress in ${daysSince} days`;
      } else if (recentTasksCount > 0) {
        statusLabel += ` · progressing (${recentTasksCount} task${recentTasksCount > 1 ? 's' : ''} done this month)`;
      }
    }

    return {
      progressPercentage,
      lastActivityAt,
      nextMilestoneDate,
      overdueMilestoneCount,
      completedMilestoneCount,
      totalMilestoneCount,
      completedTaskCount,
      recentTasksCount,
      statusLabel,
    };
  },
};
