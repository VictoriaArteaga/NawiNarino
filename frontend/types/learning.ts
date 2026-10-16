export type ActivityType = "multiple_choice" | "true_false" | "matching";
export type ProgressStatus = "in_progress" | "completed";

export interface Lesson {
  id: number;
  languageId: number;
  title: string;
  description: string;
  order: number;
  isMock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityOption {
  id: number;
  label: string;
  isMock: boolean;
}

export interface ActivityQuestion {
  id: number;
  prompt: string;
  type: string;
  order: number;
  isMock: boolean;
  options: ActivityOption[];
}

export interface Activity {
  id: number;
  lessonId: number;
  title: string;
  description: string;
  type: ActivityType;
  order: number;
  isMock: boolean;
  createdAt: string;
  updatedAt: string;
  questions: ActivityQuestion[];
}

export interface ActivitySubmission {
  answers: { questionId: number; optionId: number }[];
}

export interface ActivityResult {
  activityId: number;
  isCorrect: boolean;
  score: number;
  attempts: number;
  feedback: string;
  isMock: boolean;
}

export interface ProgressRecord {
  id: number;
  userId: string;
  activityId: number;
  status: ProgressStatus;
  score: number;
  attempts: number;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProgressSummary {
  userId: string;
  languageId: number | null;
  totalActivities: number;
  completedActivities: number;
  averageScore: number;
  percentage: number;
  activities: ProgressRecord[];
}
