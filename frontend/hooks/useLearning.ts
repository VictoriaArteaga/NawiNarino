import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getActivity,
  getLesson,
  getLessonActivities,
  getLessons,
  getLanguageProgress,
  getProgress,
  submitActivity,
} from "../services/learning.service";
import type { ActivitySubmission } from "../types/learning";

export function useLessons(languageId: number) {
  return useQuery({
    queryKey: ["languages", languageId, "lessons"],
    queryFn: () => getLessons(languageId),
    enabled: Number.isInteger(languageId) && languageId > 0,
  });
}

export function useLesson(lessonId: number) {
  return useQuery({
    queryKey: ["lessons", lessonId],
    queryFn: () => getLesson(lessonId),
    enabled: Number.isInteger(lessonId) && lessonId > 0,
  });
}

export function useLessonActivities(lessonId: number) {
  return useQuery({
    queryKey: ["lessons", lessonId, "activities"],
    queryFn: () => getLessonActivities(lessonId),
    enabled: Number.isInteger(lessonId) && lessonId > 0,
  });
}

export function useActivity(activityId: number) {
  return useQuery({
    queryKey: ["activities", activityId],
    queryFn: () => getActivity(activityId),
    enabled: Number.isInteger(activityId) && activityId > 0,
  });
}

export function useSubmitActivity(activityId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (submission: ActivitySubmission) =>
      submitActivity(activityId, submission),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["progress"] });
      void queryClient.invalidateQueries({ queryKey: ["lessons"] });
    },
  });
}

export function useProgress() {
  return useQuery({
    queryKey: ["progress", "local-demo-user"],
    queryFn: () => getProgress(),
  });
}

export function useLanguageProgress(languageId: number) {
  return useQuery({
    queryKey: ["progress", "local-demo-user", languageId],
    queryFn: () => getLanguageProgress("local-demo-user", languageId),
    enabled: Number.isInteger(languageId) && languageId > 0,
  });
}
