import {
  Bot,
  Briefcase,
  Code2,
  Landmark,
  Music2,
  ShieldCheck,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react-native';
import type { ImageSourcePropType } from 'react-native';
import { assetManifest } from '../../assets/assetManifest';

export const verifiedBadgeIcon = assetManifest.badges.verified;
const beeIcon = assetManifest.miniApps.bee;
const publicServiceIcon = assetManifest.miniApps.publicService;
const accountAvatarA = assetManifest.chat.avatars.avatarA;
const accountAvatarB = assetManifest.chat.avatars.avatarF;
const accountAvatarC = assetManifest.chat.avatars.avatarG;
const accountAvatarD = assetManifest.chat.avatars.avatarH;

export type TrendSuggestion = {
  title: string;
  category: string;
  count: string;
  verified?: boolean;
  bars: number[];
};

export type AccountSuggestion = {
  name: string;
  handle: string;
  bio: string;
  verified?: boolean;
  avatarSource?: ImageSourcePropType;
  avatarKind?: 'identra';
};

export type GroupSuggestion = {
  name: string;
  description: string;
  members: string;
  colors: [string, string];
  icon: LucideIcon;
};

export type MiniAppSuggestion = {
  name: string;
  category: string;
  description: string;
  approved?: boolean;
  imageSource?: ImageSourcePropType;
  colors?: [string, string];
  icon?: LucideIcon;
};

export type NewsFeedSearchTab = 'all' | 'trends' | 'accounts' | 'groups' | 'miniApps';
export type FilterDateDirection = 'after' | 'before';
export type FilterSortMode = 'relevant' | 'latest';

export const tabs: Array<{ key: NewsFeedSearchTab; label: string }> = [
  { key: 'all', label: 'Tất cả' },
  { key: 'trends', label: 'Xu hướng' },
  { key: 'accounts', label: 'Tài khoản' },
  { key: 'groups', label: 'Nhóm' },
  { key: 'miniApps', label: 'Mini App' },
];

export const interestSuggestions = [
  'Công nghệ',
  'Blockchain',
  'AI',
  'Âm nhạc',
  'Web3',
  'SSI',
  'Bảo mật',
  'Thanh toán',
  'Sự kiện',
  'Thể thao',
  'Mini App',
  'DeFi',
  'Smart Contract',
  'Dữ liệu cá nhân',
];

export const initialFilterInterests = ['Công nghệ', 'Blockchain', 'AI', 'Âm nhạc'];

export const trends: TrendSuggestion[] = [
  { title: '#GENfest2025', category: 'Sự kiện · Âm nhạc', count: '128.6K bài viết', verified: true, bars: [22, 30, 27, 38, 34, 29, 36, 46, 42, 58] },
  { title: 'Tuyển Việt Nam', category: 'Thể thao', count: '85.3K bài viết', bars: [18, 16, 23, 34, 30, 24, 38, 26, 31, 48] },
  { title: 'AI Agents', category: 'Công nghệ', count: '71.2K bài viết', bars: [12, 16, 15, 14, 17, 22, 19, 18, 24, 56] },
  { title: 'Identra Pay', category: 'Tài chính số', count: '64.8K bài viết', verified: true, bars: [16, 18, 26, 22, 30, 27, 36, 41, 44, 52] },
  { title: 'Ví danh tính số', category: 'SSI · Web3', count: '52.4K bài viết', bars: [14, 20, 18, 27, 25, 29, 33, 31, 42, 47] },
  { title: 'Blockchain Việt Nam', category: 'Cộng đồng', count: '49.1K bài viết', bars: [10, 14, 18, 16, 24, 30, 29, 34, 39, 45] },
  { title: 'Mini App', category: 'Sản phẩm số', count: '38.9K bài viết', bars: [12, 19, 23, 22, 28, 27, 31, 35, 37, 44] },
  { title: 'Bảo mật dữ liệu', category: 'An toàn số', count: '33.7K bài viết', bars: [9, 13, 15, 21, 18, 24, 29, 32, 34, 42] },
  { title: 'Smart Contract', category: 'Web3', count: '29.5K bài viết', bars: [11, 12, 18, 20, 22, 26, 23, 30, 36, 40] },
  { title: 'IDPass', category: 'Danh tính', count: '24.2K bài viết', bars: [8, 12, 16, 19, 18, 21, 28, 27, 33, 38] },
];

export const accounts: AccountSuggestion[] = [
  { name: 'Identra', handle: '@identra_app', bio: 'Super App cho cộng đồng Web3 Việt Nam.', verified: true, avatarKind: 'identra' },
  { name: 'Minh Anh', handle: '@minhanh.eth', bio: 'Kỹ sư Blockchain tại SSI. Yêu thích smart contracts & DeFi.', avatarSource: accountAvatarA },
  { name: 'Linh Trần', handle: '@linhtran', bio: 'Chia sẻ về công nghệ, danh tính số và cộng đồng sáng tạo.', verified: true, avatarSource: accountAvatarB },
  { name: 'Dương Tôn Sơn', handle: '@duongtonson', bio: 'Builder, creator, thích các sản phẩm tôn trọng quyền riêng tư.', avatarSource: accountAvatarC },
  { name: 'CyberJutsu Academy', handle: '@cyberjutsu', bio: 'Đào tạo an toàn thông tin, AI security và bảo mật ứng dụng.', verified: true, avatarSource: accountAvatarD },
];

export const groups: GroupSuggestion[] = [
  { name: 'AI Việt Nam', description: 'Chia sẻ kiến thức và ứng dụng AI trong thực tế.', members: '12.5K thành viên', colors: ['#692BFF', '#8B5CF6'], icon: Bot },
  { name: 'Lập Trình Việt Nam', description: 'Cộng đồng lập trình viên Việt Nam.', members: '28.3K thành viên', colors: ['#0077FF', '#00B2FF'], icon: Code2 },
  { name: 'Web3 Builders', description: 'Xây sản phẩm phi tập trung, ví và smart contract.', members: '9.8K thành viên', colors: ['#355CFF', '#6D5DFB'], icon: Sparkles },
  { name: 'An toàn dữ liệu cá nhân', description: 'Thảo luận về bảo mật, quyền riêng tư và dữ liệu cá nhân.', members: '7.4K thành viên', colors: ['#12B76A', '#2DD4BF'], icon: ShieldCheck },
  { name: 'Nhà sáng tạo Identra', description: 'Không gian kết nối creator, mini app và cộng đồng.', members: '6.1K thành viên', colors: ['#F57900', '#FB923C'], icon: Users },
];

export const miniApps: MiniAppSuggestion[] = [
  { name: 'Bee', category: 'Di chuyển', description: 'Đặt xe nhanh chóng, giao hàng tiện lợi mọi lúc.', approved: true, imageSource: beeIcon },
  { name: 'Dịch vụ công', category: 'Tiện ích công', description: 'Xử lý dịch vụ công trực tuyến, theo dõi hồ sơ dễ dàng.', approved: true, imageSource: publicServiceIcon },
  { name: 'IDPay', category: 'Thanh toán', description: 'Thanh toán an toàn bằng danh tính số và ví Identra.', approved: true, colors: ['#355CFF', '#60A5FA'], icon: Briefcase },
  { name: 'EventPass', category: 'Sự kiện', description: 'Quản lý vé, check-in và chuyển nhượng qua hợp đồng.', colors: ['#9747FF', '#B986FF'], icon: Music2 },
  { name: 'Gov Connect', category: 'Định danh', description: 'Kết nối hồ sơ công dân, tổ chức và dịch vụ tin cậy.', approved: true, colors: ['#12B76A', '#22C55E'], icon: Landmark },
];
