import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, invalidationMap } from '../services/queryClient';
import dashboardService from '../features/dashboard/dashboardService';
import resumeService from '../features/resume/resumeService';

/**
 * Dashboard data query hook.
 * Fetches aggregated dashboard profile including skills, resume stats, activity.
 */
export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => dashboardService.getUserProfile(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Resume history query hook.
 */
export function useResumeHistory() {
  return useQuery({
    queryKey: queryKeys.resumeHistory,
    queryFn: () => resumeService.getResumeHistory(),
  });
}

/**
 * Latest resume query hook.
 */
export function useLatestResume() {
  return useQuery({
    queryKey: queryKeys.resumeLatest,
    queryFn: () => resumeService.getLatestResume(),
  });
}

/**
 * Resume upload mutation hook.
 * Automatically invalidates dashboard + resume queries on success.
 *
 * Usage:
 *   const upload = useResumeUpload();
 *   upload.mutate(file, { onSuccess: (data) => ... });
 */
export function useResumeUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, onProgress }) =>
      resumeService.uploadResume(file, onProgress),
    onSuccess: () => {
      // Invalidate all related queries
      for (const key of invalidationMap.resumeUpload) {
        queryClient.invalidateQueries({ queryKey: key });
      }
    },
  });
}
