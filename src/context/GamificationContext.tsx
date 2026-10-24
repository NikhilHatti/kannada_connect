import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  GamificationLevel,
  ScenarioTheme,
  AchievementBadge,
  GamificationProgress,
} from '../types/gamification';
import {
  GAMIFICATION_LEVELS,
  SCENARIO_QUESTS,
  ACHIEVEMENT_BADGES,
} from '../data/gamificationData';
import { soundEffects } from '../utils/soundEffects';

interface GamificationContextValue {
  progress: GamificationProgress;
  currentLevel: GamificationLevel;
  nextLevel: GamificationLevel | null;
  levelProgressPercentage: number;
  overallConfidence: number;
  recentLevelUp: GamificationLevel | null;
  recentBadge: AchievementBadge | null;
  clearRecentLevelUp: () => void;
  clearRecentBadge: () => void;
  completeTask: (
    taskId: string,
    scenarioId: ScenarioTheme,
    bonusXp?: number
  ) => { xpGained: number; leveledUp: boolean; newBadges: AchievementBadge[] };
  recordVoiceAttempt: (taskId: string) => void;
  isTaskCompleted: (taskId: string) => boolean;
  isScenarioUnlocked: (scenarioId: ScenarioTheme) => boolean;
  getScenarioProgress: (scenarioId: ScenarioTheme) => {
    completed: number;
    total: number;
    percentage: number;
    confidence: number;
  };
  resetProgress: () => void;
}

const STORAGE_KEY = 'kc_gamification_state_v1';

const DEFAULT_PROGRESS: GamificationProgress = {
  xp: 0,
  completedTaskIds: [],
  scenarioConfidence: {
    market: 0,
    college: 0,
    transit: 0,
    restaurant: 0,
    neighborhood: 0,
  },
  streakDays: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  earnedBadgeIds: [],
  voiceAttemptsCount: 0,
};

function getLevelForXp(xp: number): GamificationLevel {
  for (let i = GAMIFICATION_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= GAMIFICATION_LEVELS[i].minXp) {
      return GAMIFICATION_LEVELS[i];
    }
  }
  return GAMIFICATION_LEVELS[0];
}

const GamificationContext = createContext<GamificationContextValue | null>(null);

export function GamificationProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<GamificationProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as GamificationProgress;
        // Verify streak logic
        const today = new Date().toISOString().split('T')[0];
        const lastDate = parsed.lastActiveDate;
        let streak = parsed.streakDays || 1;

        if (lastDate && lastDate !== today) {
          const diffMs = new Date(today).getTime() - new Date(lastDate).getTime();
          const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            streak += 1;
          } else if (diffDays > 1) {
            streak = 1;
          }
        }

        return {
          ...DEFAULT_PROGRESS,
          ...parsed,
          streakDays: streak,
          lastActiveDate: today,
        };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_PROGRESS;
  });

  const [recentLevelUp, setRecentLevelUp] = useState<GamificationLevel | null>(null);
  const [recentBadge, setRecentBadge] = useState<AchievementBadge | null>(null);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // ignore
    }
  }, [progress]);

  const currentLevel = getLevelForXp(progress.xp);
  const nextLevel =
    GAMIFICATION_LEVELS.find((l) => l.level === currentLevel.level + 1) || null;

  // Level progress percentage
  const levelProgressPercentage = nextLevel
    ? Math.min(
        100,
        Math.max(
          0,
          Math.round(
            ((progress.xp - currentLevel.minXp) /
              (nextLevel.minXp - currentLevel.minXp)) *
              100
          )
        )
      )
    : 100;

  // Total confidence calculation
  const totalTasks = SCENARIO_QUESTS.reduce((acc, s) => acc + s.tasks.length, 0);
  const completedCount = progress.completedTaskIds.length;
  const overallConfidence = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const isTaskCompleted = useCallback(
    (taskId: string) => progress.completedTaskIds.includes(taskId),
    [progress.completedTaskIds]
  );

  const isScenarioUnlocked = useCallback(
    (scenarioId: ScenarioTheme) => {
      const scenario = SCENARIO_QUESTS.find((s) => s.id === scenarioId);
      if (!scenario) return false;
      return currentLevel.level >= scenario.requiredLevel;
    },
    [currentLevel.level]
  );

  const getScenarioProgress = useCallback(
    (scenarioId: ScenarioTheme) => {
      const scenario = SCENARIO_QUESTS.find((s) => s.id === scenarioId);
      if (!scenario) return { completed: 0, total: 0, percentage: 0, confidence: 0 };
      const total = scenario.tasks.length;
      const completed = scenario.tasks.filter((t) =>
        progress.completedTaskIds.includes(t.id)
      ).length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      const confidence = progress.scenarioConfidence[scenarioId] || percentage;
      return { completed, total, percentage, confidence };
    },
    [progress.completedTaskIds, progress.scenarioConfidence]
  );

  const completeTask = useCallback(
    (taskId: string, scenarioId: ScenarioTheme, bonusXp = 0) => {
      const scenario = SCENARIO_QUESTS.find((s) => s.id === scenarioId);
      const task = scenario?.tasks.find((t) => t.id === taskId);
      const baseXp = task ? task.xpReward : 25;
      const earnedXp = baseXp + bonusXp;

      const alreadyDone = progress.completedTaskIds.includes(taskId);
      const newXp = progress.xp + (alreadyDone ? Math.round(earnedXp / 2) : earnedXp);

      const oldLevel = getLevelForXp(progress.xp);
      const newLevel = getLevelForXp(newXp);
      const didLevelUp = newLevel.level > oldLevel.level;

      const newCompleted = alreadyDone
        ? progress.completedTaskIds
        : [...progress.completedTaskIds, taskId];

      // Calculate new scenario confidence
      const currentScenarioTasks = scenario ? scenario.tasks.length : 1;
      const completedInScenario = scenario
        ? scenario.tasks.filter((t) => newCompleted.includes(t.id)).length
        : 1;
      const newConfidenceScore = Math.min(
        100,
        Math.round((completedInScenario / currentScenarioTasks) * 100)
      );

      const updatedConfidence = {
        ...progress.scenarioConfidence,
        [scenarioId]: newConfidenceScore,
      };

      // Check badges
      const newBadgeList: AchievementBadge[] = [];
      const currentBadgeIds = new Set(progress.earnedBadgeIds);

      ACHIEVEMENT_BADGES.forEach((badge) => {
        if (!currentBadgeIds.has(badge.id)) {
          let shouldUnlock = false;

          // First step
          if (badge.id === 'badge-first-step' && newCompleted.length >= 1) {
            shouldUnlock = true;
          }
          // XP based
          if (badge.requiredXp && newXp >= badge.requiredXp) {
            shouldUnlock = true;
          }
          // Scenario based
          if (badge.requiredScenario && scenarioId === badge.requiredScenario) {
            const allScenarioDone = scenario?.tasks.every((t) =>
              newCompleted.includes(t.id)
            );
            if (allScenarioDone) shouldUnlock = true;
          }
          // Voice master
          if (
            badge.id === 'badge-voice-master' &&
            progress.voiceAttemptsCount >= 3
          ) {
            shouldUnlock = true;
          }

          if (shouldUnlock) {
            currentBadgeIds.add(badge.id);
            newBadgeList.push(badge);
          }
        }
      });

      // Sound effects
      if (didLevelUp) {
        soundEffects.playLevelUp();
        setRecentLevelUp(newLevel);
      } else {
        soundEffects.playSuccess();
      }

      if (newBadgeList.length > 0) {
        setRecentBadge(newBadgeList[0]);
      }

      setProgress((prev) => ({
        ...prev,
        xp: newXp,
        completedTaskIds: newCompleted,
        scenarioConfidence: updatedConfidence,
        earnedBadgeIds: Array.from(currentBadgeIds),
      }));

      return {
        xpGained: earnedXp,
        leveledUp: didLevelUp,
        newBadges: newBadgeList,
      };
    },
    [progress]
  );

  const recordVoiceAttempt = useCallback((_taskId: string) => {
    setProgress((prev) => {
      const newCount = prev.voiceAttemptsCount + 1;
      const updatedBadgeIds = [...prev.earnedBadgeIds];

      if (newCount >= 3 && !updatedBadgeIds.includes('badge-voice-master')) {
        updatedBadgeIds.push('badge-voice-master');
        const badge = ACHIEVEMENT_BADGES.find((b) => b.id === 'badge-voice-master');
        if (badge) setRecentBadge(badge);
      }

      return {
        ...prev,
        voiceAttemptsCount: newCount,
        earnedBadgeIds: updatedBadgeIds,
      };
    });
  }, []);

  const clearRecentLevelUp = useCallback(() => setRecentLevelUp(null), []);
  const clearRecentBadge = useCallback(() => setRecentBadge(null), []);

  const resetProgress = useCallback(() => {
    setProgress(DEFAULT_PROGRESS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return (
    <GamificationContext.Provider
      value={{
        progress,
        currentLevel,
        nextLevel,
        levelProgressPercentage,
        overallConfidence,
        recentLevelUp,
        recentBadge,
        clearRecentLevelUp,
        clearRecentBadge,
        completeTask,
        recordVoiceAttempt,
        isTaskCompleted,
        isScenarioUnlocked,
        getScenarioProgress,
        resetProgress,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification(): GamificationContextValue {
  const ctx = useContext(GamificationContext);
  if (!ctx) {
    throw new Error('useGamification must be used within GamificationProvider');
  }
  return ctx;
}
