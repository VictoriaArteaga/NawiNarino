import apiClient from "./api";
import type {
  Activity,
  ActivityResult,
  ActivitySubmission,
  Lesson,
  ProgressSummary,
} from "../types/learning";

export async function getLessons(languageId: number): Promise<Lesson[]> {
  const response = await apiClient.get<Lesson[]>(
    `/languages/${languageId}/lessons`,
  );
  return response.data;
}

export async function getLesson(lessonId: number): Promise<Lesson> {
  const response = await apiClient.get<Lesson>(`/lessons/${lessonId}`);
  return response.data;
}

export async function getLessonActivities(
  lessonId: number,
): Promise<Activity[]> {
  const response = await apiClient.get<Activity[]>(
    `/lessons/${lessonId}/activities`,
  );
  return response.data;
}

export async function getActivity(activityId: number): Promise<Activity> {
  const response = await apiClient.get<Activity>(`/activities/${activityId}`);
  return response.data;
}

export async function submitActivity(
  activityId: number,
  submission: ActivitySubmission,
): Promise<ActivityResult> {
  const response = await apiClient.post<ActivityResult>(
    `/activities/${activityId}/submit`,
    submission,
  );
  return response.data;
}

export async function getProgress(
  userId = "local-demo-user",
): Promise<ProgressSummary> {
  const response = await apiClient.get<ProgressSummary>("/progress", {
    params: { userId },
  });
  return response.data;
}

export async function getLanguageProgress(
  userId: string,
  languageId: number,
): Promise<ProgressSummary> {
  const response = await apiClient.get<ProgressSummary>(
    `/progress/${encodeURIComponent(userId)}/language/${languageId}`,
  );
  return response.data;
}
