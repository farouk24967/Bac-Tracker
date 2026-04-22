import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../types';
import { XP_MILESTONES } from './xpMilestones';

export const BADGE_DEFINITIONS = [
  { id: 'starter', points: 100 },
  { id: 'planner', points: 150 },
  { id: 'consistent', points: 300 },
  { id: 'focused', points: 200 },
  { id: 'streak_3', points: 500 },
  { id: 'streak_7', points: 1000 },
  { id: 'top_student', points: 2000 },
  { id: 'weekly_warrior', points: 500 },
  { id: 'goal_crusher', points: 750 },
  { id: 'night_owl', points: 300 },
  { id: 'early_bird', points: 300 },
];

export const checkBadges = async (userProfile: UserProfile, context: { 
  action: 'task_created' | 'task_completed' | 'session_finished' | 'onboarding' | 'streak_update' | 'scholar' | 'goal_reached',
  metadata?: any 
}) => {
  const newBadges: string[] = [];
  const earnedBadges = userProfile.badges || [];

  switch (context.action) {
    case 'onboarding':
      if (!earnedBadges.includes('starter')) newBadges.push('starter');
      break;
    
    case 'task_created':
      if (!earnedBadges.includes('planner')) newBadges.push('planner');
      break;

    case 'task_completed':
      // logic for consistent
      if (context.metadata?.totalCompleted >= 10 && !earnedBadges.includes('consistent')) {
        newBadges.push('consistent');
      }
      
      // logic for weekly_warrior (20 tasks in a week)
      if (context.metadata?.weeklyCount >= 20 && !earnedBadges.includes('weekly_warrior')) {
        newBadges.push('weekly_warrior');
      }

      // logic for top_student
      if (context.metadata?.isTopStudent && !earnedBadges.includes('top_student')) {
        newBadges.push('top_student');
      }

      // Time based badges
      const hour = new Date().getHours();
      if ((hour >= 23 || hour < 4) && !earnedBadges.includes('night_owl')) {
        newBadges.push('night_owl');
      }
      if ((hour >= 5 && hour < 8) && !earnedBadges.includes('early_bird')) {
        newBadges.push('early_bird');
      }
      break;

    case 'goal_reached':
      if (context.metadata?.totalGoalsReached >= 5 && !earnedBadges.includes('goal_crusher')) {
        newBadges.push('goal_crusher');
      }
      break;

    case 'session_finished':
      if (!earnedBadges.includes('focused')) newBadges.push('focused');
      
      // Time based badges for sessions
      const h = new Date().getHours();
      if ((h >= 23 || h < 4) && !earnedBadges.includes('night_owl')) {
        newBadges.push('night_owl');
      }
      if ((h >= 5 && h < 8) && !earnedBadges.includes('early_bird')) {
        newBadges.push('early_bird');
      }
      break;

    case 'scholar':
      if (!earnedBadges.includes('scholar')) newBadges.push('scholar');
      break;

    case 'streak_update':
      const streak = context.metadata?.streak;
      if (streak >= 3 && !earnedBadges.includes('streak_3')) newBadges.push('streak_3');
      if (streak >= 7 && !earnedBadges.includes('streak_7')) newBadges.push('streak_7');
      break;
  }

  if (newBadges.length > 0) {
    const userRef = doc(db, 'users', userProfile.uid);
    let extraPoints = 0;
    newBadges.forEach(id => {
      const def = BADGE_DEFINITIONS.find(b => b.id === id);
      if (def) extraPoints += def.points;
    });

    await updateDoc(userRef, {
      badges: arrayUnion(...newBadges),
      points: (userProfile.points || 0) + extraPoints
    });

    return newBadges;
  }

  return [];
};

export const checkXPProgression = async (userProfile: UserProfile, newTotalPoints: number) => {
  const currentTitle = userProfile.title;
  // Find highest milestone reached
  const reachedMilestone = [...XP_MILESTONES].reverse().find(m => newTotalPoints >= m.xp);
  
  if (reachedMilestone && reachedMilestone.title['fr'] !== currentTitle) {
     const userRef = doc(db, 'users', userProfile.uid);
     await updateDoc(userRef, {
       title: reachedMilestone.title['fr'] // Use FR as internal key if needed, or better, store the ID
     });
     return reachedMilestone;
  }
  return null;
};

export const updateStreak = async (userProfile: UserProfile) => {
  const today = new Date().toISOString().split('T')[0];
  const lastDate = userProfile.lastActivityDate;
  
  if (lastDate === today) return userProfile.currentStreak;

  let newStreak = 1;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (lastDate === yesterdayStr) {
    newStreak = (userProfile.currentStreak || 0) + 1;
  } else {
    // Streak broken, reset to 1 (since user is active today)
    newStreak = 1;
  }

  const userRef = doc(db, 'users', userProfile.uid);
  
  // Calculate bonus multiplier based on streak
  let multiplier = 1;
  if (newStreak >= 7) multiplier = 1.5;
  else if (newStreak >= 3) multiplier = 1.2;

  const pointsEarned = Math.floor(newStreak * 10 * multiplier);

  await updateDoc(userRef, {
    currentStreak: newStreak,
    lastActivityDate: today,
    points: (userProfile.points || 0) + pointsEarned
  });

  // Check for streak badges
  await checkBadges(userProfile, { action: 'streak_update', metadata: { streak: newStreak } });

  return newStreak;
};
