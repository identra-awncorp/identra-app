const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const {
  isPaymentActionComingSoon,
  isPaymentExploreActionComingSoon,
} = require('../.tmp-test/src/native/domain/payment/paymentAvailability');
const {
  createBillPreview,
  lookupBillPreview,
  validateBillPaymentDraft,
  validatePhoneTopUpDraft,
} = require('../.tmp-test/src/native/domain/payment/paymentServices');
const {
  createTransferReceipt,
  validateTransferAmount,
} = require('../.tmp-test/src/native/domain/payment/paymentTransfer');

const recipient = {
  id: 'minh-anh',
  name: 'Nguyen Minh Anh',
  account: 'idpay:minhanh',
  bank: 'IDPay',
  initials: 'MA',
  color: '#335CFF',
  background: '#EEF2FF',
  recent: 'Yesterday',
  verified: true,
  icon: () => null,
};

const billCategory = {
  id: 'electric',
  label: 'Electricity',
  icon: () => null,
  color: '#F59E0B',
  background: '#FFF7ED',
  providers: ['EVN Hanoi', 'EVN HCMC'],
  customerCodePlaceholder: 'PE0102884739',
  savedCode: 'PE0102884739',
  sampleBill: {
    customerName: 'NGUYEN HOANG NAM',
    address: 'Cau Giay',
    period: '07/2026',
    dueDate: '15/07/2026',
    amount: 684000,
    fee: 0,
  },
};

describe('payment domain', () => {
  it('validates transfer amounts against balance', () => {
    assert.deepEqual(validateTransferAmount({ amount: 0, availableBalance: 100000 }), { ok: false, reason: 'missing_amount' });
    assert.deepEqual(validateTransferAmount({ amount: 120000, availableBalance: 100000 }), { ok: false, reason: 'insufficient_balance' });
    assert.deepEqual(validateTransferAmount({ amount: 80000, availableBalance: 100000 }), { ok: true });
  });

  it('creates transfer receipts from plain data', () => {
    const receipt = createTransferReceipt({
      amount: 120000,
      createdAt: new Date('2026-07-02T09:30:00+07:00'),
      note: 'Lunch',
      recipient,
      sourceAccount: 'IDPAY 102 884 739',
      sourceName: 'Main account',
    });

    assert.equal(receipt.amount, 120000);
    assert.equal(receipt.note, 'Lunch');
    assert.equal(receipt.recipient.id, 'minh-anh');
    assert.equal(receipt.sourceAccount, 'IDPAY 102 884 739');
    assert.equal(receipt.status, 'success');
  });

  it('validates top-up and bill lookup drafts', () => {
    assert.deepEqual(validatePhoneTopUpDraft({ phoneNumber: '12345' }), { ok: false, reason: 'missing_phone' });
    assert.deepEqual(validatePhoneTopUpDraft({ phoneNumber: '038 294 8210' }), { ok: true });
    assert.deepEqual(validateBillPaymentDraft({ bill: null }), { ok: false, reason: 'missing_bill' });

    const bill = createBillPreview(billCategory, 1, billCategory.savedCode);
    assert.equal(bill.provider, 'EVN HCMC');
    assert.deepEqual(validateBillPaymentDraft({ bill }), { ok: true });
    assert.deepEqual(lookupBillPreview({ category: billCategory, customerCode: '123', providerIndex: 0 }), { ok: false, reason: 'missing_customer_code' });
    assert.equal(lookupBillPreview({ category: billCategory, customerCode: billCategory.savedCode, providerIndex: 0 }).ok, true);
  });

  it('marks unfinished payment entry points as coming soon', () => {
    assert.equal(isPaymentActionComingSoon('transfer'), false);
    assert.equal(isPaymentActionComingSoon('withdraw'), true);
    assert.equal(isPaymentExploreActionComingSoon('bill'), false);
    assert.equal(isPaymentExploreActionComingSoon('saving'), true);
  });
});
