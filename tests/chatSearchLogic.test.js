const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const {
  filterChatSearchMiniApps,
  filterChatSearchPeople,
  normalizeSearchQuery,
} = require('../.tmp-test/src/native/screens/chat-list/chatSearchLogic');

describe('chatSearchLogic', () => {
  const people = [
    { id: 'a', name: 'Minh Anh', handle: '@minhanh.eth' },
    { id: 'b', name: 'Hoàng Nam', handle: '0987 654 321' },
  ];
  const miniApps = [
    { id: 'bee', name: 'Bee', category: 'Đặt xe', description: 'Gọi xe và giao hàng' },
    { id: 'idpay', name: 'IDPay', category: 'Tài chính', description: 'Ví điện tử và thanh toán' },
  ];

  it('normalizes surrounding spaces and casing', () => {
    assert.equal(normalizeSearchQuery('  IDPAY  '), 'idpay');
  });

  it('filters people by name or handle', () => {
    assert.deepEqual(filterChatSearchPeople(people, 'minhanh').map((item) => item.id), ['a']);
    assert.deepEqual(filterChatSearchPeople(people, '0987').map((item) => item.id), ['b']);
    assert.strictEqual(filterChatSearchPeople(people, '   '), people);
  });

  it('filters mini apps by name, category, or description', () => {
    assert.deepEqual(filterChatSearchMiniApps(miniApps, 'giao hàng').map((item) => item.id), ['bee']);
    assert.deepEqual(filterChatSearchMiniApps(miniApps, 'thanh toán').map((item) => item.id), ['idpay']);
  });
});
