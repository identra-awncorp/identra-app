const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const {
  addActivityLogToAppState,
  createActivityLog,
  expirePendingActivityLogsInAppState,
  removeDemoDataFromAppState,
  updateProfileInAppState,
  upsertCredentialInAppState,
} = require('../.tmp-test/src/native/domain/app-store/appStoreStateService');

function makeState(overrides = {}) {
  return {
    credentials: [],
    logs: [],
    profile: {
      fullName: 'Nguyễn Văn A',
      dob: '',
      studentId: '',
      school: '',
      nationalId: '',
      email: '',
      phone: '',
      address: '',
      did: '',
    },
    settings: {
      language: 'vi',
      theme: 'system',
      notificationsEnabled: true,
      hideSensitiveData: true,
    },
    ...overrides,
  };
}

describe('appStoreStateService', () => {
  it('upserts credentials by prepending the latest version and removing duplicates', () => {
    const state = makeState({
      credentials: [
        { id: 'cred-a', title: 'Old A', attributes: [] },
        { id: 'cred-b', title: 'B', attributes: [] },
      ],
    });

    const next = upsertCredentialInAppState(state, { id: 'cred-a', title: 'New A', attributes: [] });

    assert.deepEqual(next.credentials.map((credential) => credential.id), ['cred-a', 'cred-b']);
    assert.equal(next.credentials[0].title, 'New A');
  });

  it('creates and prepends unread activity logs', () => {
    const createdAt = new Date('2026-06-28T00:00:00.000Z');
    const log = createActivityLog(
      {
        title: 'Test title',
        description: 'Test description',
        partner: 'Test partner',
        type: 'scan',
      },
      createdAt,
    );

    const next = addActivityLogToAppState(makeState({ logs: [{ id: 'old', title: 'Old' }] }), log);

    assert.equal(log.id, `activity-${createdAt.getTime()}`);
    assert.equal(log.timestamp, createdAt.toISOString());
    assert.equal(log.type, 'scan');
    assert.equal(next.logs[0].id, log.id);
    assert.equal(next.logs[0].unread, true);
    assert.equal(next.logs[0].isNew, true);
  });

  it('expires only pending activity logs whose deadline has passed', () => {
    const nowMs = Date.parse('2026-06-28T12:00:00.000Z');
    const state = makeState({
      logs: [
        {
          id: 'expired-pending',
          title: 'Expired',
          description: 'Pending',
          partner: 'A',
          type: 'scan',
          status: 'pending',
          expiresAt: '2026-06-28T11:59:59.000Z',
        },
        {
          id: 'future-pending',
          title: 'Future',
          description: 'Pending',
          partner: 'B',
          type: 'scan',
          status: 'pending',
          expiresAt: '2026-06-28T12:00:01.000Z',
        },
        {
          id: 'expired-success',
          title: 'Success',
          description: 'Success',
          partner: 'C',
          type: 'scan',
          status: 'success',
          expiresAt: '2026-06-28T11:59:59.000Z',
        },
      ],
    });

    const next = expirePendingActivityLogsInAppState(state, nowMs, 'Failed');

    assert.equal(next.logs[0].status, 'failed');
    assert.equal(next.logs[0].description, 'Failed');
    assert.equal(next.logs[0].unread, true);
    assert.equal(next.logs[0].isNew, true);
    assert.equal(next.logs[1].status, 'pending');
    assert.equal(next.logs[2].status, 'success');
  });

  it('syncs the profile full name into matching credential attributes only', () => {
    const state = makeState({
      credentials: [
        {
          id: 'cred-degree',
          attributes: [
            { label: 'Họ và tên', value: 'Tên cũ' },
            { label: 'Ngành học', value: 'Công nghệ thông tin' },
          ],
        },
      ],
    });

    const next = updateProfileInAppState(state, { ...state.profile, fullName: 'Tên mới' });

    assert.equal(next.profile.fullName, 'Tên mới');
    assert.equal(next.credentials[0].attributes[0].value, 'Tên mới');
    assert.equal(next.credentials[0].attributes[1].value, 'Công nghệ thông tin');
  });

  it('removes demo credentials and activity logs without touching real data', () => {
    const state = makeState({
      credentials: [
        { id: 'demo-credential', attributes: [], isDemo: true },
        { id: 'real-credential', attributes: [] },
      ],
      logs: [
        { id: 'demo-log', type: 'add', title: 'Demo', description: '', partner: '', isDemo: true },
        { id: 'real-log', type: 'add', title: 'Real', description: '', partner: '' },
      ],
    });

    const next = removeDemoDataFromAppState(state);

    assert.deepEqual(next.credentials.map((credential) => credential.id), ['real-credential']);
    assert.deepEqual(next.logs.map((log) => log.id), ['real-log']);
  });
});
