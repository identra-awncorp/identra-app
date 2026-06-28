const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const {
  addUniqueInterest,
  canAddCustomInterest,
  getFilteredInterestSuggestions,
  shouldShowNewsFeedSearchFilter,
} = require('../.tmp-test/src/native/screens/news-feed/search/newsFeedSearchLogic');

describe('newsFeedSearchLogic', () => {
  const suggestions = ['Công nghệ', 'Blockchain', 'AI', 'Âm nhạc', 'Web3'];

  it('shows filter only for concrete search tabs', () => {
    assert.equal(shouldShowNewsFeedSearchFilter('all'), false);
    assert.equal(shouldShowNewsFeedSearchFilter('trends'), true);
    assert.equal(shouldShowNewsFeedSearchFilter('accounts'), true);
  });

  it('filters interests case-insensitively, excludes selected values, and applies the limit', () => {
    assert.deepEqual(
      getFilteredInterestSuggestions({
        query: '  c  ',
        selectedInterests: ['blockchain'],
        suggestions,
        limit: 2,
      }),
      ['Công nghệ', 'Âm nhạc'],
    );
  });

  it('allows only non-duplicate custom interests outside predefined suggestions', () => {
    assert.equal(canAddCustomInterest({ interest: 'SSI', selectedInterests: [], suggestions }), true);
    assert.equal(canAddCustomInterest({ interest: 'a', selectedInterests: [], suggestions }), false);
    assert.equal(canAddCustomInterest({ interest: 'AI', selectedInterests: [], suggestions }), false);
    assert.equal(canAddCustomInterest({ interest: 'ssi', selectedInterests: ['SSI'], suggestions }), false);
  });

  it('adds custom interests once and preserves existing array for duplicates', () => {
    const current = ['AI'];
    assert.deepEqual(addUniqueInterest(current, '  SSI  '), ['AI', 'SSI']);
    assert.strictEqual(addUniqueInterest(current, ' ai '), current);
    assert.strictEqual(addUniqueInterest(current, '   '), current);
  });
});
