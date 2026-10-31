import { useState, useEffect, useRef } from 'react';
import {
  X,
  Volume2,
  Mic,
  MicOff,
  Sparkles,
  CheckCircle2,
  Lightbulb,
  Award,
  ChevronRight,
  RotateCcw,
  Languages,
} from 'lucide-react';
import type { QuestTask, ScenarioQuest } from '../../types/gamification';
import { useLanguage } from '../../context/LanguageContext';
import { useGamification } from '../../context/GamificationContext';
import { getLocalizedTask, getLocalizedScenario } from '../../data/gamificationTranslations';
import {
  speakKannada,
  stopAudio,
  createSpeechRecognizer,
  isSpeechRecognitionSupported,
  calculatePhraseMatch,
} from '../../utils/speech';
import { soundEffects } from '../../utils/soundEffects';

interface TaskModalProps {
  task: QuestTask;
  scenario: ScenarioQuest;
  onClose: () => void;
  onNextTask?: (nextTaskId: string) => void;
}

export default function TaskModal({
  task,
  scenario,
  onClose,
  onNextTask,
}: TaskModalProps) {
  const { currentLang, t } = useLanguage();
  const { completeTask, recordVoiceAttempt, isTaskCompleted } = useGamification();

  const localizedScenario = getLocalizedScenario(scenario, currentLang);
  const localizedTask = getLocalizedTask(task, currentLang);

  const [showTransliteration, setShowTransliteration] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [speechScore, setSpeechScore] = useState<number | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [hasCompleted, setHasCompleted] = useState(isTaskCompleted(task.id));
  const [earnedXp, setEarnedXp] = useState<number | null>(null);
  const [npcSpoke, setNpcSpoke] = useState(false);
  const [selectedFollowUpIndex, setSelectedFollowUpIndex] = useState<number | null>(null);
  const [isSlowAudio, setIsSlowAudio] = useState(false);

  const recognizerRef = useRef<ReturnType<typeof createSpeechRecognizer> | null>(null);

  // Play NPC Greeting when opening
  useEffect(() => {
    // Reset state for new task
    setHasCompleted(isTaskCompleted(task.id));
    setSpeechScore(null);
    setSpeechTranscript('');
    setFeedbackMessage('');
    setNpcSpoke(false);
    setSelectedFollowUpIndex(null);
  }, [task.id, isTaskCompleted]);

  // Clean up audio and recognizer on unmount
  useEffect(() => {
    return () => {
      stopAudio();
      if (recognizerRef.current) {
        try {
          recognizerRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Native translation for current selected language
  const localizedMeaning =
    task.targetPhrase.translations[currentLang] ?? task.targetPhrase.english;

  // Handle Play Audio
  function handlePlayPhrase(slow = false) {
    soundEffects.playClick();
    setIsSlowAudio(slow);
    speakKannada(task.targetPhrase.kannada, {
      slow,
      transliteration: task.targetPhrase.transliteration,
    });
  }

  function handlePlayNpcReply(text: string) {
    soundEffects.playClick();
    speakKannada(text, {
      transliteration: task.npcResponse.transliteration,
    });
  }

  // Handle Voice Recording
  function toggleSpeechRecognition() {
    soundEffects.playClick();

    if (isListening) {
      if (recognizerRef.current) {
        try {
          recognizerRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListening(false);
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      setFeedbackMessage('Mic not supported on this browser. Use "I Spoke It Out Loud" below!');
      return;
    }

    setSpeechTranscript('');
    setFeedbackMessage('Listening... Speak the Kannada phrase now! 🎙️');
    setIsListening(true);

    const recognizer = createSpeechRecognizer({
      onStart: () => {
        setIsListening(true);
      },
      onResult: (transcript, isFinal) => {
        setSpeechTranscript(transcript);
        if (isFinal) {
          setIsListening(false);
          evaluateSpeech(transcript);
        }
      },
      onError: (err) => {
        setIsListening(false);
        setFeedbackMessage(`Microphone issue: ${err}. Try manual completion!`);
      },
      onEnd: () => {
        setIsListening(false);
      },
    });

    if (recognizer) {
      recognizerRef.current = recognizer;
      try {
        recognizer.start();
      } catch {
        setIsListening(false);
      }
    }
  }

  function evaluateSpeech(transcript: string) {
    recordVoiceAttempt(task.id);
    const { score, feedback } = calculatePhraseMatch(
      transcript,
      task.targetPhrase.kannada,
      task.targetPhrase.transliteration,
      task.expectedPhonetics
    );

    setSpeechScore(score);
    setFeedbackMessage(feedback);

    if (score >= 60) {
      triggerTaskSuccess(10); // +10 bonus XP for speaking
    }
  }

  function handleManualSuccess() {
    soundEffects.playClick();
    setSpeechScore(100);
    setFeedbackMessage('Awesome! Marked as practiced with high confidence! 🌟');
    triggerTaskSuccess(0);
  }

  function triggerTaskSuccess(bonusXp = 0) {
    const res = completeTask(task.id, scenario.id, bonusXp);
    setHasCompleted(true);
    setEarnedXp(res.xpGained);
    setNpcSpoke(true);

    // Speak NPC response
    setTimeout(() => {
      speakKannada(task.npcResponse.kannada, {
        transliteration: task.npcResponse.transliteration,
      });
    }, 600);
  }

  function handleSelectFollowUp(idx: number) {
    if (!task.followUpOptions) return;
    soundEffects.playClick();
    setSelectedFollowUpIndex(idx);
    const option = task.followUpOptions[idx];

    // Speak user's choice then NPC's reply
    speakKannada(option.kannada, { transliteration: option.transliteration });
    setTimeout(() => {
      speakKannada(option.npcReply.kannada, { transliteration: option.npcReply.transliteration });
      soundEffects.playXp();
    }, 1400);
  }

  // Find next task in scenario
  const currentTaskIndex = scenario.tasks.findIndex((t) => t.id === task.id);
  const nextTask =
    currentTaskIndex >= 0 && currentTaskIndex < scenario.tasks.length - 1
      ? scenario.tasks[currentTaskIndex + 1]
      : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E8E4DC] overflow-hidden my-6 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div
          className={`px-6 py-4 bg-gradient-to-r ${scenario.gradient} text-white flex items-center justify-between`}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-2xl p-1.5 rounded-xl bg-white/20 backdrop-blur-md">
              {scenario.icon}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/25 uppercase tracking-wide">
                  {localizedScenario.title.split('&')[0]}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-400 text-amber-950">
                  {task.difficulty}
                </span>
              </div>
              <h3 className="font-bold text-base sm:text-lg leading-tight mt-0.5">
                {localizedTask.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-amber-300 text-amber-950 font-bold text-xs sm:text-sm px-3 py-1 rounded-full shadow-sm">
              <Sparkles size={14} className="text-amber-700" />
              +{task.xpReward} XP
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Situation & NPC Banner */}
          <div className="bg-[#FAF8F4] border border-[#E8E4DC] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3.5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-[#E8E4DC] flex items-center justify-center text-2xl flex-shrink-0">
                {scenario.npc.avatarEmoji}
              </div>
              <div>
                <div className="text-xs font-semibold text-[#C0392B] uppercase tracking-wider">
                  {localizedScenario.locationName}
                </div>
                <div className="font-bold text-[#1A1A1A] text-sm sm:text-base">
                  {scenario.npc.name} • {localizedScenario.npcRole}
                </div>
              </div>
            </div>

            <div className="sm:ml-auto flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-[#E8E4DC] text-xs text-[#5A5A5A] shadow-xs">
              <Lightbulb size={14} className="text-[#F5A623] flex-shrink-0" />
              <span>{localizedTask.situation}</span>
            </div>
          </div>

          {/* Mission Objective Callout */}
          <div className="border-l-4 border-[#C0392B] bg-red-50/70 p-3.5 rounded-r-xl">
            <div className="text-xs font-bold text-[#C0392B] uppercase tracking-wide">
              🎯 {t('yourSpeakingMission')}
            </div>
            <p className="text-sm font-semibold text-[#1A1A1A] mt-0.5">
              {localizedTask.objective}
            </p>
          </div>

          {/* Target Phrase Interactive Display */}
          <div className="bg-gradient-to-br from-amber-50/60 to-orange-50/40 border-2 border-amber-200/80 rounded-3xl p-5 sm:p-6 text-center space-y-4 shadow-sm relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                {t('sayThisInKannada')}
              </span>

              <button
                onClick={() => setShowTransliteration(!showTransliteration)}
                className="text-xs font-medium text-amber-800 hover:text-amber-950 flex items-center gap-1 bg-white/80 px-2.5 py-1 rounded-full border border-amber-200/60 shadow-2xs transition-colors"
              >
                <Languages size={13} />
                {showTransliteration ? t('hidePronunciationBtn') : t('showPronunciationBtn')}
              </button>
            </div>

            {/* Kannada Main Text */}
            <div className="py-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] kannada-text tracking-normal">
                {task.targetPhrase.kannada}
              </h2>

              {showTransliteration && (
                <p className="text-base sm:text-lg font-medium text-amber-900/90 mt-1.5 italic">
                  "{task.targetPhrase.transliteration}"
                </p>
              )}

              <div className="inline-block mt-2.5 px-3 py-1 rounded-xl bg-white border border-amber-200/80 text-xs sm:text-sm font-medium text-[#4A4A4A] shadow-xs">
                {t('meaningLabel')}: <span className="font-semibold text-[#1A1A1A]">{localizedMeaning}</span>
              </div>
            </div>

            {/* Audio Listen Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                onClick={() => handlePlayPhrase(false)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs ${
                  !isSlowAudio
                    ? 'bg-[#C0392B] text-white hover:bg-[#a93226]'
                    : 'bg-white text-[#1A1A1A] border border-[#E8E4DC] hover:bg-neutral-50'
                }`}
              >
                <Volume2 size={16} />
                {t('listenNormalBtn')}
              </button>

              <button
                onClick={() => handlePlayPhrase(true)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs ${
                  isSlowAudio
                    ? 'bg-[#F5A623] text-amber-950 hover:bg-[#e0951a]'
                    : 'bg-white text-[#1A1A1A] border border-[#E8E4DC] hover:bg-neutral-50'
                }`}
                title="Slower pace for easy pronunciation practice"
              >
                <Volume2 size={16} />
                {t('listenSlowBtn')}
              </button>
            </div>

            {/* Word-by-Word Breakdown */}
            {task.breakdown && task.breakdown.length > 0 && (
              <div className="pt-3 border-t border-amber-200/60">
                <div className="text-[11px] font-bold text-[#8A7A6A] uppercase tracking-wider mb-2">
                  {t('vocabBreakdownLabel')}
                </div>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {task.breakdown.map((item, idx) => (
                    <div
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-white/90 border border-amber-200/60 text-xs text-left shadow-2xs"
                    >
                      <span className="font-bold text-[#1A1A1A]">{item.kannada}</span>
                      <span className="text-amber-800/80 mx-1">→</span>
                      <span className="text-[#5A5A5A] font-medium">{item.meaning}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cultural Pro Tip */}
          {task.culturalTip && (
            <div className="flex items-start gap-3 bg-amber-50/70 border border-amber-200/70 rounded-2xl p-3.5 text-xs text-amber-950">
              <Lightbulb size={18} className="text-[#F5A623] flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">{t('culturalTipLabel')} </span>
                <span>{localizedTask.culturalTip}</span>
              </div>
            </div>
          )}

          {/* Practice & Speaking Interactive Action */}
          <div className="border border-[#E8E4DC] rounded-2xl p-5 bg-[#FAF8F4]/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#5A5A5A] uppercase tracking-wider">
                {t('practiceAndSpeak')}
              </span>
              {hasCompleted && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 size={13} /> {t('completedBadge')}
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Mic Button */}
              <button
                onClick={toggleSpeechRecognition}
                className={`w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-sm ${
                  isListening
                    ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-200'
                    : 'bg-[#1A1A1A] text-white hover:bg-neutral-800'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff size={18} />
                    {t('listeningMicBtn')}
                  </>
                ) : (
                  <>
                    <Mic size={18} className="text-[#F5A623]" />
                    {t('speakMicBtn')}
                  </>
                )}
              </button>

              {/* Manual Confirmation Alternative */}
              <button
                onClick={handleManualSuccess}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-semibold text-sm bg-white text-[#1A1A1A] border border-[#E8E4DC] hover:bg-[#FAF8F4] transition-colors shadow-xs"
              >
                <CheckCircle2 size={16} className="text-green-600" />
                {t('iSpokeOutLoudBtn')}
              </button>
            </div>

            {/* Live Transcript / Speech Feedback */}
            {speechTranscript && (
              <div className="p-3 bg-white rounded-xl border border-[#E8E4DC] text-xs">
                <span className="font-bold text-[#9A9A9A]">{t('youSaidLabel')}: </span>
                <span className="font-semibold text-[#1A1A1A]">"{speechTranscript}"</span>
              </div>
            )}

            {feedbackMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-medium flex items-center justify-between ${
                  speechScore && speechScore >= 70
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-amber-50 text-amber-900 border border-amber-200'
                }`}
              >
                <span>{feedbackMessage}</span>
                {speechScore !== null && (
                  <span className="font-bold px-2 py-0.5 bg-white rounded-full shadow-2xs">
                    Score: {speechScore}%
                  </span>
                )}
              </div>
            )}
          </div>

          {/* NPC Response & Interactive Roleplay Branch */}
          {(hasCompleted || npcSpoke) && (
            <div className="border-2 border-green-200 bg-green-50/50 rounded-2xl p-4 sm:p-5 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{scenario.npc.avatarEmoji}</span>
                  <span className="text-xs font-bold text-green-900 uppercase tracking-wide">
                    {scenario.npc.name} {t('repliesLabel')}
                  </span>
                </div>
                <button
                  onClick={() => handlePlayNpcReply(task.npcResponse.kannada)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-green-200 rounded-full text-xs font-semibold text-green-800 hover:bg-green-100 transition-colors shadow-2xs"
                >
                  <Volume2 size={13} />
                  {t('listenToReplyBtn')}
                </button>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-green-100 shadow-xs">
                <div className="font-bold text-base sm:text-lg text-green-950 kannada-text">
                  "{task.npcResponse.kannada}"
                </div>
                <div className="text-xs text-green-800/80 italic mt-0.5">
                  "{task.npcResponse.transliteration}"
                </div>
                <div className="text-xs font-medium text-[#4A4A4A] mt-1.5 pt-1.5 border-t border-neutral-100">
                  {t('translationLabel')}: <span className="font-semibold">{task.npcResponse.english}</span>
                </div>
              </div>

              {/* Follow-up Dialogue Choices */}
              {task.followUpOptions && task.followUpOptions.length > 0 && (
                <div className="pt-2 space-y-2">
                  <div className="text-xs font-bold text-[#5A5A5A] uppercase tracking-wider">
                    {t('bonusChoicesLabel')}:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {task.followUpOptions.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectFollowUp(idx)}
                        className={`text-left p-3 rounded-xl border transition-all ${
                          selectedFollowUpIndex === idx
                            ? 'bg-amber-100 border-amber-300 ring-2 ring-amber-300 shadow-xs'
                            : 'bg-white border-[#E8E4DC] hover:border-amber-300 hover:bg-amber-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#1A1A1A] kannada-text">
                            {opt.kannada}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-900">
                            +{opt.bonusXp} XP
                          </span>
                        </div>
                        <div className="text-[11px] text-[#5A5A5A] mt-0.5">{opt.english}</div>
                      </button>
                    ))}
                  </div>

                  {selectedFollowUpIndex !== null && task.followUpOptions[selectedFollowUpIndex] && (
                    <div className="p-3 bg-white/90 rounded-xl border border-amber-200 text-xs animate-fadeIn">
                      <span className="font-bold text-amber-900">{scenario.npc.name}: </span>
                      <span className="kannada-text font-semibold">
                        "{task.followUpOptions[selectedFollowUpIndex].npcReply.kannada}"
                      </span>{' '}
                      <span className="text-[#5A5A5A]">
                        ({task.followUpOptions[selectedFollowUpIndex].npcReply.english})
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Reward & Next Mission Footer Banner */}
          {hasCompleted && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-400/30 flex items-center justify-center text-amber-800">
                  <Award size={22} />
                </div>
                <div>
                  <div className="font-bold text-sm text-amber-950 flex items-center gap-1.5">
                    <span>{t('missionAccomplished')}</span>
                    <span className="text-xs font-black text-amber-900 bg-amber-200 px-2 py-0.5 rounded-full">
                      +{earnedXp ?? task.xpReward} XP
                    </span>
                  </div>
                  <div className="text-xs text-amber-800">
                    {t('confidenceBoostedIn')} {localizedScenario.title.split('&')[0]}!
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setSpeechScore(null);
                    setSpeechTranscript('');
                    setFeedbackMessage('');
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-semibold border border-amber-300 text-amber-900 bg-white hover:bg-amber-100 transition-colors flex items-center gap-1"
                >
                  <RotateCcw size={13} />
                  {t('practiceAgain')}
                </button>

                {nextTask && onNextTask && (
                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      onNextTask(nextTask.id);
                    }}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#C0392B] text-white text-xs sm:text-sm font-bold hover:bg-[#a93226] transition-colors shadow-xs"
                  >
                    {t('nextMissionBtn')}
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
