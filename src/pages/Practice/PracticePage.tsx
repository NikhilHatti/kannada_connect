import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Volume2, RotateCcw, ChevronRight, MessageCircle, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import type { UIStrings } from '../../types';
import { speakKannada } from '../../utils/speech';
import { getLocalizedDialogue } from '../../data/practiceDialogueTranslations';

/* ─── Conversation Data ─── */

interface DialogueStep {
  id: string;
  speaker: 'ai' | 'user';
  kannada: string;
  english: string;
  /** If speaker === 'ai', these are the user's reply options */
  options?: { kannada: string; english: string; nextId: string }[];
  /** If no options, this is the next step ID (for AI continuations) */
  nextId?: string;
  /** True if this is the final step */
  isEnd?: boolean;
}

interface Scenario {
  id: string;
  title: string;
  icon: string;
  description: string;
  color: string;
  steps: DialogueStep[];
}

const SCENARIOS: Scenario[] = [
  {
    id: 'auto-ride',
    title: 'Auto-Rickshaw Ride',
    icon: '🛺',
    description: 'Negotiate an auto ride to MG Road in Bengaluru.',
    color: '#F5A623',
    steps: [
      {
        id: 'a1',
        speaker: 'ai',
        kannada: 'ನಮಸ್ಕಾರ! ಎಲ್ಲಿಗೆ ಹೋಗಬೇಕು?',
        english: 'Hello! Where do you want to go?',
        options: [
          { kannada: 'MG ರೋಡ್‌ಗೆ ಹೋಗಬೇಕು.', english: 'I need to go to MG Road.', nextId: 'a2' },
          { kannada: 'ಮೆಜೆಸ್ಟಿಕ್‌ಗೆ ಹೋಗಬೇಕು.', english: 'I need to go to Majestic.', nextId: 'a2' },
        ],
      },
      {
        id: 'a2',
        speaker: 'ai',
        kannada: 'ಆಯ್ತು. ನೂರೈವತ್ತು ರೂಪಾಯಿ ಆಗುತ್ತೆ.',
        english: 'Okay. It will be 150 rupees.',
        options: [
          { kannada: 'ತುಂಬಾ ಜಾಸ್ತಿ! ನೂರು ರೂಪಾಯಿ ಮಾಡಿ.', english: 'Too much! Make it 100 rupees.', nextId: 'a3' },
          { kannada: 'ಮೀಟರ್ ಪ್ರಕಾರ ಹೋಗಿ.', english: 'Go by the meter.', nextId: 'a3b' },
        ],
      },
      {
        id: 'a3',
        speaker: 'ai',
        kannada: 'ಸರಿ, ನೂರ ಇಪ್ಪತ್ತು ಕೊಡಿ. ಕೊನೆ ಬೆಲೆ.',
        english: 'OK, give 120. Final price.',
        options: [
          { kannada: 'ಸರಿ, ಹೋಗೋಣ.', english: 'OK, let\'s go.', nextId: 'a4' },
          { kannada: 'ಬೇಡ, ನೂರು ಮಾತ್ರ.', english: 'No, only 100.', nextId: 'a4' },
        ],
      },
      {
        id: 'a3b',
        speaker: 'ai',
        kannada: 'ಸರಿ, ಮೀಟರ್ ಹಾಕ್ತೀನಿ. ಬನ್ನಿ.',
        english: 'OK, I\'ll put the meter. Come.',
        options: [
          { kannada: 'ಧನ್ಯವಾದ. ಹೋಗೋಣ.', english: 'Thank you. Let\'s go.', nextId: 'a4' },
        ],
      },
      {
        id: 'a4',
        speaker: 'ai',
        kannada: 'ಬಂದ್ಬಿಟ್ಟಿದೆ. MG ರೋಡ್ ಬಂತು.',
        english: 'We\'ve arrived. MG Road is here.',
        options: [
          { kannada: 'ಇಲ್ಲಿ ನಿಲ್ಲಿಸಿ. ಧನ್ಯವಾದ!', english: 'Stop here. Thank you!', nextId: 'a5' },
        ],
      },
      {
        id: 'a5',
        speaker: 'ai',
        kannada: '🎉 ಅದ್ಭುತ! ನೀವು ಯಶಸ್ವಿಯಾಗಿ ಆಟೋ ಪ್ರಯಾಣ ಮಾಡಿದ್ದೀರಿ!',
        english: 'Excellent! You successfully completed an auto ride!',
        isEnd: true,
      },
    ],
  },
  {
    id: 'restaurant-order',
    title: 'Ordering at a Restaurant',
    icon: '🍽️',
    description: 'Order a meal at a local Kannada restaurant.',
    color: '#C0392B',
    steps: [
      {
        id: 'r1',
        speaker: 'ai',
        kannada: 'ನಮಸ್ಕಾರ! ಏನು ಬೇಕು?',
        english: 'Hello! What would you like?',
        options: [
          { kannada: 'ಮೆನು ಕೊಡಿ, ದಯವಿಟ್ಟು.', english: 'Please give me the menu.', nextId: 'r2' },
          { kannada: 'ಒಂದು ಮಸಾಲೆ ದೋಸೆ ಬೇಕು.', english: 'I want one masala dosa.', nextId: 'r3' },
        ],
      },
      {
        id: 'r2',
        speaker: 'ai',
        kannada: 'ಇಲ್ಲಿ ಮೆನು ಇದೆ. ನಮ್ಮ ಸ್ಪೆಷಲ್ ಮಸಾಲೆ ದೋಸೆ ಮತ್ತು ಬಿಸಿಬೇಲೆ ಬಾತ್.',
        english: 'Here is the menu. Our specials are masala dosa and bisibele bath.',
        options: [
          { kannada: 'ಒಂದು ಮಸಾಲೆ ದೋಸೆ ಮತ್ತು ಒಂದು ಫಿಲ್ಟರ್ ಕಾಫಿ ಕೊಡಿ.', english: 'Give me one masala dosa and one filter coffee.', nextId: 'r3' },
          { kannada: 'ಬಿಸಿಬೇಲೆ ಬಾತ್ ಮತ್ತು ಮಜ್ಜಿಗೆ ಕೊಡಿ.', english: 'Give me bisibele bath and buttermilk.', nextId: 'r3' },
        ],
      },
      {
        id: 'r3',
        speaker: 'ai',
        kannada: 'ಖಾರ ಜಾಸ್ತಿ ಬೇಕಾ ಅಥವಾ ಕಡಿಮೆ?',
        english: 'Do you want more spice or less?',
        options: [
          { kannada: 'ಸ್ವಲ್ಪ ಖಾರ ಕಡಿಮೆ ಮಾಡಿ.', english: 'Make it a little less spicy.', nextId: 'r4' },
          { kannada: 'ಖಾರ ಜಾಸ್ತಿ ಇರಲಿ!', english: 'Keep it extra spicy!', nextId: 'r4' },
        ],
      },
      {
        id: 'r4',
        speaker: 'ai',
        kannada: 'ನಿಮ್ಮ ಊಟ ರೆಡಿ ಆಗಿದೆ. ತಿನ್ನಿ!',
        english: 'Your food is ready. Enjoy!',
        options: [
          { kannada: 'ಊಟ ತುಂಬಾ ರುಚಿಯಾಗಿದೆ! ಬಿಲ್ ತನ್ನಿ.', english: 'The food is very tasty! Bring the bill.', nextId: 'r5' },
        ],
      },
      {
        id: 'r5',
        speaker: 'ai',
        kannada: 'ಬಿಲ್ ನೂರು ರೂಪಾಯಿ. UPI ಅಥವಾ ಕ್ಯಾಶ್?',
        english: 'Bill is 100 rupees. UPI or cash?',
        options: [
          { kannada: 'UPI ಮಾಡ್ತೀನಿ.', english: 'I\'ll pay by UPI.', nextId: 'r6' },
          { kannada: 'ಕ್ಯಾಶ್ ಕೊಡ್ತೀನಿ.', english: 'I\'ll pay cash.', nextId: 'r6' },
        ],
      },
      {
        id: 'r6',
        speaker: 'ai',
        kannada: '🎉 ಧನ್ಯವಾದ! ನೀವು ರೆಸ್ಟೋರೆಂಟ್‌ನಲ್ಲಿ ಚೆನ್ನಾಗಿ ಮಾತಾಡಿದ್ದೀರಿ!',
        english: 'Thank you! You spoke well at the restaurant!',
        isEnd: true,
      },
    ],
  },
  {
    id: 'ask-directions',
    title: 'Asking for Directions',
    icon: '🗺️',
    description: 'Ask a stranger how to reach a place in Bengaluru.',
    color: '#27AE60',
    steps: [
      {
        id: 'd1',
        speaker: 'ai',
        kannada: '(ನೀವು ರಸ್ತೆಯಲ್ಲಿ ಒಬ್ಬ ವ್ಯಕ್ತಿಯನ್ನು ಕಾಣುತ್ತೀರಿ)',
        english: '(You see a person on the street)',
        options: [
          { kannada: 'ಸಾರ್, ಕ್ಷಮಿಸಿ. ಲಾಲ್‌ಬಾಗ್ ಎಲ್ಲಿದೆ?', english: 'Sir, excuse me. Where is Lalbagh?', nextId: 'd2' },
          { kannada: 'ನಮಸ್ಕಾರ, ಇಲ್ಲಿಂದ ಬಸ್ ನಿಲ್ದಾಣ ಎಷ್ಟು ದೂರ?', english: 'Hello, how far is the bus stop from here?', nextId: 'd2b' },
        ],
      },
      {
        id: 'd2',
        speaker: 'ai',
        kannada: 'ಲಾಲ್‌ಬಾಗ್ ಇಲ್ಲಿಂದ ಎರಡು ಕಿಲೋಮೀಟರ್ ಇದೆ. ನೇರವಾಗಿ ಹೋಗಿ, ನಂತರ ಎಡಕ್ಕೆ ತಿರುಗಿ.',
        english: 'Lalbagh is 2 km from here. Go straight, then turn left.',
        options: [
          { kannada: 'ನಡೆದುಕೊಂಡು ಹೋಗಬಹುದಾ?', english: 'Can I walk there?', nextId: 'd3' },
          { kannada: 'ಬಸ್ ಸಿಗುತ್ತಾ?', english: 'Will I get a bus?', nextId: 'd3b' },
        ],
      },
      {
        id: 'd2b',
        speaker: 'ai',
        kannada: 'ಬಸ್ ನಿಲ್ದಾಣ ಇಲ್ಲೇ ಹತ್ತಿರ ಇದೆ. ಐದು ನಿಮಿಷ ನಡೆಯಿರಿ.',
        english: 'The bus stop is nearby. Walk for 5 minutes.',
        options: [
          { kannada: 'ಯಾವ ದಿಕ್ಕಿಗೆ ಹೋಗಬೇಕು?', english: 'Which direction should I go?', nextId: 'd3' },
        ],
      },
      {
        id: 'd3',
        speaker: 'ai',
        kannada: 'ಹೌದು, ನೀವು ಈ ರಸ್ತೆಯಲ್ಲಿ ನೇರವಾಗಿ ಹೋಗಿ. ಸಿಗ್ನಲ್ ಹತ್ತಿರ ಎಡಕ್ಕೆ ತಿರುಗಿ.',
        english: 'Yes, go straight on this road. Turn left at the signal.',
        options: [
          { kannada: 'ತುಂಬಾ ಧನ್ಯವಾದ!', english: 'Thank you very much!', nextId: 'd4' },
        ],
      },
      {
        id: 'd3b',
        speaker: 'ai',
        kannada: 'ಹೌದು, ಬಸ್ ನಂಬರ್ 201 ತೆಗೆದುಕೊಳ್ಳಿ. ಇಲ್ಲೇ ನಿಲ್ದಾಣ ಇದೆ.',
        english: 'Yes, take bus number 201. The stop is right here.',
        options: [
          { kannada: 'ತುಂಬಾ ಧನ್ಯವಾದ, ಸಾರ್!', english: 'Thank you very much, sir!', nextId: 'd4' },
        ],
      },
      {
        id: 'd4',
        speaker: 'ai',
        kannada: '🎉 ಚೆನ್ನಾಗಿ ಮಾಡಿದ್ದೀರಿ! ನೀವು ದಾರಿ ಕೇಳುವುದನ್ನು ಕಲಿತಿದ್ದೀರಿ!',
        english: 'Well done! You learned how to ask for directions!',
        isEnd: true,
      },
    ],
  },
  {
    id: 'medical-visit',
    title: 'At the Hospital',
    icon: '🏥',
    description: 'Tell a doctor about your symptoms in Kannada.',
    color: '#3498DB',
    steps: [
      {
        id: 'm1',
        speaker: 'ai',
        kannada: 'ನಮಸ್ಕಾರ, ನಾನು ಡಾಕ್ಟರ್. ಏನಾಯಿತು?',
        english: 'Hello, I\'m the doctor. What happened?',
        options: [
          { kannada: 'ನನಗೆ ಹುಷಾರಿಲ್ಲ. ಜ್ವರ ಮತ್ತು ತಲೆನೋವು ಇದೆ.', english: 'I\'m not well. I have fever and headache.', nextId: 'm2' },
          { kannada: 'ನನಗೆ ಹೊಟ್ಟೆ ನೋವು ಇದೆ.', english: 'I have a stomach ache.', nextId: 'm2b' },
        ],
      },
      {
        id: 'm2',
        speaker: 'ai',
        kannada: 'ಎಷ್ಟು ದಿನದಿಂದ ಜ್ವರ ಇದೆ?',
        english: 'How many days have you had the fever?',
        options: [
          { kannada: 'ಎರಡು ದಿನದಿಂದ ಜ್ವರ ಇದೆ.', english: 'I have had fever for two days.', nextId: 'm3' },
          { kannada: 'ನಿನ್ನೆಯಿಂದ ಶುರು ಆಯಿತು.', english: 'It started from yesterday.', nextId: 'm3' },
        ],
      },
      {
        id: 'm2b',
        speaker: 'ai',
        kannada: 'ಏನು ತಿಂದಿರಿ ಹೊರಗಡೆ?',
        english: 'Did you eat something outside?',
        options: [
          { kannada: 'ಹೌದು, ನಿನ್ನೆ ಹೊರಗಡೆ ತಿಂದೆ.', english: 'Yes, I ate outside yesterday.', nextId: 'm3' },
          { kannada: 'ಇಲ್ಲ, ಮನೆ ಊಟ ಮಾತ್ರ ತಿಂದೆ.', english: 'No, I only had home food.', nextId: 'm3' },
        ],
      },
      {
        id: 'm3',
        speaker: 'ai',
        kannada: 'ಸರಿ. ನಿಮಗೆ ಅಲರ್ಜಿ ಏನಾದರೂ ಇದೆಯೇ?',
        english: 'OK. Do you have any allergies?',
        options: [
          { kannada: 'ಇಲ್ಲ, ಯಾವ ಅಲರ್ಜಿಯೂ ಇಲ್ಲ.', english: 'No, no allergies at all.', nextId: 'm4' },
          { kannada: 'ಹೌದು, ಡಸ್ಟ್ ಅಲರ್ಜಿ ಇದೆ.', english: 'Yes, I have dust allergy.', nextId: 'm4' },
        ],
      },
      {
        id: 'm4',
        speaker: 'ai',
        kannada: 'ಔಷಧ ಬರೆದುಕೊಡ್ತೀನಿ. ದಿನಕ್ಕೆ ಮೂರು ಬಾರಿ ತೆಗೆದುಕೊಳ್ಳಿ. ವಿಶ್ರಾಂತಿ ತೆಗೆದುಕೊಳ್ಳಿ.',
        english: 'I\'ll write a prescription. Take it three times a day. Take rest.',
        options: [
          { kannada: 'ಧನ್ಯವಾದ ಡಾಕ್ಟರ್. ಔಷಧ ಅಂಗಡಿ ಎಲ್ಲಿದೆ?', english: 'Thank you doctor. Where is the pharmacy?', nextId: 'm5' },
        ],
      },
      {
        id: 'm5',
        speaker: 'ai',
        kannada: '🎉 ಬಹಳ ಚೆನ್ನಾಗಿ ಮಾತಾಡಿದ್ದೀರಿ! ನೀವು ಆಸ್ಪತ್ರೆಯಲ್ಲಿ ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಬಹುದು!',
        english: 'Excellent! You spoke very well! You can communicate at a hospital in Kannada!',
        isEnd: true,
      },
    ],
  },
];

/* ── Chat message type ── */
interface ChatMessage {
  speaker: 'ai' | 'user';
  kannada: string;
  english: string;
}

/* ══════════════════════════════════════
   Component
   ══════════════════════════════════════ */

/* ══════════════════════════════════════
   Scenario Translations Mapping
   ══════════════════════════════════════ */
const SCENARIO_TRANSLATIONS: Record<
  string,
  { titleKey: keyof UIStrings; descKey: keyof UIStrings }
> = {
  'auto-ride': { titleKey: 'scenarioAutoTitle', descKey: 'scenarioAutoDesc' },
  'restaurant-order': { titleKey: 'scenarioRestaurantTitle', descKey: 'scenarioRestaurantDesc' },
  'ask-directions': { titleKey: 'scenarioDirectionsTitle', descKey: 'scenarioDirectionsDesc' },
  'medical-visit': { titleKey: 'scenarioMedicalTitle', descKey: 'scenarioMedicalDesc' },
};

export default function PracticePage() {
  const { t, currentLang } = useLanguage();
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [currentStepId, setCurrentStepId] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [completed, setCompleted] = useState(false);

  /* ── Start a scenario ── */
  const startScenario = useCallback((scenario: Scenario) => {
    setSelectedScenario(scenario);
    setCurrentStepId(scenario.steps[0].id);
    setChatHistory([
      { speaker: 'ai', kannada: scenario.steps[0].kannada, english: scenario.steps[0].english },
    ]);
    setCompleted(false);
  }, []);

  /* ── Handle user choice ── */
  const handleChoice = useCallback(
    (option: { kannada: string; english: string; nextId: string }) => {
      if (!selectedScenario) return;

      // Add user message
      const newHistory: ChatMessage[] = [
        ...chatHistory,
        { speaker: 'user', kannada: option.kannada, english: option.english },
      ];

      // Find next step
      const nextStep = selectedScenario.steps.find((s) => s.id === option.nextId);
      if (nextStep) {
        newHistory.push({ speaker: 'ai', kannada: nextStep.kannada, english: nextStep.english });
        setCurrentStepId(nextStep.id);
        if (nextStep.isEnd) setCompleted(true);
      }

      setChatHistory(newHistory);

      // Auto scroll to bottom
      setTimeout(() => {
        const el = document.getElementById('chat-bottom');
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    },
    [selectedScenario, chatHistory]
  );

  /* ── Reset ── */
  function handleReset() {
    setSelectedScenario(null);
    setCurrentStepId('');
    setChatHistory([]);
    setCompleted(false);
  }

  /* ── Get current step ── */
  const currentStep = selectedScenario?.steps.find((s) => s.id === currentStepId);

  /* ══ Scenario selection screen ══ */
  if (!selectedScenario) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-2 text-sm text-[#9A9A9A] mb-6">
          <Link to="/" className="hover:text-[#1A1A1A]">{t('navHome')}</Link>
          <span>/</span>
          <span className="text-[#1A1A1A]">{t('navPractice')}</span>
        </div>

        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-[#5A5A5A] hover:text-[#1A1A1A] mb-8 transition-colors">
          <ArrowLeft size={15} />
          {t('backToHome')}
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-[#FDE8C0] to-[#FADADD] rounded-full text-xs font-semibold text-[#C0392B] uppercase tracking-wide mb-4">
            <Sparkles size={13} />
            {t('practiceWithAI')}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] mb-2">
            {t('practiceTitle')}
          </h1>
          <p className="text-[#5A5A5A] text-sm max-w-md mx-auto">
            {t('practiceSubtitle')}
          </p>
        </div>

        {/* Gamified Levels Callout Banner */}
        <div className="max-w-2xl mx-auto mb-8 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 rounded-3xl p-5 sm:p-6 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white font-bold text-xs uppercase tracking-wider">
              <Sparkles size={12} />
              {t('practiceGamifiedBadge')}
            </div>
            <h2 className="text-lg sm:text-xl font-black">
              {t('practiceGamifiedBannerTitle')}
            </h2>
            <p className="text-xs text-white/90">
              {t('practiceGamifiedBannerSub')}
            </p>
          </div>
          <Link
            to="/missions"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-neutral-900 font-bold text-xs sm:text-sm rounded-xl hover:bg-neutral-100 transition-colors shadow-xs flex-shrink-0"
          >
            {t('practiceGamifiedBannerBtn')}
            <ChevronRight size={15} />
          </Link>
        </div>

        {/* Scenario cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
          {SCENARIOS.map((scenario) => {
            const mapping = SCENARIO_TRANSLATIONS[scenario.id];
            const title = mapping ? t(mapping.titleKey) : scenario.title;
            const desc = mapping ? t(mapping.descKey) : scenario.description;

            return (
              <button
                key={scenario.id}
                onClick={() => startScenario(scenario)}
                className="bg-white rounded-2xl border border-[#E8E4DC] p-6 text-left shadow-sm hover:shadow-md hover:border-[#C0392B]/30 hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4"
                  style={{ background: `${scenario.color}18` }}
                >
                  {scenario.icon}
                </div>
                <h3 className="text-base font-bold text-[#1A1A1A] mb-1 group-hover:text-[#C0392B] transition-colors">
                  {title}
                </h3>
                <p className="text-xs text-[#9A9A9A] leading-relaxed mb-3">{desc}</p>
                <div className="flex items-center gap-1 text-xs font-semibold text-[#C0392B] opacity-0 group-hover:opacity-100 transition-opacity">
                  {t('startLearning')} <ChevronRight size={12} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  /* ══ Conversation screen ══ */
  const selectedMapping = selectedScenario ? SCENARIO_TRANSLATIONS[selectedScenario.id] : undefined;
  const currentScenarioTitle = selectedMapping ? t(selectedMapping.titleKey) : selectedScenario.title;
  const currentScenarioDesc = selectedMapping ? t(selectedMapping.descKey) : selectedScenario.description;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-2 text-sm text-[#9A9A9A] mb-6">
        <Link to="/" className="hover:text-[#1A1A1A]">{t('navHome')}</Link>
        <span>/</span>
        <button onClick={handleReset} className="hover:text-[#1A1A1A]">{t('navPractice')}</button>
        <span>/</span>
        <span className="text-[#1A1A1A]">{currentScenarioTitle}</span>
      </div>

      <button
        onClick={handleReset}
        className="inline-flex items-center gap-1.5 text-sm text-[#5A5A5A] hover:text-[#1A1A1A] mb-6 transition-colors"
      >
        <ArrowLeft size={15} />
        {t('chooseAnotherScenario')}
      </button>

      {/* Scenario header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ background: `${selectedScenario.color}18` }}
        >
          {selectedScenario.icon}
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#1A1A1A]">{currentScenarioTitle}</h2>
          <p className="text-xs text-[#9A9A9A]">{currentScenarioDesc}</p>
        </div>
      </div>

      {/* Chat area */}
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-3xl border border-[#E8E4DC] shadow-sm overflow-hidden">
          {/* Messages */}
          <div className="p-5 space-y-4 max-h-[420px] overflow-y-auto">
            {chatHistory.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.speaker === 'user'
                      ? 'bg-gradient-to-br from-[#C0392B] to-[#96281B] text-white rounded-br-md'
                      : 'bg-[#FAF8F4] border border-[#E8E4DC] text-[#1A1A1A] rounded-bl-md'
                  }`}
                >
                  {/* Kannada text */}
                  <div className="flex items-start gap-2">
                    <p className={`text-sm font-semibold kannada-text leading-relaxed ${msg.speaker === 'user' ? 'text-white' : 'text-[#1A1A1A]'}`}>
                      {msg.kannada}
                    </p>
                    <button
                      onClick={() => speakKannada(msg.kannada)}
                      className={`shrink-0 mt-0.5 ${msg.speaker === 'user' ? 'text-white/60 hover:text-white' : 'text-[#F5A623] hover:text-[#E8941A]'} transition-colors`}
                      title={t('speakBtn')}
                    >
                      <Volume2 size={14} />
                    </button>
                  </div>
                  {/* Translation */}
                  <p className={`text-xs mt-1.5 leading-relaxed ${msg.speaker === 'user' ? 'text-white/60' : 'text-[#9A9A9A]'}`}>
                    {getLocalizedDialogue(msg.english, currentLang)}
                  </p>
                </div>
              </div>
            ))}
            <div id="chat-bottom" />
          </div>

          {/* ── Reply options or completion ── */}
          <div className="border-t border-[#E8E4DC] p-4 bg-[#FEFDFB]">
            {completed ? (
              <div className="text-center">
                <p className="text-sm font-medium text-[#1A1A1A] mb-1">{t('conversationCompleted')} 🎉</p>
                <p className="text-xs text-[#5A5A5A] mb-4">{t('convoGreatJob')}</p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => startScenario(selectedScenario)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E8E4DC] text-sm font-medium text-[#5A5A5A] hover:bg-[#FAF8F4] transition-colors"
                  >
                    <RotateCcw size={13} />
                    {t('resetConversation')}
                  </button>
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C0392B] text-white text-sm font-semibold hover:bg-[#a93226] transition-colors"
                  >
                    <MessageCircle size={13} />
                    {t('chooseAnotherScenario')}
                  </button>
                </div>
              </div>
            ) : currentStep?.options ? (
              <div className="space-y-2">
                <p className="text-xs text-[#9A9A9A] mb-2 font-medium">{t('yourTurn')}</p>
                {currentStep.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleChoice(opt)}
                    className="w-full text-left px-4 py-3 rounded-xl border border-[#E8E4DC] bg-white hover:border-[#C0392B]/40 hover:bg-red-50/50 transition-all duration-150 group"
                  >
                    <p className="text-sm font-semibold text-[#1A1A1A] kannada-text group-hover:text-[#C0392B] transition-colors">
                      {opt.kannada}
                    </p>
                    <p className="text-xs text-[#9A9A9A] mt-0.5">
                      {getLocalizedDialogue(opt.english, currentLang)}
                    </p>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
