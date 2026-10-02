import { Goal, Season, IdentityAlignment } from '@/types';

export const identityAlignmentService = {
  /**
   * Deterministically calculates identity alignment based on explicit selections.
   */
  getGoalAlignment(
    goal: Goal,
    activeSeason?: Season | null
  ): IdentityAlignment {
    const explicitValues = goal.core_values || [];
    const explicitPrinciples = goal.life_principles || [];
    const isSeasonal = Boolean(goal.season_id && activeSeason && goal.season_id === activeSeason.id);
    const seasonName = isSeasonal ? activeSeason?.name : (goal.season?.name || undefined);

    const parts: string[] = [];

    if (isSeasonal && seasonName) {
      parts.push(`Season: ${seasonName}`);
    }

    if (explicitValues.length > 0) {
      parts.push(`Value: ${explicitValues[0]}`);
    }

    if (explicitPrinciples.length > 0) {
      parts.push(`Principle: ${explicitPrinciples[0]}`);
    }

    if (goal.life_area?.name) {
      parts.push(`Area: ${goal.life_area.name}`);
    }

    const rationaleLabel = parts.length > 0 
      ? parts.join(' · ')
      : 'Unlinked to Season or Explicit Values';

    return {
      explicitValues,
      explicitPrinciples,
      isSeasonal,
      seasonName,
      rationaleLabel
    };
  }
};
