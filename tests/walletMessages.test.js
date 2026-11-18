const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { describe, it } = require('node:test');

const { ErrorCodes } = require('@identra/sdk-core');
const { WalletErrorCodes } = require('@identra/sdk-app');
const { checkSentenceKeys, failureCodeOfError, failureSentenceKeys, failureView } = require('../.tmp-test/src/native/domain/wallet/walletMessages');
const { PINNED_ROOT_CERTIFICATES_BASE64 } = require('../.tmp-test/src/native/domain/wallet/pinnedRoots');
const { translate } = require('../.tmp-test/src/native/i18n');
const viModule = require('../.tmp-test/src/native/i18n/locales/vi');
const enModule = require('../.tmp-test/src/native/i18n/locales/en');

const CHECK_IDS = ['query', 'structure', 'algorithm', 'certificate_chain', 'signature', 'validity_time', 'credential_type', 'issuer_trust', 'status', 'holder_binding', 'product_chain', 'chain_format', 'chain_signatures', 'chain_validity', 'chain_constraints', 'leaf_key', 'issuer_uri'];
const APP_CODES = ['DEVICE_UNSUPPORTED'];
const ALL_CODES = [...Object.values(ErrorCodes), ...APP_CODES];
/** Whitepaper rule: none of these may reach a person. */
const TECHNICAL = /sd-jwt|\bjwt\b|nonce|certificate|chứng thư|status ?list|did:|\bvct\b|openid|token|x509|hash|thumbprint|\bcnf\b|disclosure/i;
const TECHNICAL_CASED = /\bDID\b|\bVC\b|[A-Z]{3,}_[A-Z_]+/;

const flatten = (tree, prefix = '') =>
  Object.entries(tree).flatMap(([k, v]) => (v && typeof v === 'object' ? flatten(v, `${prefix}${k}.`) : [[`${prefix}${k}`, v]]));

describe('wallet code → sentence tables', () => {
  it('cover every SDK error code, every wallet code, the app codes and every check, in vi and en', () => {
    assert.deepEqual(Object.keys(failureSentenceKeys).sort(), [...ALL_CODES].sort());
    for (const code of Object.values(WalletErrorCodes)) assert.ok(failureSentenceKeys[code], code);
    assert.deepEqual(Object.keys(checkSentenceKeys).sort(), [...CHECK_IDS].sort());
    for (const key of [...Object.values(failureSentenceKeys), ...Object.values(checkSentenceKeys)]) {
      for (const locale of ['vi', 'en']) {
        const text = translate(locale, key);
        assert.notEqual(text, key, `${locale}: ${key} is missing`);
        assert.ok(text.length > 10, `${locale}: ${key} is not a sentence`);
      }
    }
  });

  it('never shows a technical term or a raw code anywhere in the wallet and backup copy', () => {
    for (const mod of [viModule, enModule]) {
      const locale = mod.default ?? mod.vi ?? mod.en;
      const copy = [...flatten(locale.wallet, 'wallet.'), ...flatten(locale.settings.backup, 'settings.backup.'), ...flatten(locale.identity.detail.statuses, 'statuses.')];
      for (const [key, text] of copy) assert.equal(TECHNICAL.test(text) || TECHNICAL_CASED.test(text), false, `${key}: "${text}"`);
    }
  });

  it('maps each wallet code to the action a person can take', () => {
    const expect = {
      TX_CODE_WRONG: 'retry-pin',
      OFFER_EXPIRED: 'contact-issuer',
      OFFER_INVALID: 'scan-again',
      URL_NOT_ALLOWED: 'scan-again',
      NETWORK_ERROR: 'retry',
      CREDENTIAL_INVALID: 'contact-issuer',
      STORAGE_ERROR: 'retry',
      KEY_INVALIDATED: 'request-again',
      KEY_NOT_FOUND: 'request-again',
      USER_CANCELLED: 'retry',
      DEVICE_LOCKED: 'retry',
      CREDENTIAL_NOT_FOUND: 'close',
    };
    for (const [code, action] of Object.entries(expect)) assert.equal(failureView(code).action, action, code);
    assert.equal(translate('vi', failureView('TX_CODE_WRONG').titleKey), 'Mã PIN chưa đúng');
    // Remaining attempts are unknown: the sentence must not invent a number.
    assert.equal(/\d/.test(translate('vi', failureView('TX_CODE_WRONG').sentenceKey)), false);
    assert.equal(translate('vi', failureView('KEY_INVALIDATED').sentenceKey), 'Khóa bảo vệ giấy tờ này không còn dùng được sau khi bạn đổi vân tay/khuôn mặt. Hãy xin cấp lại.');
  });

  it('names the first failed check of an invalid credential in plain words', () => {
    const checks = [
      { id: 'structure', ok: true, code: null },
      { id: 'certificate_chain', ok: false, code: null, skipped: true },
      { id: 'issuer_trust', ok: false, code: 'ISSUER_NOT_TRUSTED' },
      { id: 'status', ok: false, code: 'STATUS_UNAVAILABLE' },
    ];
    const view = failureView('CREDENTIAL_INVALID', checks);
    assert.equal(translate('vi', view.sentenceKey), 'Giấy tờ nhận được không qua được kiểm tra nên chưa được lưu.');
    assert.equal(view.detailKey, 'wallet.errors.ISSUER_NOT_TRUSTED');
    assert.equal(failureView('CREDENTIAL_INVALID', [{ id: 'signature', ok: false, code: null }]).detailKey, 'wallet.checks.signature');
    assert.equal(failureView('CREDENTIAL_INVALID').detailKey, null);
    assert.equal(failureView('OFFER_EXPIRED', checks).detailKey, null);
  });

  it('turns unknown codes and thrown errors into safe codes', () => {
    assert.equal(failureView('SOMETHING_NEW').code, 'STORAGE_ERROR');
    assert.equal(failureView(undefined).code, 'STORAGE_ERROR');
    // SecretStorageError / WalletKeyError codes, mapped as the SDK maps them.
    assert.equal(failureCodeOfError(Object.assign(new Error('x'), { code: 'LOCKED' })), 'DEVICE_LOCKED');
    assert.equal(failureCodeOfError(Object.assign(new Error('x'), { code: 'CANCELLED' })), 'USER_CANCELLED');
    assert.equal(failureCodeOfError(Object.assign(new Error('x'), { code: 'KEY_INVALIDATED' })), 'KEY_INVALIDATED');
    assert.equal(failureCodeOfError(Object.assign(new Error('x'), { code: 'QUERY_FAILED' })), 'STORAGE_ERROR');
    assert.equal(failureCodeOfError(null), 'STORAGE_ERROR');
  });
});

describe('pinned Identra root', () => {
  it('is the certificate the website publishes (same SHA-256), as an array ready for a rollover', () => {
    assert.ok(Array.isArray(PINNED_ROOT_CERTIFICATES_BASE64) && PINNED_ROOT_CERTIFICATES_BASE64.length >= 1);
    const pem = fs.readFileSync(path.resolve(__dirname, '../../identra-website/src/identra/trust/root-ca.pem'), 'utf8');
    const websiteDer = Buffer.from(/-----BEGIN CERTIFICATE-----([\s\S]+?)-----END/.exec(pem)[1].replace(/\s+/g, ''), 'base64');
    const sha = (der) => createHash('sha256').update(der).digest('hex');
    assert.equal(sha(Buffer.from(PINNED_ROOT_CERTIFICATES_BASE64[0], 'base64')), sha(websiteDer));
    assert.equal(sha(websiteDer), 'ad70fa54b54db1824ecec3118bf1dd0eeb10d653244571a80645aec0454b99b5');
  });
});
