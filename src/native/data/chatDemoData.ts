import type { ImageSourcePropType } from 'react-native';

export const demoAvatars = {
  catMask: require('../../assets/images/chat-list-demo-icon/macos-tahoe.jpg'),
  catFlower: require('../../assets/images/chat-list-demo-icon/photo_2026-06-21_11-00-02.jpg'),
  avatarA: require('../../assets/images/chat-list-demo-icon/photo_2026-06-21_11-00-02 (2).jpg'),
  avatarB: require('../../assets/images/chat-list-demo-icon/photo_2026-06-21_11-00-02 (3).jpg'),
  avatarC: require('../../assets/images/chat-list-demo-icon/photo_2026-06-21_11-00-02 (4).jpg'),
  avatarD: require('../../assets/images/chat-list-demo-icon/photo_2026-06-21_11-00-02 (5).jpg'),
  avatarE: require('../../assets/images/chat-list-demo-icon/photo_2026-06-21_11-00-03.jpg'),
  avatarF: require('../../assets/images/chat-list-demo-icon/photo_2026-06-21_11-00-03 (2).jpg'),
  avatarG: require('../../assets/images/chat-list-demo-icon/photo_2026-06-21_11-00-03 (3).jpg'),
  avatarH: require('../../assets/images/chat-list-demo-icon/photo_2026-06-21_11-00-03 (4).jpg'),
};

export const mediaPreviewImage = demoAvatars.avatarF;

export type DeliveryStatus = 'sent' | 'seen' | 'pending';
export type ChatMediaType = 'photo' | 'gif' | 'file';
export type ChatDirection = 'incoming' | 'outgoing';

export interface ChatMediaPreview {
  type: ChatMediaType;
  count?: number;
  fileName?: string;
}

export interface ChatPreview {
  id: string;
  name: string;
  message: string;
  time: string;
  unread?: number;
  online?: boolean;
  verified?: boolean;
  avatar: 'photo' | 'identra' | 'group' | 'initial';
  avatarSource?: ImageSourcePropType;
  initials?: string;
  accent?: string;
  deliveryStatus?: DeliveryStatus;
  groupSender?: string;
  lastMessageFromMe?: boolean;
  media?: ChatMediaPreview;
  muted?: boolean;
  hasNewPost?: boolean;
  thought?: string;
  thoughtBackgroundColor?: string;
  thoughtTextColor?: string;
}

export interface CredentialChatPayload {
  title: string;
  issuer: string;
  details: Array<{ label: string; value: string; icon: 'ticket' | 'clock' | 'map' }>;
}

export interface ContractChatPayload {
  title: string;
  asset: string;
  amount: string;
  status: string;
}

export type ChatMessage =
  | {
      id: string;
      type: 'text';
      direction: ChatDirection;
      text: string;
      time: string;
      senderName?: string;
      deliveryStatus?: DeliveryStatus;
    }
  | {
      id: string;
      type: 'media';
      direction: ChatDirection;
      media: ChatMediaPreview;
      text?: string;
      time: string;
      senderName?: string;
      deliveryStatus?: DeliveryStatus;
    }
  | {
      id: string;
      type: 'credential';
      direction: 'outgoing';
      credential: CredentialChatPayload;
      time: string;
      deliveryStatus?: DeliveryStatus;
    }
  | {
      id: string;
      type: 'contract';
      direction: 'outgoing';
      contract: ContractChatPayload;
      time: string;
      deliveryStatus?: DeliveryStatus;
    };

export interface ChatThread extends ChatPreview {
  subtitle: string;
  notice?: string;
  messages: ChatMessage[];
}

export const quickContacts: ChatPreview[] = [
  {
    id: 'story',
    name: 'Tạo tin',
    message: '',
    time: '',
    avatar: 'initial',
    initials: '+',
    accent: '#EEF3FF',
    thought: 'Chia sẻ suy nghĩ',
    thoughtBackgroundColor: '#FFFFFF',
    thoughtTextColor: '#5E6885',
  },
  {
    id: 'minh-anh',
    name: 'Minh Anh',
    message: '',
    time: '',
    avatar: 'photo',
    avatarSource: demoAvatars.catFlower,
    online: true,
    hasNewPost: true,
    thought: 'Ai muốn xem Dune 2 tối nay không? Mình còn 1 vé.',
    thoughtBackgroundColor: '#1768FF',
    thoughtTextColor: '#FFFFFF',
  },
  {
    id: 'khanh',
    name: 'Khánh',
    message: '',
    time: '',
    avatar: 'photo',
    avatarSource: demoAvatars.avatarA,
    initials: 'K',
    accent: '#DDEBFF',
    online: true,
    hasNewPost: true,
    thought: 'Vừa cập nhật thực chứng mới, cần xác minh thì nhắn mình.',
    thoughtBackgroundColor: '#E8F0FF',
    thoughtTextColor: '#0B4FD9',
  },
  {
    id: 'tuan',
    name: 'Tuấn',
    message: '',
    time: '',
    avatar: 'photo',
    avatarSource: demoAvatars.avatarB,
    initials: 'T',
    accent: '#DBF5FF',
    online: true,
    thought: 'Cafe nhé?',
    thoughtBackgroundColor: '#FFF7D7',
    thoughtTextColor: '#7A4B00',
  },
  {
    id: 'linh',
    name: 'Linh',
    message: '',
    time: '',
    avatar: 'photo',
    avatarSource: demoAvatars.avatarC,
    initials: 'L',
    accent: '#FFE8F0',
    online: true,
    hasNewPost: true,
    thought: 'Đã kết nối SSI thành công, cảm giác rất gọn.',
    thoughtBackgroundColor: '#F2EAFF',
    thoughtTextColor: '#5D2FC2',
  },
];

export const chatConversations: ChatPreview[] = [
  {
    id: 'minh-anh',
    name: 'Minh Anh',
    message: 'Mình đã gửi hợp đồng giao dịch vé cho bạn.',
    time: '10:32',
    avatar: 'photo',
    avatarSource: demoAvatars.catFlower,
    lastMessageFromMe: true,
    deliveryStatus: 'seen',
    online: true,
  },
  {
    id: 'cyberjutsu',
    name: 'CyberJutsu Academy',
    message: 'Lịch tập tối nay đã cập nhật.',
    time: '09:48',
    avatar: 'group',
    avatarSource: demoAvatars.catMask,
    initials: 'CJ',
    accent: '#111827',
    groupSender: 'Nam',
    lastMessageFromMe: false,
    muted: true,
    unread: 4,
  },
  {
    id: 'bo-hoang',
    name: 'Bố Hoàng',
    message: '',
    time: 'Hôm qua',
    avatar: 'photo',
    avatarSource: demoAvatars.avatarA,
    initials: 'BH',
    accent: '#E9F7EF',
    lastMessageFromMe: true,
    deliveryStatus: 'sent',
    media: { type: 'file', fileName: 'Hợp đồng thuê nhà.pdf' },
    muted: true,
  },
  {
    id: 'tien-dat',
    name: 'Tiến Đạt',
    message: '',
    time: 'Hôm qua',
    avatar: 'photo',
    avatarSource: demoAvatars.avatarB,
    initials: 'TĐ',
    accent: '#FFF1DA',
    lastMessageFromMe: true,
    deliveryStatus: 'pending',
    media: { type: 'photo' },
  },
  {
    id: 'duong-huong',
    name: 'Dương Hướng',
    message: 'Ảnh cưới đã chọn xong.',
    time: 'Th 6',
    avatar: 'photo',
    avatarSource: demoAvatars.avatarC,
    initials: 'DH',
    accent: '#EEF3FF',
    lastMessageFromMe: true,
    deliveryStatus: 'seen',
    media: { type: 'photo', count: 6 },
  },
  {
    id: 'nguyen-luong',
    name: 'Nguyễn Lương',
    message: '',
    time: 'Th 5',
    avatar: 'photo',
    avatarSource: demoAvatars.avatarD,
    initials: 'NL',
    accent: '#E5F6FF',
    lastMessageFromMe: false,
    media: { type: 'gif' },
    unread: 1,
  },
  {
    id: 'movie-group',
    name: 'Nhóm vé phim',
    message: 'Mình gửi lại mã đặt chỗ nhé.',
    time: 'Th 5',
    avatar: 'group',
    avatarSource: demoAvatars.avatarE,
    initials: 'VP',
    accent: '#174EA6',
    lastMessageFromMe: true,
    deliveryStatus: 'sent',
    media: { type: 'photo', count: 3 },
    muted: true,
  },
  {
    id: 'family',
    name: 'Gia đình',
    message: '',
    time: 'Th 4',
    avatar: 'group',
    avatarSource: demoAvatars.avatarF,
    initials: 'GD',
    accent: '#7C3AED',
    groupSender: 'Mẹ',
    lastMessageFromMe: false,
    media: { type: 'file', fileName: 'Danh sách đồ cần mua.xlsx' },
    unread: 2,
  },
  {
    id: 'identra',
    name: 'Identra',
    message: 'Mã xác thực đăng nhập của bạn là 842713.',
    time: 'Th 5',
    avatar: 'identra',
    verified: true,
  },
  {
    id: 'khanh',
    name: 'Khánh',
    message: 'Mình sẽ gửi thực chứng sau cuộc họp.',
    time: 'Th 4',
    avatar: 'photo',
    avatarSource: demoAvatars.avatarG,
    lastMessageFromMe: true,
    deliveryStatus: 'pending',
  },
  {
    id: 'linh',
    name: 'Linh',
    message: 'Cảm ơn nhé, mình đã nhận được thông tin.',
    time: 'Th 3',
    avatar: 'photo',
    avatarSource: demoAvatars.avatarH,
    lastMessageFromMe: false,
    online: true,
  },
  {
    id: 'idpay-team',
    name: 'IDPay Team',
    message: 'Mình đã đối soát giao dịch lúc 18:00.',
    time: 'Th 2',
    avatar: 'group',
    avatarSource: demoAvatars.catMask,
    initials: 'IP',
    accent: '#0F766E',
    groupSender: 'Hà',
    lastMessageFromMe: false,
    media: { type: 'gif' },
    unread: 3,
  },
  {
    id: 'tuan',
    name: 'Tuấn',
    message: 'Mai cafe rồi chốt hợp đồng nhé.',
    time: 'CN',
    avatar: 'photo',
    avatarSource: demoAvatars.catFlower,
    lastMessageFromMe: true,
    deliveryStatus: 'sent',
    muted: true,
  },
];

const sharedMovieCredential: CredentialChatPayload = {
  title: 'Thực chứng vé xem phim',
  issuer: 'CGV Vincom',
  details: [
    { icon: 'ticket', label: 'Phim:', value: 'Dune 2' },
    { icon: 'clock', label: 'Suất chiếu:', value: '20:00, 22/06/2024' },
    { icon: 'map', label: 'Ghế:', value: 'A12' },
  ],
};

const sharedMovieContract: ContractChatPayload = {
  title: 'Hợp đồng trao đổi an toàn',
  asset: 'Thực chứng vé xem phim Dune 2',
  amount: '450.000 VND',
  status: 'Đang chờ phản hồi',
};

const chatMessagesById: Record<string, ChatMessage[]> = {
  'minh-anh': [
    { id: 'ma-1', type: 'text', direction: 'incoming', text: 'Chào bạn, mình muốn mua vé xem phim Dune 2 suất 20:00 tối nay.', time: '10:30' },
    { id: 'ma-2', type: 'text', direction: 'outgoing', text: 'Mình còn 1 vé. Mình sẽ gửi thực chứng vé và hợp đồng để giao dịch an toàn.', time: '10:32', deliveryStatus: 'seen' },
    { id: 'ma-3', type: 'credential', direction: 'outgoing', credential: sharedMovieCredential, time: '10:33', deliveryStatus: 'seen' },
    { id: 'ma-4', type: 'text', direction: 'incoming', text: 'Cảm ơn bạn! Gửi mình hợp đồng nhé.', time: '10:34' },
    { id: 'ma-5', type: 'contract', direction: 'outgoing', contract: sharedMovieContract, time: '10:35', deliveryStatus: 'seen' },
  ],
  cyberjutsu: [
    { id: 'cj-1', type: 'text', direction: 'incoming', senderName: 'Linh', text: 'Tối nay lớp tập lúc mấy giờ vậy mọi người?', time: '09:15' },
    { id: 'cj-2', type: 'text', direction: 'outgoing', text: 'Mình nhớ là 19:30, để mình kiểm tra lại lịch.', time: '09:18', deliveryStatus: 'seen' },
    { id: 'cj-3', type: 'text', direction: 'incoming', senderName: 'Nam', text: 'Lịch tập tối nay đã cập nhật.', time: '09:48' },
  ],
  'bo-hoang': [
    { id: 'bh-1', type: 'text', direction: 'incoming', text: 'Con gửi giúp bố bản hợp đồng thuê nhà để bố xem lại nhé.', time: 'Hôm qua, 08:12' },
    { id: 'bh-2', type: 'text', direction: 'outgoing', text: 'Dạ con gửi file ở đây, bố mở được thì báo con nhé.', time: 'Hôm qua, 08:20', deliveryStatus: 'sent' },
    { id: 'bh-3', type: 'media', direction: 'outgoing', media: { type: 'file', fileName: 'Hợp đồng thuê nhà.pdf' }, time: 'Hôm qua, 08:21', deliveryStatus: 'sent' },
  ],
  'tien-dat': [
    { id: 'td-1', type: 'text', direction: 'incoming', text: 'Có ảnh biên nhận chưa bạn?', time: 'Hôm qua, 15:40' },
    { id: 'td-2', type: 'media', direction: 'outgoing', media: { type: 'photo' }, time: 'Hôm qua, 15:42', deliveryStatus: 'pending' },
  ],
  'duong-huong': [
    { id: 'dh-1', type: 'text', direction: 'incoming', text: 'Gửi mình những ảnh đã chọn nhé.', time: 'Th 6, 11:10' },
    { id: 'dh-2', type: 'media', direction: 'outgoing', media: { type: 'photo', count: 6 }, text: 'Ảnh cưới đã chọn xong.', time: 'Th 6, 11:18', deliveryStatus: 'seen' },
  ],
  'nguyen-luong': [
    { id: 'nl-1', type: 'text', direction: 'outgoing', text: 'Tối nay gửi mình nhãn dán mới nha.', time: 'Th 5, 20:12', deliveryStatus: 'seen' },
    { id: 'nl-2', type: 'media', direction: 'incoming', media: { type: 'gif' }, time: 'Th 5, 20:15' },
  ],
  'movie-group': [
    { id: 'vp-1', type: 'text', direction: 'incoming', senderName: 'An', text: 'Ai giữ mã đặt chỗ của nhóm vậy?', time: 'Th 5, 14:02' },
    { id: 'vp-2', type: 'media', direction: 'outgoing', media: { type: 'photo', count: 3 }, text: 'Mình gửi lại mã đặt chỗ nhé.', time: 'Th 5, 14:06', deliveryStatus: 'sent' },
  ],
  family: [
    { id: 'gd-1', type: 'text', direction: 'incoming', senderName: 'Bố', text: 'Cuối tuần nhà mình ăn cơm lúc 18:00 nhé.', time: 'Th 4, 17:20' },
    { id: 'gd-2', type: 'media', direction: 'incoming', senderName: 'Mẹ', media: { type: 'file', fileName: 'Danh sách đồ cần mua.xlsx' }, time: 'Th 4, 17:28' },
  ],
  identra: [
    { id: 'id-1', type: 'text', direction: 'incoming', text: 'Đăng nhập mới được ghi nhận trên thiết bị Android.', time: 'Th 5, 09:12' },
    { id: 'id-2', type: 'text', direction: 'incoming', text: 'Mã xác thực đăng nhập của bạn là 842713.', time: 'Th 5, 09:13' },
  ],
  khanh: [
    { id: 'kh-1', type: 'text', direction: 'incoming', text: 'Sau cuộc họp bạn gửi mình thực chứng tham dự được không?', time: 'Th 4, 16:40' },
    { id: 'kh-2', type: 'text', direction: 'outgoing', text: 'Mình sẽ gửi thực chứng sau cuộc họp.', time: 'Th 4, 16:42', deliveryStatus: 'pending' },
  ],
  linh: [
    { id: 'li-1', type: 'text', direction: 'outgoing', text: 'Mình đã gửi thông tin tài khoản IDPay rồi nha.', time: 'Th 3, 10:06', deliveryStatus: 'seen' },
    { id: 'li-2', type: 'text', direction: 'incoming', text: 'Cảm ơn nhé, mình đã nhận được thông tin.', time: 'Th 3, 10:08' },
  ],
  'idpay-team': [
    { id: 'ip-1', type: 'text', direction: 'incoming', senderName: 'Minh', text: 'Có ai đối soát giao dịch hôm nay chưa?', time: 'Th 2, 18:02' },
    { id: 'ip-2', type: 'media', direction: 'incoming', senderName: 'Hà', media: { type: 'gif' }, text: 'Mình đã đối soát giao dịch lúc 18:00.', time: 'Th 2, 18:04' },
  ],
  tuan: [
    { id: 'tu-1', type: 'text', direction: 'incoming', text: 'Mai cafe nói tiếp phần hợp đồng nhé?', time: 'CN, 21:20' },
    { id: 'tu-2', type: 'text', direction: 'outgoing', text: 'Mai cafe rồi chốt hợp đồng nhé.', time: 'CN, 21:22', deliveryStatus: 'sent' },
  ],
};

export const chatThreads: Record<string, ChatThread> = Object.fromEntries(
  chatConversations.map((conversation) => [
    conversation.id,
    {
      ...conversation,
      subtitle:
        conversation.avatar === 'identra'
          ? 'Thông báo bảo mật Identra'
          : conversation.avatar === 'group'
            ? 'Nhóm SSI đã xác minh'
            : 'Kết nối SSI đã xác minh',
      notice:
        conversation.id === 'minh-anh'
          ? 'Thực chứng và khoản thanh toán sẽ được xử lý theo hợp đồng thông minh để giảm rủi ro lừa đảo.'
          : undefined,
      messages: chatMessagesById[conversation.id] ?? [],
    },
  ]),
) as Record<string, ChatThread>;

export function getChatThread(conversationId?: string) {
  return chatThreads[conversationId ?? 'minh-anh'] ?? chatThreads['minh-anh'];
}
