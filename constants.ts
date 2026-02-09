// Fallback images in case the user doesn't replace them with their own assets immediately
// Honey background similar to the user's request
export const BACKGROUND_IMAGE_URL = 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=2000';

// Placeholder logic for Colb logo (Black diamond with yellow accent) if the user's upload isn't directly linkable
export const LOGO_PLACEHOLDER_URL = 'https://ui-avatars.com/api/?name=CF&background=000000&color=FACC15&bold=true&size=128&rounded=true';

export const GAME_DURATION = 60; // seconds (Default)
export const HINT_COST = 5; // points deduction
export const SKIP_COST = 10; // points deduction
export const CORRECT_POINTS = 20;

export const INITIAL_WORDS: string[] = [
  'YIELD',
  'HONEY',
  'HIVE',
  'STAKING',
  'FINANCE',
  'CRYPTO',
  'WALLET',
  'TOKEN',
  'REWARD',
  'ASSET',
  'BLOCKCHAIN',
  'LIQUIDITY',
  'DECENTRALIZED',
  'COLB',
  'SWARM',
  'NECTAR',
  'POLLEN',
  'QUEEN',
  'WORKER',
  'BITCOIN'
];

export const DIFFICULTY_SETTINGS = {
  EASY: {
    label: 'Easy',
    duration: 90,
    description: '90s • Simple Words',
    promptModifier: 'simple, basic, widely known, beginner-friendly',
    pointsMultiplier: 0.8
  },
  MEDIUM: {
    label: 'Medium',
    duration: 60,
    description: '60s • Standard',
    promptModifier: 'standard, common, intermediate',
    pointsMultiplier: 1
  },
  HARD: {
    label: 'Hard',
    duration: 45,
    description: '45s • Complex Words',
    promptModifier: 'complex, obscure, technical, advanced, cryptic',
    pointsMultiplier: 1.5
  }
};