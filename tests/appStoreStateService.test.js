const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const {
  addActivityLogToAppState,
  createActivityLog,
  expirePendingActivityLogsInAppState,
  removeCredentialActivityFromAppState,
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
      flowSettings: {
        identity: {
          activityLogging: true,
        },
      },
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

    assert.match(log.id, /^activity-/);
    assert.equal(log.timestamp, createdAt.toISOString());
    assert.equal(log.type, 'scan');
    assert.equal(next.logs[0].id, log.id);
    assert.equal(next.logs[0].unread, true);
    assert.equal(next.logs[0].isNew, true);
  });

  it('creates unique activity IDs even for the same timestamp', () => {
    const createdAt = new Date('2026-06-28T00:00:00.000Z');
    const input = { title: 'Scan', description: '', partner: 'QR', type: 'scan' };

    assert.notEqual(createActivityLog(input, createdAt).id, createActivityLog(input, createdAt).id);
  });

  it('does not retain new activity when identity activity logging is disabled', () => {
    const state = makeState();
    state.settings.flowSettings.identity.activityLogging = false;
    const log = createActivityLog({
      title: 'Private action',
      description: 'Must not persist',
      partner: 'Verifier',
      type: 'share',
    });

    const next = addActivityLogToAppState(state, log);

    assert.equal(next, state);
    assert.deepEqual(next.logs, []);
  });

  it('with logging off keeps only the lock of a delivered share (one per request, gone on success); with logging on the entry replaces it', () => {
    const off = makeState();
    off.settings.flowSettings.identity.activityLogging = false;
    const delivered = { id: 'share-1', timestamp: '2026-06-28T12:00:00.000Z', type: 'share', status: 'pending', title: 'Đã gửi Bằng tốt nghiệp, chưa có kết quả', description: 'Họ và tên, Ngành', partner: 'Nhà Tuyển Dụng Mẫu', credentialId: 'b', sharedClaims: ['ho_ten', 'nganh'], unread: false, requestRef: 'qr-1', sends: 1, lockedUntil: '2026-06-28T12:10:00.000Z' };
    const lock = { id: 'share-1', requestRef: 'qr-1', credentialId: 'b', sharedClaims: ['ho_ten', 'nganh'], sends: 1, lockedUntil: '2026-06-28T12:10:00.000Z' };

    const first = addActivityLogToAppState(off, delivered);
    assert.deepEqual([first.logs, first.shareLocks], [[], [lock]], 'no history entry, no unread count: only the lock');
    const again = addActivityLogToAppState(first, { ...delivered, sends: 2 });
    assert.deepEqual(again.shareLocks, [{ ...lock, sends: 2 }], 'the same request: one lock, with the new count');
    const other = addActivityLogToAppState(again, { ...delivered, id: 'share-2', requestRef: 'qr-2' });
    assert.deepEqual(other.shareLocks.map((l) => l.requestRef), ['qr-2', 'qr-1']);
    assert.equal(addActivityLogToAppState(other, createActivityLog({ title: 'x', description: 'y', partner: 'z' })), other, 'any other log changes nothing');
    assert.deepEqual(addActivityLogToAppState(other, { ...delivered, status: 'success' }).shareLocks.map((l) => l.requestRef), ['qr-2'], 'a success ends the lock');

    const on = { ...other, settings: makeState().settings };
    const logged = addActivityLogToAppState(on, { ...delivered, sends: 3 });
    assert.deepEqual([logged.logs.map((l) => [l.id, l.sends]), logged.shareLocks.map((l) => l.requestRef)], [[['share-1', 3]], ['qr-2']], 'the history entry carries that request from now on');
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
            { key: 'subject.fullName', label: 'Full Name', value: 'Tên cũ' },
            { key: 'degree.major', label: 'Ngành học', value: 'Công nghệ thông tin' },
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

describe('wallet documents and the app store', () => {
  it('drops the sharing records of a removed document, and only those', () => {
    const state = makeState({
      logs: [
        { id: 'a', type: 'share', title: '', description: 'Họ và tên', partner: 'X', credentialId: 'c1', sharedClaims: ['ho_ten'] },
        { id: 'b', type: 'share', title: '', description: 'Ngành', partner: 'Y', credentialId: 'c2', sharedClaims: ['nganh'] },
        { id: 'c', type: 'scan', title: '', description: '', partner: '' },
      ],
    });
    assert.deepEqual(removeCredentialActivityFromAppState(state, 'c1').logs.map((l) => l.id), ['b', 'c']);
  });

  it('starts without demo credentials or a demo identifier (the wallet reads the SDK vault)', () => {
    const { INITIAL_CREDENTIALS, INITIAL_PROFILE } = require('../.tmp-test/src/native/data/demo/identityDemoData');
    assert.deepEqual(INITIAL_CREDENTIALS, []);
    assert.equal(INITIAL_PROFILE.did, '');
  });
});
