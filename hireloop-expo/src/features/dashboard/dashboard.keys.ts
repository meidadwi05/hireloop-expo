export const dashboardKeys = {
  all: ['dashboard'] as const,
  home: () => [...dashboardKeys.all, 'home'] as const,
  performance: () => [...dashboardKeys.all, 'performance'] as const,
  recruitment: () => [...dashboardKeys.all, 'recruitment'] as const,
};
