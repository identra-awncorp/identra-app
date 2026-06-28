const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const {
  getConversationPreviewText,
  getMediaLabel,
  getMediaThumbPresentation,
  getVisibleDeliveryStatus,
  shouldShowGroupSender,
} = require('../.tmp-test/src/native/screens/chat-list/chatListLogic');

describe('chatListLogic', () => {
  it('shows delivery status only for outgoing latest messages', () => {
    assert.equal(getVisibleDeliveryStatus({ lastMessageFromMe: true, deliveryStatus: 'seen' }), 'seen');
    assert.equal(getVisibleDeliveryStatus({ lastMessageFromMe: false, deliveryStatus: 'seen' }), undefined);
    assert.equal(getVisibleDeliveryStatus({ deliveryStatus: 'pending' }), undefined);
  });

  it('builds media labels and preview text from message semantics', () => {
    assert.equal(getMediaLabel({ type: 'photo' }), 'Photo');
    assert.equal(getMediaLabel({ type: 'gif' }), 'GIF');
    assert.equal(getMediaLabel({ type: 'file', fileName: 'hop-dong.pdf' }), 'hop-dong.pdf');
    assert.equal(getMediaLabel({ type: 'file' }), 'File');
    assert.equal(getConversationPreviewText({ message: '', media: { type: 'gif' } }), 'GIF');
    assert.equal(getConversationPreviewText({ message: 'Có caption', media: { type: 'photo' } }), 'Có caption');
  });

  it('limits media thumbnails to four and reports overflow', () => {
    assert.deepEqual(getMediaThumbPresentation({ type: 'photo', count: 1 }), {
      visibleCount: 1,
      overflowCount: 0,
    });
    assert.deepEqual(getMediaThumbPresentation({ type: 'photo', count: 6 }), {
      visibleCount: 4,
      overflowCount: 2,
    });
  });

  it('shows group sender only when latest group message is not from current user', () => {
    assert.equal(shouldShowGroupSender({ groupSender: 'Nam', lastMessageFromMe: false }), true);
    assert.equal(shouldShowGroupSender({ groupSender: 'Nam', lastMessageFromMe: true }), false);
    assert.equal(shouldShowGroupSender({ lastMessageFromMe: false }), false);
  });
});
