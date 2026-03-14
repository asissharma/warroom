export const PHASE_Z = [-1400, -1200, -1000, -800, -600, -400, -200, 0];
export const PHASE_COLORS = [
  '#4FC3F7',  // Foundation — blue
  '#FF6B35',  // Distributed — orange
  '#39FF14',  // Cloud — green
  '#FF4444',  // Security — red
  '#CE93D8',  // ML/AI — purple
  '#00E5FF',  // Frontend — cyan
  '#FFD700',  // Mastery — gold
  '#FF6B9D',  // Capstone — pink
];

export const PHASE_NAMES = [
  'Foundation',
  'Distributed Systems',
  'Cloud Infrastructure',
  'Security',
  'ML/AI Engineering',
  'Frontend & Real-Time',
  'Mastery Integration',
  'Capstone',
];

export const NODE_TYPE_COLORS: Record<string, string> = {
  task: '#FFB74D',
  build: '#4FC3F7',
  question: '#BA68C8',
  skill: '#81C784',
  survival: '#E57373',
  project: '#4FC3F7', // Assuming project maps to build visually
  concept: '#9575CD',
  insight: '#4DB6AC',
  resource: '#A1887F',
  custom: '#90A4AE',
  log: '#FFF59D',
};

// Map day N (1-180) to a Phase index (0-7)
export function getPhaseFromDay(dayN: number): number {
  if (dayN < 1) return 0;
  if (dayN > 180) return 7;
  return Math.min(7, Math.floor((dayN - 1) / 22.5));
}
