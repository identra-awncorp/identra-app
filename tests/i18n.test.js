const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const { translate } = require('../.tmp-test/src/native/i18n');

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
});
