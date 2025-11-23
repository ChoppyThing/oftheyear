export type VotingPhase = 'nomination' | 'vote' | 'results';

export interface PhaseInfo {
  phase: VotingPhase;
  link: string;
  label: string;
}

/**
 * Calcule le lundi deux semaines avant Noël
 */
export function getVotingStartDate(year: number): Date {
  const twoWeeksBeforeChristmas = new Date(year, 11, 11); // 11 décembre
  const dayOfWeek = twoWeeksBeforeChristmas.getDay();
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  
  const votingStart = new Date(twoWeeksBeforeChristmas);
  
  votingStart.setDate(votingStart.getDate() - daysToSubtract);
  votingStart.setHours(0, 0, 0, 0);
  
  return votingStart;
}

/**
 * Détermine la phase actuelle
 * Phase 1 (nomination): 1er janvier → lundi 2 semaines avant Noël
 * Phase 2 (vote): lundi 2 semaines avant Noël → 23 décembre 23h59
 * Phase 3 (results): 24 décembre → 31 décembre
 */
export function getCurrentPhase(): VotingPhase {
  // Dev
  //return 'vote';

  const now = new Date();
  const currentYear = now.getFullYear();
  
  // Phase 2 start: lundi 2 semaines avant Noël
  const votingStart = getVotingStartDate(currentYear);
  
  // Phase 3 start: 24 décembre 00h00
  const resultsStart = new Date(currentYear, 11, 24, 0, 0, 0);
  
  // Phase 1 end / New year: 1er janvier de l'année suivante
  const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);
  
  if (now >= resultsStart && now <= yearEnd) {
    return 'results'; // Phase 3: 24-31 décembre
  }
  
  if (now >= votingStart && now < resultsStart) {
    return 'vote'; // Phase 2: ~8-23 décembre
  }
  
  return 'nomination'; // Phase 1: 1er janvier - début phase 2
}

/**
 * Retourne les infos de navigation selon la phase
 */
export function getPhaseInfo(dict: any): PhaseInfo {
  const phase = getCurrentPhase();
  
  switch (phase) {
    case 'nomination':
      return {
        phase: 'nomination',
        link: 'category',
        label: dict.header.categories,
      };
    case 'vote':
      return {
        phase: 'vote',
        link: 'user/vote',
        label: dict.header.vote,
      };
    case 'results':
      return {
        phase: 'results',
        link: 'results',
        label: dict.header.results,
      };
  }
}
