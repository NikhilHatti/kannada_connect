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
  // Brand & Nav
  learnKannada: string;
  speakConfidently: string;
  connectWithKarnataka: string;
  heroSubtitle: string;
  startLearning: string;
  practiceWithAI: string;
  navHome: string;
  navLearn: string;
  navPractice: string;
  navMissions: string;
  navTranslate: string;
  navAbout: string;
  signIn: string;
  signOut: string;

  // Home sections
  whatDoYouNeedHelpWith: string;
  pickCategory: string;
  howItWorks: string;
  threeSimpleSteps: string;
  readyToSpeak: string;
  readyToSpeakSub: string;
  startLearningNow: string;

  // Steps
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;

  // Categories
  catBusTitle: string;
  catBusDesc: string;
  catShoppingTitle: string;
  catShoppingDesc: string;
  catRestaurantTitle: string;
  catRestaurantDesc: string;
  catHospitalTitle: string;
  catHospitalDesc: string;
  catCollegeTitle: string;
  catCollegeDesc: string;
  catPracticeTitle: string;
  catPracticeDesc: string;
  phrasesSuffix: string;
  comingSoon: string;

  // Learn & Category Pages
  chooseCategory: string;
  chooseCategoryDesc: string;
  readyToPractise: string;
  readyToPractiseDesc: string;
  backToCategories: string;
  backToHome: string;
  tapSpeaker: string;
  showPronunciation: string;
  hidePronunciation: string;

  // Practice Page
  practiceTitle: string;
  practiceSubtitle: string;
  selectScenario: string;
  scenarioAutoTitle: string;
  scenarioAutoDesc: string;
  scenarioRestaurantTitle: string;
  scenarioRestaurantDesc: string;
  scenarioDirectionsTitle: string;
  scenarioDirectionsDesc: string;
  scenarioMedicalTitle: string;
  scenarioMedicalDesc: string;
  aiPartner: string;
  yourTurn: string;
  resetConversation: string;
  chooseAnotherScenario: string;
  conversationCompleted: string;
  convoGreatJob: string;

  // Translate Page
  translatorBadge: string;
  translateTitle: string;
  translateSubtitle: string;
  inputPlaceholder: string;
  listeningPlaceholder: string;
  waitingTranslation: string;
  charactersCount: string;
  clearBtn: string;
  copyBtn: string;
  copiedBtn: string;
  speakBtn: string;
  voiceInputBtn: string;
  listeningBtn: string;
  commonPhrasesTitle: string;
  commonPhrasesSubtitle: string;

  // About Page
  aboutTitle: string;
  aboutP1: string;
  ourMission: string;
  ourMissionDesc: string;
  whatWeOffer: string;
  offerItem1: string;
  offerItem2: string;
  offerItem3: string;
  offerItem4: string;
  offerItem5: string;
  thankYouNote: string;

  // Footer
  footerTagline: string;
  madeWithLove: string;
}
