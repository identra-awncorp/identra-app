import {
  AtSign,
  CheckCircle2,
  Clock3,
  CloudUpload,
  FileCheck2,
  Share2,
  ShieldCheck,
  Star,
  UserRound,
  type LucideIcon,
} from 'lucide-react-native';
import type { ImageSourcePropType } from 'react-native';
import { assetManifest } from '../../assets/assetManifest';
import { palette } from '../../theme';

const notificationMentionAvatar = assetManifest.chat.avatars.avatarE;
const notificationFollowerAvatar = assetManifest.chat.avatars.avatarC;

export type NotificationFilter = 'all' | 'mentions' | 'follows' | 'transactions' | 'system';
export type NotificationCategory = Exclude<NotificationFilter, 'all'>;
export type NotificationAvatar =
  | { type: 'image'; source: ImageSourcePropType }
  | { type: 'icon'; icon: LucideIcon; background: string; color: string; fill?: string }
  | { type: 'text'; label: string; background: string; color: string };

export type NotificationItem = {
  id: string;
  category: NotificationCategory;
  strong: string;
  text: string;
  body: string;
  time: string;
  unread?: boolean;
  chip?: string;
  avatar: NotificationAvatar;
  badge: {
    icon: LucideIcon;
    background: string;
    color: string;
    fill?: string;
  };
};

export const notificationTabs: { key: NotificationFilter; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'mentions', label: 'Nhắc đến' },
  { key: 'follows', label: 'Theo dõi' },
  { key: 'transactions', label: 'Giao dịch' },
  { key: 'system', label: 'Hệ thống' },
];

export const notificationItems: NotificationItem[] = [
  {
    id: 'mention-design',
    category: 'mentions',
    strong: 'Minh Anh',
    text: ' đã nhắc đến bạn trong một bài viết',
    body: '@linhvu cảm ơn bạn đã chia sẻ thông tin hữu ích!',
    chip: 'Thiết kế hệ thống danh tính phi tập trung',
    time: '2 phút trước',
    unread: true,
    avatar: { type: 'image', source: notificationMentionAvatar },
    badge: { icon: AtSign, background: palette.blue[700], color: palette.white },
  },
  {
    id: 'follow-cyberjutsu',
    category: 'follows',
    strong: 'CyberJutsu Academy',
    text: ' bắt đầu theo dõi bạn',
    body: 'Khám phá các khóa học về an ninh mạng Web3',
    time: '15 phút trước',
    unread: true,
    avatar: { type: 'text', label: 'CJ', background: '#050505', color: palette.white },
    badge: { icon: UserRound, background: palette.blue[700], color: palette.white, fill: palette.white },
  },
  {
    id: 'transaction-complete',
    category: 'transactions',
    strong: 'Giao dịch 1.500.000 VNĐ đã hoàn tất',
    text: '',
    body: '+1.500.000 VNĐ từ Nguyễn Hoàng Nam',
    chip: 'Mã giao dịch: #TXN8492F',
    time: '1 giờ trước',
    unread: true,
    avatar: { type: 'icon', icon: ShieldCheck, background: palette.blue[700], color: palette.white },
    badge: { icon: CheckCircle2, background: palette.green[600], color: palette.white, fill: palette.white },
  },
  {
    id: 'contract-deadline',
    category: 'transactions',
    strong: 'Hợp đồng thông minh bán lại vé GENfest 2025',
    text: ' sắp hết hạn phản hồi',
    body: 'Vui lòng phản hồi trước 30/06/2025, 23:59 (UTC+7)',
    time: '2 giờ trước',
    unread: true,
    avatar: { type: 'icon', icon: FileCheck2, background: '#7C3AED', color: palette.white },
    badge: { icon: Clock3, background: '#FFB020', color: palette.white },
  },
  {
    id: 'mini-app-offer',
    category: 'system',
    strong: 'Mini app TravelGo có ưu đãi mới',
    text: '',
    body: 'Giảm 20% khi đặt vé máy bay từ 20-30/06',
    time: '5 giờ trước',
    unread: true,
    avatar: { type: 'text', label: 'C', background: '#4F46E5', color: palette.white },
    badge: { icon: Star, background: '#FFB020', color: palette.white, fill: palette.white },
  },
  {
    id: 'backup-complete',
    category: 'system',
    strong: 'Sao lưu ví đã hoàn tất',
    text: '',
    body: 'Sao lưu cuối cùng: 29/06/2025, 09:15',
    time: '1 ngày trước',
    unread: true,
    avatar: { type: 'icon', icon: CloudUpload, background: palette.blue[700], color: palette.white },
    badge: { icon: CheckCircle2, background: palette.green[600], color: palette.white, fill: palette.white },
  },
  {
    id: 'share-request',
    category: 'transactions',
    strong: 'Bạn nhận được một yêu cầu chia sẻ thực chứng',
    text: '',
    body: 'Từ Trần Quang Huy    Xem chi tiết để phản hồi',
    time: '1 ngày trước',
    unread: true,
    avatar: { type: 'icon', icon: Share2, background: palette.blue[700], color: palette.white },
    badge: { icon: UserRound, background: palette.blue[700], color: palette.white, fill: palette.white },
  },
  {
    id: 'mention-linh',
    category: 'mentions',
    strong: 'Linh Trần',
    text: ' đã trả lời bình luận của bạn',
    body: 'Mình đã gửi thêm tài liệu chi tiết trong thread nhé.',
    time: '1 ngày trước',
    avatar: { type: 'image', source: notificationFollowerAvatar },
    badge: { icon: AtSign, background: palette.blue[700], color: palette.white },
  },
  {
    id: 'follow-genfest',
    category: 'follows',
    strong: 'GENfest Official',
    text: ' bắt đầu theo dõi bạn',
    body: 'Theo dõi lịch mở bán vé và các hoạt động chính thức.',
    time: '2 ngày trước',
    avatar: { type: 'text', label: 'GEN', background: '#4C1D95', color: palette.white },
    badge: { icon: UserRound, background: palette.blue[700], color: palette.white, fill: palette.white },
  },
  {
    id: 'mention-son',
    category: 'mentions',
    strong: 'Dương Tôn Sơn',
    text: ' đã nhắc đến bạn trong phát trực tiếp',
    body: 'Cảm ơn bạn đã tham gia buổi chia sẻ ở Đà Lạt.',
    time: '2 ngày trước',
    avatar: { type: 'image', source: notificationFollowerAvatar },
    badge: { icon: AtSign, background: palette.blue[700], color: palette.white },
  },
  {
    id: 'follow-ai-group',
    category: 'follows',
    strong: 'AI Việt Nam',
    text: ' gợi ý kết nối với bạn',
    body: 'Nhóm đang có 12.5K thành viên cùng quan tâm AI Agents.',
    time: '3 ngày trước',
    avatar: { type: 'text', label: 'AI', background: '#6D28D9', color: palette.white },
    badge: { icon: UserRound, background: palette.blue[700], color: palette.white, fill: palette.white },
  },
  {
    id: 'follow-builder',
    category: 'follows',
    strong: 'Minh Khoa',
    text: ' đã theo dõi bạn',
    body: 'Builder smart contract và vé sự kiện số.',
    time: '3 ngày trước',
    avatar: { type: 'image', source: notificationFollowerAvatar },
    badge: { icon: UserRound, background: palette.blue[700], color: palette.white, fill: palette.white },
  },
];
