export type Stream = 'علوم تجريبية' | 'رياضيات' | 'تقني رياضي' | 'تسيير واقتصاد' | 'آداب وفلسفة' | 'لغات أجنبية';
export type Language = 'fr' | 'en' | 'ar' | 'es';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  stream?: Stream;
  currentAverage?: number;
  targetGrade?: number;
  points: number;
  badges: string[];
  onboardingCompleted: boolean;
  currentStreak: number;
  lastActivityDate?: string;
  lastLoginDate?: string;
  createdAt: string;
  language?: Language;
  passions?: string[];
  hobbies?: string[];
  universityGoal?: string;
  discoverySource?: string;
  subjectTargets?: Record<string, number>;
  currentGrades?: Record<string, number>;
  aiAnalysis?: {
    strengths: string[];
    weaknesses: string[];
    recommendedPlan: string;
  };
  motivationSettings?: {
    enabled: boolean;
    type: 'motivation' | 'spiritual' | 'both';
  };
  theme?: 'indigo' | 'emerald' | 'rose';
  favorites?: string[];
  title?: string;
  paid?: boolean;
  status?: "inactive" | "pending" | "active";
}

export interface Task {
  id: string;
  uid: string;
  title: string;
  subject: string;
  completed: boolean;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  progress: number; // 0-100
  reminderTime?: string; // ISO string
  reminderNotified?: boolean;
}

export interface SubjectProgress {
  id: string;
  uid: string;
  subjectId: string;
  progress: number;
  strength: number; // 1-5
}

export interface Notification {
  id: string;
  uid: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'task';
  read: boolean;
  createdAt: string;
}

export interface Resource {
  id: string;
  title: string;
  subject: string;
  type: 'video' | 'pdf' | 'link';
  url: string;
  author: string;
  category: 'youtube' | 'website' | 'file' | 'app';
  description?: string;
}

export interface AITool {
  name: string;
  description: string;
  url: string;
  icon: string;
  logoUrl?: string;
  videoUrl?: string;
  videoType?: 'youtube' | 'local';
  prompts: {
    title: string;
    text: string;
  }[];
}

export interface StudyGoal {
  id: string;
  uid: string;
  title: string;
  subject?: string;
  period: 'weekly' | 'monthly';
  targetValue: number;
  currentValue: number;
  unit: string;
  createdAt: string;
  deadline?: string;
}

export interface ScheduledSession {
  id: string;
  uid: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  duration: number; // minutes
  description: string;
  subjectId?: string;
  completed: boolean;
  reminderTime?: string; // ISO string
  reminderNotified?: boolean;
  createdAt: string;
}
