import type { ActivityLog } from '../../../types';

export type ActivityStatusFilter = 'all' | NonNullable<ActivityLog['status']>;
export type ActivityTypeFilter = 'all' | 'verify' | 'share';
export type ActivityPeriodFilter = 'all' | 'today' | 'yesterday';
export type ActivityPeriod = 'today' | 'yesterday' | 'older';

export interface ActivityFilters {
  status: ActivityStatusFilter;
  type: ActivityTypeFilter;
  period: ActivityPeriodFilter;
}

export interface ActivitySummary {
  total: number;
  success: number;
  pending: number;
  failed: number;
}

export const defaultActivityFilters: ActivityFilters = { status: 'all', type: 'all', period: 'all' };

export function getActivityStatus(log: ActivityLog): NonNullable<ActivityLog['status']> {
  if (log.status) return log.status;

  const content = `${log.title} ${log.description}`.toLocaleLowerCase('vi');
  if (content.includes('thất bại') || content.includes('từ chối')) return 'failed';
  if (content.includes('chờ')) return 'pending';
  return 'success';
}

export function getActivityPeriod(log: ActivityLog, now: Date = new Date()): ActivityPeriod {
  if (log.isDemo) return ['activity-1', 'activity-2', 'activity-3'].includes(log.id) ? 'today' : 'yesterday';

  const date = new Date(log.timestamp);
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(dayStart);
  yesterdayStart.setDate(dayStart.getDate() - 1);

  if (date >= dayStart) return 'today';
  if (date >= yesterdayStart) return 'yesterday';
  return 'older';
}

export function filterActivityLogs(
  logs: ActivityLog[],
  filters: ActivityFilters,
  now: Date = new Date(),
): ActivityLog[] {
  return logs.filter((log) => {
    const status = getActivityStatus(log);
    return (filters.status === 'all' || filters.status === status) &&
      (filters.type === 'all' || filters.type === log.type) &&
      (filters.period === 'all' || filters.period === getActivityPeriod(log, now));
  });
}

export function getActivitySummary(logs: ActivityLog[]): ActivitySummary {
  if (logs.some((log) => log.isDemo)) {
    return { total: 24, success: 22, pending: 2, failed: 0 };
  }

  return {
    total: logs.length,
    success: logs.filter((log) => getActivityStatus(log) === 'success').length,
    pending: logs.filter((log) => getActivityStatus(log) === 'pending').length,
    failed: logs.filter((log) => getActivityStatus(log) === 'failed').length,
  };
}

export function getActiveActivityFilterCount(filters: ActivityFilters): number {
  return Object.values(filters).filter((value) => value !== 'all').length;
}

export function formatActivityPercentage(value: number, total: number): string {
  if (!total) return '0%';
  return `${Number(((value / total) * 100).toFixed(1))}%`;
}
