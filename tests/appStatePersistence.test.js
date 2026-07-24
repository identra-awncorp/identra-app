const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const {
  APP_STATE_STORAGE_VERSION,
  createPersistedIdentityEnvelope,
  createPersistedSettingsEnvelope,
  migrateLegacyAppState,
  parsePersistedIdentityEnvelope,
  parsePersistedSettingsEnvelope,
} = require('../.tmp-test/src/native/domain/app-store/appStatePersistence');

const settings = {
  language: 'vi',
  theme: 'system',
  notificationsEnabled: true,
  hideSensitiveData: true,
  flowSettings: {},
};

const profile = {
  fullName: 'Nguyễn Văn An',
  dob: '',
  studentId: '',
  school: '',
  nationalId: '',
  email: '',
  phone: '',
  address: '',
  did: 'did:identra:holder',
};

const credential = {
  id: 'credential-1',
  title: 'Credential',
  issuer: 'Issuer',
  issueDate: '2026-07-23',
  status: 'verified',
  icon: 'identity',
  didIssuer: 'did:identra:issuer',
  didHolder: 'did:identra:holder',
  signature: 'signature',
  attributes: [{ key: 'subject.fullName', label: 'Full Name', value: 'Nguyễn Văn An' }],
};

const state = {
  credentials: [credential],
  logs: [],
  profile,
  settings,
};

describe('appStatePersistence', () => {
  it('round-trips versioned settings and identity envelopes', () => {
    const settingsEnvelope = createPersistedSettingsEnvelope(state.settings);
    const identityEnvelope = createPersistedIdentityEnvelope(state);

    assert.equal(settingsEnvelope.version, APP_STATE_STORAGE_VERSION);
    assert.deepEqual(parsePersistedSettingsEnvelope(settingsEnvelope).language, 'vi');
    assert.deepEqual(parsePersistedIdentityEnvelope(identityEnvelope), {
      credentials: state.credentials,
      logs: state.logs,
      profile: state.profile,
    });
  });

  it('keeps short-lived QR expiration as a mandatory security invariant', () => {
    const settingsEnvelope = createPersistedSettingsEnvelope({
      ...state.settings,
      flowSettings: {
        identity: {
          expiringShareQr: false,
        },
      },
    });

    assert.equal(settingsEnvelope.settings.flowSettings.identity.expiringShareQr, true);
  });

  it('rejects unsupported versions and malformed identity data', () => {
    assert.equal(parsePersistedSettingsEnvelope({ version: 99, settings }), null);
    assert.equal(
      parsePersistedIdentityEnvelope({
        version: APP_STATE_STORAGE_VERSION,
        credentials: [{ id: 'missing-required-fields' }],
        logs: [],
        profile,
      }),
      null,
    );
  });

  it('migrates legacy attributes to semantic keys independently of display language', () => {
    const legacy = {
      ...state,
      credentials: [
        {
          ...credential,
          attributes: [
            { label: 'Họ và tên', value: 'Nguyễn Văn An' },
            { label: 'Overall Band Score', value: '8.0' },
          ],
        },
      ],
    };

    const migrated = migrateLegacyAppState(legacy, state);

    assert.equal(migrated.credentials[0].attributes[0].key, 'subject.fullName');
    assert.equal(migrated.credentials[0].attributes[1].key, 'legacy.overall.band.score');
  });

  it('falls back per section when legacy data is partially corrupt', () => {
    const migrated = migrateLegacyAppState(
      {
        credentials: 'invalid',
        logs: [],
        profile,
        settings: { language: 'en', theme: 'dark' },
      },
      state,
    );

    assert.deepEqual(migrated.credentials, state.credentials);
    assert.equal(migrated.settings.language, 'en');
    assert.equal(migrated.settings.theme, 'dark');
  });
});
