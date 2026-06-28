const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const {
  defaultActivityFilters,
  filterActivityLogs,
  formatActivityPercentage,
  getActiveActivityFilterCount,
  getActivityPeriod,
  getActivityStatus,
  getActivitySummary,
} = require('../.tmp-test/src/native/screens/settings/activity/activityLogLogic');

function makeLog(overrides = {}) {
  return {
    id: 'activity-test',
    timestamp: '2026-06-28T09:00:00+07:00',
    type: 'verify',
    title: 'Test activity',
    description: 'Success',
    partner: 'Identra',
    ...overrides,
  };
}

describe('activityLogLogic', () => {
  it('prioritizes explicit statuses before deriving a fallback from text', () => {
    assert.equal(getActivityStatus(makeLog({ status: 'pending', description: 'Success' })), 'pending');
    assert.equal(getActivityStatus(makeLog({ status: 'failed', description: 'Success' })), 'failed');
  });

  it('derives fallback statuses for legacy logs without a status field', () => {
    assert.equal(getActivityStatus(makeLog({ description: 'Xác minh thất bại' })), 'failed');
    assert.equal(getActivityStatus(makeLog({ description: 'Đang chờ xác nhận' })), 'pending');
    assert.equal(getActivityStatus(makeLog({ description: 'Xác minh thành công' })), 'success');
  });

  it('groups demo logs by fixed design buckets and real logs by date', () => {
    const now = new Date('2026-06-28T12:00:00+07:00');

    assert.equal(getActivityPeriod(makeLog({ id: 'activity-1', isDemo: true }), now), 'today');
    assert.equal(getActivityPeriod(makeLog({ id: 'activity-4', isDemo: true }), now), 'yesterday');
    assert.equal(getActivityPeriod(makeLog({ timestamp: '2026-06-28T08:00:00+07:00' }), now), 'today');
    assert.equal(getActivityPeriod(makeLog({ timestamp: '2026-06-27T08:00:00+07:00' }), now), 'yesterday');
    assert.equal(getActivityPeriod(makeLog({ timestamp: '2026-06-26T08:00:00+07:00' }), now), 'older');
  });

  it('filters logs by status, type, and period together', () => {
    const now = new Date('2026-06-28T12:00:00+07:00');
    const logs = [
      makeLog({ id: 'success-share-today', type: 'share', status: 'success', timestamp: '2026-06-28T08:00:00+07:00' }),
      makeLog({ id: 'pending-share-today', type: 'share', status: 'pending', timestamp: '2026-06-28T09:00:00+07:00' }),
      makeLog({ id: 'success-verify-yesterday', type: 'verify', status: 'success', timestamp: '2026-06-27T08:00:00+07:00' }),
    ];

    assert.deepEqual(
      filterActivityLogs(logs, { status: 'success', type: 'share', period: 'today' }, now).map((log) => log.id),
      ['success-share-today'],
    );
  });

  it('uses approved demo summary numbers when demo logs are present', () => {
    assert.deepEqual(getActivitySummary([makeLog({ isDemo: true })]), {
      total: 24,
      success: 22,
      pending: 2,
      failed: 0,
    });
  });

  it('counts real summaries and active filters safely', () => {
    const logs = [
      makeLog({ status: 'success' }),
      makeLog({ status: 'pending' }),
      makeLog({ status: 'failed' }),
    ];

    assert.deepEqual(getActivitySummary(logs), {
      total: 3,
      success: 1,
      pending: 1,
      failed: 1,
    });
    assert.equal(getActiveActivityFilterCount(defaultActivityFilters), 0);
    assert.equal(getActiveActivityFilterCount({ status: 'pending', type: 'share', period: 'today' }), 3);
    assert.equal(formatActivityPercentage(1, 3), '33.3%');
    assert.equal(formatActivityPercentage(1, 0), '0%');
  });
});
