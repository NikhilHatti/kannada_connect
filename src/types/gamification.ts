import type { SupportedLang } from './index';

export interface GamificationLevel {
  level: number;
  title: string;
  kannadaTitle: string;
  minXp: number;
  maxXp: number;
  badgeIcon: string;
  description: string;
  perks: string[];
}

export type ScenarioTheme = 'market' | 'college' | 'transit' | 'restaurant' | 'neighborhood';

export interface WordBreakdown {
  kannada: string;
  transliteration: string;
  meaning: string;
}

export interface TaskDialogueOption {
  kannada: string;
  transliteration: string;
  english: string;
  npcReply: {
    kannada: string;
    transliteration: string;
    english: string;
  };
  bonusXp: number;
}

export interface QuestTask {
  id: string;
  scenarioId: ScenarioTheme;
  title: string;
  kannadaTitle: string;
  situation: string;
  objective: string;
  targetPhrase: {
    kannada: string;
    transliteration: string;
    english: string;
    translations: Record<SupportedLang, string>;
  };
  breakdown: WordBreakdown[];
  expectedPhonetics: string[];
  npcResponse: {
    kannada: string;
    transliteration: string;
    english: string;
  };
  xpReward: number;
  confidenceBoost: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  culturalTip: string;
  followUpOptions?: TaskDialogueOption[];
}

export interface ScenarioQuest {
  id: ScenarioTheme;
  title: string;
  kannadaTitle: string;
  icon: string;
  tagline: string;
  description: string;
  locationName: string;
  accentColor: string;
  gradient: string;
  requiredLevel: number;
  npc: {
    name: string;
    kannadaName: string;
    role: string;
    avatarEmoji: string;
    greetingKannada: string;
    greetingEnglish: string;
    greetingTransliteration: string;
  };
  tasks: QuestTask[];
}

export interface AchievementBadge {
  id: string;
  name: string;
  kannadaName: string;
  icon: string;
  description: string;
  requiredXp?: number;
  requiredTasksCount?: number;
  requiredScenario?: ScenarioTheme;
  isUnlocked?: boolean;
}

export interface GamificationProgress {
  xp: number;
  completedTaskIds: string[];
  scenarioConfidence: Record<ScenarioTheme, number>;
  streakDays: number;
  lastActiveDate: string;
  earnedBadgeIds: string[];
  voiceAttemptsCount: number;
}
