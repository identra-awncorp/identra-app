const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { describe, it } = require('node:test');

const { translate } = require('../.tmp-test/src/native/i18n');
const viModule = require('../.tmp-test/src/native/i18n/locales/vi');
const enModule = require('../.tmp-test/src/native/i18n/locales/en');
const vi = viModule.default ?? viModule.vi;
const en = enModule.default ?? enModule.en;

const workspaceRoot = path.resolve(__dirname, '..');

function flattenKeys(value, prefix = '') {
  return Object.entries(value).flatMap(([key, child]) => {
    const nextKey = prefix ? `${prefix}.${key}` : key;
    return child && typeof child === 'object' && !Array.isArray(child)
      ? flattenKeys(child, nextKey)
      : [nextKey];
  });
}

function listSourceFiles(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    const relativePath = path.relative(workspaceRoot, fullPath).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      if (['node_modules', '.git', '.expo', '.tmp-test', 'assets'].includes(entry.name)) return [];
      if (relativePath.includes('/data/demo') || relativePath.includes('/i18n/locales')) return [];
      return listSourceFiles(fullPath);
    }

    return /\.(ts|tsx)$/.test(entry.name) ? [fullPath] : [];
  });
}

describe('i18n translate', () => {
  it('reads nested translations by dot key', () => {
    assert.equal(translate('vi', 'common.appName'), 'Identra');
    assert.equal(translate('en', 'common.search'), 'Search');
  });

  it('interpolates provided params and keeps missing placeholders visible', () => {
    assert.equal(translate('vi', 'newsFeedSearch.filter.addInterest', { interest: 'AI' }), 'Thêm "AI"');
    assert.equal(translate('vi', 'newsFeedSearch.filter.addInterest'), 'Thêm "{{interest}}"');
    assert.equal(translate('en', 'newsFeedSearch.filter.addInterest', { interest: 'AI' }), 'Add "AI"');
  });

  it('falls back to the key when a translation is missing', () => {
    assert.equal(translate('vi', 'missing.translation.key'), 'missing.translation.key');
  });

  it('keeps Vietnamese and English locale keys in sync', () => {
    const viKeys = flattenKeys(vi).sort();
    const enKeys = flattenKeys(en).sort();

    assert.deepEqual(enKeys, viKeys);
  });

  it('has locale entries for every statically referenced translation key', () => {
    const localeKeys = new Set(flattenKeys(vi));
    const files = [
      ...listSourceFiles(path.join(workspaceRoot, 'app')),
      ...listSourceFiles(path.join(workspaceRoot, 'src', 'native')),
    ];
    const missing = [];

    for (const file of files) {
      const relativePath = path.relative(workspaceRoot, file).replace(/\\/g, '/');
      const source = fs.readFileSync(file, 'utf8');
      const patterns = [
        /\bt\(\s*['"`]([^'"`]+)['"`]/g,
        /\btranslate\(\s*[^,]+,\s*['"`]([^'"`]+)['"`]/g,
      ];

      for (const pattern of patterns) {
        for (const match of source.matchAll(pattern)) {
          const key = match[1];
          if (key.includes('${')) continue;
          if (!localeKeys.has(key)) missing.push(`${relativePath}: ${key}`);
        }
      }
    }

    assert.deepEqual(missing, []);
  });

  it('defines credential status labels used by dynamic status keys', () => {
    assert.equal(translate('vi', 'common.status.verified'), 'Đã xác minh');
    assert.equal(translate('vi', 'common.status.pending'), 'Đang chờ xác nhận');
    assert.equal(translate('vi', 'common.status.expired'), 'Đã hết hạn');
    assert.equal(translate('en', 'common.status.verified'), 'Verified');
    assert.equal(translate('en', 'common.status.pending'), 'Pending confirmation');
    assert.equal(translate('en', 'common.status.expired'), 'Expired');
  });
});
