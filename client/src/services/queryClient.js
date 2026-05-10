import { QueryClient } from '@tanstack/react-query';

/**
 * Centralized TanStack Query client configuration.
 *
 * Strategy:
 * - staleTime: 5 min — avoid redundant refetches on tab focus
 * - gcTime: 30 min — keep data cached for fast back-navigation
 * - retry: 1 — single retry to avoid hammering a down server
 * - refetchOnWindowFocus: false — explicit control over refetching
 *
 * Query Key Naming Conventions:
 * - ['dashboard'] — dashboard aggregate data
 * - ['resume', 'latest'] — latest resume
 * - ['resume', 'history'] — resume history list
 * - ['career', 'recommendations'] — career recommendations
 * - ['career', 'skill-gap'] — skill gap analysis
 * - ['chat', 'history', sessionId] — chat session history
 * - ['learning', 'report'] — diagnostic report
 * - ['learning', 'path'] — learning roadmap
 * - ['jobs', { query, page }] — job search results
 */
export const queryKeys = {
  dashboard: ['dashboard'],
  resumeLatest: ['resume', 'latest'],
  resumeHistory: ['resume', 'history'],
  recommendations: ['career', 'recommendations'],
  skillGap: ['career', 'skill-gap'],
  chatHistory: (sessionId) => ['chat', 'history', sessionId],
  learningReport: ['learning', 'report'],
  learningPath: ['learning', 'path'],
  jobs: (params) => ['jobs', params],
};

/**
 * Query invalidation map — defines which queries to invalidate on mutations.
 *
 * Usage: queryClient.invalidateQueries({ queryKey: invalidationMap.resumeUpload })
 */
export const invalidationMap = {
  resumeUpload: [
    ['resume', 'latest'],
    ['resume', 'history'],
    ['dashboard'],
  ],
  profileUpdate: [
    ['dashboard'],
  ],
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,     // 5 minutes
      gcTime: 30 * 60 * 1000,        // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

export default queryClient;
