import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Trophy,
  Flame,
  ChevronRight,
  CheckCircle2,
  Lock,
  Compass,
  ArrowLeft,
  Volume2,
  Play,
  RotateCcw,
} from 'lucide-react';
import { SCENARIO_QUESTS, ACHIEVEMENT_BADGES } from '../../data/gamificationData';
import type { ScenarioQuest, QuestTask, ScenarioTheme } from '../../types/gamification';
import { useGamification } from '../../context/GamificationContext';
import { useLanguage } from '../../context/LanguageContext';
import TaskModal from '../../components/Missions/TaskModal';
import LevelUpModal from '../../components/Missions/LevelUpModal';
import BadgeModal from '../../components/Missions/BadgeModal';
import { soundEffects } from '../../utils/soundEffects';
import { speakKannada } from '../../utils/speech';

export default function MissionsPage() {
  const { t } = useLanguage();
  const {
    progress,
    currentLevel,
    nextLevel,
    levelProgressPercentage,
    overallConfidence,
    recentLevelUp,
    recentBadge,
    clearRecentLevelUp,
    clearRecentBadge,
    isTaskCompleted,
    isScenarioUnlocked,
    getScenarioProgress,
  } = useGamification();

  // Active selected domain/realm (null = Game Map with all domains; string = specific domain quest view)
  const [selectedScenarioId, setSelectedScenarioId] = useState<ScenarioTheme | null>(null);

  const [activeTask, setActiveTask] = useState<{
    task: QuestTask;
    scenario: ScenarioQuest;
  } | null>(null);

  const selectedScenario = selectedScenarioId
    ? SCENARIO_QUESTS.find((s) => s.id === selectedScenarioId) ?? null
    : null;

  function handleSelectScenario(scenarioId: ScenarioTheme) {
    soundEffects.playClick();
    setSelectedScenarioId(scenarioId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleBackToMap() {
    soundEffects.playClick();
    setSelectedScenarioId(null);
  }

  function handleOpenTask(task: QuestTask, scenario: ScenarioQuest) {
    soundEffects.playClick();
    setActiveTask({ task, scenario });
  }

  function handleNextTaskInModal(nextTaskId: string) {
    if (!activeTask) return;
    const nextTask = activeTask.scenario.tasks.find((t) => t.id === nextTaskId);
    if (nextTask) {
      setActiveTask({ task: nextTask, scenario: activeTask.scenario });
    } else {
      setActiveTask(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 animate-fadeIn">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-[#9A9A9A]">
        <Link to="/" className="hover:text-[#1A1A1A] transition-colors">
          {t('navHome')}
        </Link>
        <span>/</span>
        <button
          onClick={handleBackToMap}
          className={`${selectedScenario ? 'hover:text-[#1A1A1A] underline cursor-pointer' : 'text-[#1A1A1A] font-medium'}`}
        >
          Game Realms
        </button>
        {selectedScenario && (
          <>
            <span>/</span>
            <span className="text-[#1A1A1A] font-bold">
              {selectedScenario.title.split('&')[0]}
            </span>
          </>
        )}
      </div>

      {/* ── Gamification Player Dashboard ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1A1A1A] via-[#2A1810] to-[#1A1A1A] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-neutral-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#F5A623] opacity-10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#C0392B] opacity-15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left: Player Level Profile */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 font-bold text-xs uppercase tracking-wider border border-amber-400/30">
                <Sparkles size={13} className="text-amber-400" />
                Karnataka Quest Arena
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/20 text-red-300 font-bold text-xs border border-red-500/30">
                <Flame size={13} className="text-red-400" />
                {progress.streakDays}-Day Streak
              </span>
            </div>

            <div>
              <div className="flex items-center gap-3">
                <span className="text-4xl p-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                  {currentLevel.badgeIcon}
                </span>
                <div>
                  <div className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
                    Level {currentLevel.level} • Player Status
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white">
                    {currentLevel.title}
                  </h1>
                  <p className="text-sm font-semibold text-[#F5A623] kannada-text">
                    {currentLevel.kannadaTitle}
                  </p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-neutral-300 mt-2 max-w-xl leading-relaxed">
                {currentLevel.description}
              </p>
            </div>

            {/* Level XP Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-amber-300 flex items-center gap-1">
                  ⭐ {progress.xp} Total XP
                </span>
                <span className="text-neutral-400">
                  {nextLevel
                    ? `${nextLevel.minXp - progress.xp} XP to Level ${nextLevel.level} (${nextLevel.title})`
                    : 'Maximum Level Attained! 👑'}
                </span>
              </div>
              <div className="w-full h-3.5 bg-neutral-800/90 rounded-full overflow-hidden p-0.5 border border-neutral-700">
                <div
                  className="h-full bg-gradient-to-r from-[#F5A623] to-[#C0392B] rounded-full transition-all duration-700 shadow-sm"
                  style={{ width: `${levelProgressPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right: Player Metrics */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Confidence</span>
                <Compass size={16} className="text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white">
                {overallConfidence}%
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5">
                Overall Karnataka readiness
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Missions</span>
                <CheckCircle2 size={16} className="text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white">
                {progress.completedTaskIds.length} / 20
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5">
                Total quests cleared
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Badges</span>
                <Trophy size={16} className="text-yellow-400" />
              </div>
              <div className="text-2xl font-black text-white">
                {progress.earnedBadgeIds.length} / {ACHIEVEMENT_BADGES.length}
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5">
                Achievements unlocked
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Voice Mic</span>
                <Sparkles size={16} className="text-purple-400" />
              </div>
              <div className="text-2xl font-black text-white">
                {progress.voiceAttemptsCount}
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5">
                Pronunciation runs
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          VIEW 1: GAME WORLDS / DOMAINS GRID (Clean game realm selector)
          ══════════════════════════════════════════════════════════════ */}
      {!selectedScenario && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C0392B] uppercase tracking-wider mb-1">
                <Sparkles size={13} />
                Game World Map
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1A1A1A]">
                Select a Realm to Enter
              </h2>
              <p className="text-xs sm:text-sm text-[#7A7A7A] mt-0.5">
                Choose a situation to view its missions, converse with local characters, and earn XP.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-[#5A5A5A] bg-white border border-[#E8E4DC] px-3.5 py-2 rounded-xl shadow-2xs self-start">
              <span>🎮 Tap any realm to see its missions</span>
            </div>
          </div>

          {/* Game Realms Compact Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SCENARIO_QUESTS.map((scenario) => {
              const isUnlocked = isScenarioUnlocked(scenario.id);
              const { completed, total, percentage, confidence } =
                getScenarioProgress(scenario.id);
              const isAllDone = completed === total && total > 0;

              return (
                <div
                  key={scenario.id}
                  onClick={() => handleSelectScenario(scenario.id)}
                  className={`group relative rounded-3xl border transition-all duration-300 p-6 flex flex-col justify-between cursor-pointer overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 ${
                    isUnlocked
                      ? 'bg-white border-[#E8E4DC] hover:border-amber-400'
                      : 'bg-neutral-50/80 border-neutral-200 opacity-75'
                  }`}
                >
                  {/* Subtle realm ambient glow */}
                  <div
                    className={`absolute -top-16 -right-16 w-36 h-36 rounded-full bg-gradient-to-br ${scenario.gradient} opacity-10 group-hover:opacity-20 blur-2xl transition-opacity pointer-events-none`}
                  />

                  {/* Card Top: Icon, Level tag & Confidence badge */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neutral-50 to-neutral-100 border border-neutral-200/80 flex items-center justify-center text-3xl shadow-xs group-hover:scale-105 transition-transform">
                        {scenario.icon}
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            isUnlocked
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : 'bg-neutral-200 text-neutral-700 flex items-center gap-1'
                          }`}
                        >
                          {!isUnlocked && <Lock size={10} />}
                          Level {scenario.requiredLevel} Realm
                        </span>

                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200">
                          {confidence}% Confidence
                        </span>
                      </div>
                    </div>

                    {/* Realm Title */}
                    <div className="space-y-1 mb-3">
                      <h3 className="text-xl font-bold text-[#1A1A1A] group-hover:text-[#C0392B] transition-colors leading-snug">
                        {scenario.title}
                      </h3>
                      <div className="text-xs font-semibold text-[#F5A623] kannada-text">
                        {scenario.kannadaTitle}
                      </div>
                    </div>

                    <p className="text-xs text-[#5A5A5A] line-clamp-2 leading-relaxed mb-4">
                      {scenario.description}
                    </p>
                  </div>

                  {/* Card Bottom: NPC & Action Button */}
                  <div className="pt-4 border-t border-neutral-100 space-y-3">
                    {/* Character Tag & Mission Progress */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{scenario.npc.avatarEmoji}</span>
                        <div>
                          <div className="font-bold text-[#1A1A1A] leading-none">
                            {scenario.npc.name.split(' ')[0]}
                          </div>
                          <div className="text-[10px] text-[#7A7A7A] mt-0.5">
                            {scenario.npc.role.split(' ')[0]}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-xs text-[#1A1A1A]">
                          {completed}/{total} Quests
                        </span>
                        <div className="text-[10px] text-emerald-600 font-semibold">
                          {isAllDone ? 'Mastered 🏆' : `${percentage}% Done`}
                        </div>
                      </div>
                    </div>

                    {/* Mini Quest Progress Bar */}
                    <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    {/* Enter Realm Button */}
                    <button
                      onClick={() => handleSelectScenario(scenario.id)}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs ${
                        isUnlocked
                          ? 'bg-[#1A1A1A] text-white hover:bg-[#C0392B] group-hover:bg-[#C0392B]'
                          : 'bg-neutral-200 text-neutral-600'
                      }`}
                    >
                      {isUnlocked ? (
                        <>
                          <span>Enter Realm & Missions</span>
                          <ChevronRight size={15} />
                        </>
                      ) : (
                        <>
                          <Lock size={13} />
                          <span>Unlocks at Level {scenario.requiredLevel}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Badges & Trophies Showcase ── */}
          <div className="bg-white rounded-3xl border border-[#E8E4DC] p-6 sm:p-8 space-y-6 shadow-sm mt-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Trophy size={20} className="text-[#F5A623]" />
                  <h3 className="text-xl font-bold text-[#1A1A1A]">
                    Trophy Room & Badges
                  </h3>
                </div>
                <p className="text-xs text-[#7A7A7A] mt-0.5">
                  Unlock cultural Karnataka trophies as you conquer missions and speak Kannada!
                </p>
              </div>
              <div className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full self-start">
                {progress.earnedBadgeIds.length} of {ACHIEVEMENT_BADGES.length} Unlocked
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {ACHIEVEMENT_BADGES.map((badge) => {
                const isUnlocked = progress.earnedBadgeIds.includes(badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-2xl border text-center transition-all ${
                      isUnlocked
                        ? 'bg-amber-50/60 border-amber-300 shadow-xs'
                        : 'bg-[#FAF8F4]/80 border-neutral-200 opacity-60'
                    }`}
                  >
                    <div
                      className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-3xl mb-2.5 ${
                        isUnlocked
                          ? 'bg-white border-2 border-amber-300 shadow-sm'
                          : 'bg-neutral-200 grayscale'
                      }`}
                    >
                      {badge.icon}
                    </div>
                    <div className="font-bold text-xs sm:text-sm text-[#1A1A1A]">
                      {badge.name}
                    </div>
                    <div className="text-[11px] font-semibold text-[#C0392B] kannada-text mt-0.5">
                      {badge.kannadaName}
                    </div>
                    <p className="text-[10px] text-[#7A7A7A] mt-1 line-clamp-2">
                      {badge.description}
                    </p>
                    <div className="mt-2.5">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isUnlocked
                            ? 'bg-amber-200 text-amber-900'
                            : 'bg-neutral-200 text-neutral-600'
                        }`}
                      >
                        {isUnlocked ? 'Unlocked 🌟' : 'Locked 🔒'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          VIEW 2: SPECIFIC DOMAIN QUEST VIEW (Visible when domain clicked)
          ══════════════════════════════════════════════════════════════ */}
      {selectedScenario && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Bar: Back Button & Realm Navigator */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleBackToMap}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#E8E4DC] text-xs sm:text-sm font-bold text-[#1A1A1A] hover:bg-[#FAF8F4] transition-colors shadow-xs"
            >
              <ArrowLeft size={16} />
              Back to Game World Map
            </button>

            {/* Quick Switcher for Realms */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {SCENARIO_QUESTS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectScenario(s.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
                    selectedScenario.id === s.id
                      ? 'bg-[#1A1A1A] text-white shadow-xs'
                      : 'bg-white text-[#5A5A5A] border border-[#E8E4DC] hover:bg-[#FAF8F4]'
                  }`}
                >
                  <span>{s.icon}</span>
                  <span>{s.title.split('&')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Realm Hero Banner */}
          <div
            className={`p-6 sm:p-8 rounded-3xl bg-gradient-to-r ${selectedScenario.gradient} text-white shadow-xl relative overflow-hidden`}
          >
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md border border-white/25 flex items-center justify-center text-4xl shadow-md flex-shrink-0">
                  {selectedScenario.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/25 uppercase tracking-wider">
                      Level {selectedScenario.requiredLevel} Realm
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-black/25">
                      📍 {selectedScenario.locationName}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black">
                    {selectedScenario.title}
                  </h2>
                  <div className="text-sm font-semibold text-amber-200 kannada-text mt-0.5">
                    {selectedScenario.kannadaTitle}
                  </div>
                  <p className="text-xs sm:text-sm text-white/90 mt-2 max-w-xl leading-relaxed">
                    {selectedScenario.description}
                  </p>
                </div>
              </div>

              {/* Character Greeting & Audio */}
              <div className="bg-black/25 backdrop-blur-md border border-white/20 rounded-2xl p-4 md:max-w-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{selectedScenario.npc.avatarEmoji}</span>
                    <div>
                      <div className="font-bold text-xs">{selectedScenario.npc.name}</div>
                      <div className="text-[10px] text-white/80">{selectedScenario.npc.role}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => speakKannada(selectedScenario.npc.greetingKannada, 0.85)}
                    className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                    title="Listen to NPC greeting"
                  >
                    <Volume2 size={15} />
                  </button>
                </div>

                <div className="text-xs text-white/95 italic bg-white/10 p-2 rounded-xl kannada-text">
                  "{selectedScenario.npc.greetingKannada}"
                </div>
                <div className="text-[11px] text-white/80">
                  "{selectedScenario.npc.greetingEnglish}"
                </div>
              </div>
            </div>

            {/* Realm Progress Bar in Banner */}
            <div className="mt-6 pt-4 border-t border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold">
              <div>
                Quests Cleared:{' '}
                <span className="text-amber-200">
                  {getScenarioProgress(selectedScenario.id).completed} of{' '}
                  {selectedScenario.tasks.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>Spoken Confidence in Realm:</span>
                <span className="px-2.5 py-0.5 bg-white/25 rounded-full">
                  {getScenarioProgress(selectedScenario.id).confidence}%
                </span>
              </div>
            </div>
          </div>

          {/* Missions Quest Stages List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#1A1A1A]">
                  Realm Missions & Dialogue Stages
                </h3>
                <p className="text-xs text-[#7A7A7A]">
                  Click on any mission to practice speaking with {selectedScenario.npc.name.split(' ')[0]} and earn XP.
                </p>
              </div>

              <span className="text-xs font-bold text-[#C0392B] bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                {selectedScenario.tasks.length} Missions Available
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {selectedScenario.tasks.map((task, idx) => {
                const done = isTaskCompleted(task.id);
                return (
                  <div
                    key={task.id}
                    onClick={() => handleOpenTask(task, selectedScenario)}
                    className={`group p-5 rounded-3xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer shadow-xs hover:shadow-md ${
                      done
                        ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-400'
                        : 'bg-white border-[#E8E4DC] hover:border-[#C0392B] hover:-translate-y-0.5'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Quest Stage Indicator */}
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black flex-shrink-0 shadow-2xs ${
                          done
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gradient-to-br from-amber-100 to-amber-200 text-amber-950 border border-amber-300'
                        }`}
                      >
                        {done ? <CheckCircle2 size={24} /> : `Q${idx + 1}`}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-base text-[#1A1A1A] group-hover:text-[#C0392B] transition-colors">
                            {task.title}
                          </span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                            <Sparkles size={11} className="text-amber-700" />
                            +{task.xpReward} XP
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              task.difficulty === 'Beginner'
                                ? 'bg-green-100 text-green-800'
                                : task.difficulty === 'Intermediate'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {task.difficulty}
                          </span>
                        </div>

                        {/* Teaser Phrase */}
                        <div className="text-xs sm:text-sm text-[#4A4A4A] flex items-center gap-2 pt-0.5">
                          <span className="font-bold text-[#1A1A1A] kannada-text text-sm sm:text-base">
                            "{task.targetPhrase.kannada}"
                          </span>
                          <span className="text-[#8A8A8A] hidden sm:inline">•</span>
                          <span className="text-[#7A7A7A] italic hidden sm:inline text-xs">
                            "{task.targetPhrase.transliteration}"
                          </span>
                        </div>

                        <p className="text-xs text-[#7A7A7A]">
                          Goal: {task.objective}
                        </p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center gap-3 self-end sm:self-center flex-shrink-0">
                      {done ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1">
                            <CheckCircle2 size={13} />
                            Cleared
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenTask(task, selectedScenario);
                            }}
                            className="p-2 rounded-xl text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                            title="Practice again"
                          >
                            <RotateCcw size={15} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenTask(task, selectedScenario)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C0392B] text-white text-xs sm:text-sm font-bold hover:bg-[#a93226] transition-all shadow-xs"
                        >
                          <Play size={13} fill="currentColor" />
                          <span>Start Mission</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Active Task Modal */}
      {activeTask && (
        <TaskModal
          task={activeTask.task}
          scenario={activeTask.scenario}
          onClose={() => setActiveTask(null)}
          onNextTask={handleNextTaskInModal}
        />
      )}

      {/* Level Up Celebration Modal */}
      {recentLevelUp && (
        <LevelUpModal
          level={recentLevelUp}
          onClose={clearRecentLevelUp}
        />
      )}

      {/* Badge Unlocked Notification Modal */}
      {recentBadge && (
        <BadgeModal
          badge={recentBadge}
          onClose={clearRecentBadge}
        />
      )}
    </div>
  );
}
