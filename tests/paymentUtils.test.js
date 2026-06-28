const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const { formatAmount, IDPAY_BALANCES, parseRawAmount } = require('../.tmp-test/src/native/screens/chat/paymentUtils');

describe('paymentUtils', () => {
  it('parses formatted currency input into digits only', () => {
    assert.equal(parseRawAmount('1.500.000 VNĐ'), 1500000);
    assert.equal(parseRawAmount('Plan A: 850'), 850);
    assert.equal(parseRawAmount(''), 0);
  });

  it('formats positive amounts for Vietnamese locale and hides zero values', () => {
    assert.equal(formatAmount(1500000), '1.500.000');
    assert.equal(formatAmount(IDPAY_BALANCES.VND), '2.500.000');
    assert.equal(formatAmount(0), '');
  });
});
