export interface Language {
  code: string;
  label: string;
  nativeLabel: string;
}

export type SupportedLang = 'en' | 'hi' | 'ta' | 'te' | 'ml' | 'mr' | 'bn';

export interface Phrase {
  id: string;
  kannada: string;
  transliteration: string;
  context?: string;
  // translations: keyed by language code, value is the phrase in that language
  translations: Record<SupportedLang, string>;
}

export interface FeatureCard {
  id: string;
  title: string;
  kannadaTitle: string;
  description: string;
  icon: string;
  color: string;
  path: string;
  phrases: Phrase[];
}

export interface HowItWorksStep {
  step: number;
  title: string;
  description: string;
  icon: string;
}

/** UI strings for each supported language */
export interface UIStrings {
  learnKannada: string;
  speakConfidently: string;
  connectWithKarnataka: string;
  heroSubtitle: string;
  startLearning: string;
  practiceWithAI: string;
  whatDoYouNeedHelpWith: string;
  pickCategory: string;
  howItWorks: string;
  threeSimpleSteps: string;
  readyToSpeak: string;
  readyToSpeakSub: string;
  startLearningNow: string;
  chooseCategory: string;
  chooseCategoryDesc: string;
  readyToPractise: string;
  readyToPractiseDesc: string;
  backToCategories: string;
  tapSpeaker: string;
  showPronunciation: string;
  hidePronunciation: string;
}
