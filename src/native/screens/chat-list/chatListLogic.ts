import type { ChatMediaPreview, ChatPreview, DeliveryStatus } from '../../data/demo/chatDemoData';

type ConversationDeliveryFields = Pick<ChatPreview, 'deliveryStatus' | 'lastMessageFromMe'>;
type ConversationPreviewFields = Pick<ChatPreview, 'media' | 'message'>;
type ConversationGroupSenderFields = Pick<ChatPreview, 'groupSender' | 'lastMessageFromMe'>;

export function getVisibleDeliveryStatus(conversation: ConversationDeliveryFields): DeliveryStatus | undefined {
  return conversation.lastMessageFromMe ? conversation.deliveryStatus : undefined;
}

export function getMediaLabel(media?: ChatMediaPreview): string {
  if (!media) return '';
  if (media.type === 'photo') return 'Photo';
  if (media.type === 'gif') return 'GIF';
  return media.fileName ?? 'File';
}

export function getConversationPreviewText(conversation: ConversationPreviewFields): string {
  return conversation.message || getMediaLabel(conversation.media);
}

export function getMediaThumbPresentation(media: ChatMediaPreview) {
  const totalCount = Math.max(media.count ?? 1, 1);
  const visibleCount = Math.min(totalCount, 4);

  return {
    visibleCount,
    overflowCount: Math.max(totalCount - visibleCount, 0),
  };
}

export function shouldShowGroupSender(conversation: ConversationGroupSenderFields): boolean {
  return Boolean(conversation.groupSender && !conversation.lastMessageFromMe);
}
