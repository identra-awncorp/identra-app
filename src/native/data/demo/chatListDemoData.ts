import { Folder, Sparkles, UsersRound, Video } from 'lucide-react-native';
import type { ComponentType } from 'react';
import type { ImageSourcePropType } from 'react-native';
import { assetManifest } from '../../assets/assetManifest';
import { demoAvatars } from './chatDemoData';

export type SearchIcon = ComponentType<{ color?: string; fill?: string; size?: number; strokeWidth?: number }>;
export type SearchMiniAppConfig = {
  id: string;
  name: string;
  category: string;
  description: string;
  logoText: string;
  backgroundColor: string;
  textColor: string;
  logoSource?: ImageSourcePropType;
};

export type CreateActionConfig = {
  id: string;
  title: string;
  description: string;
  icon: SearchIcon;
  iconColor: string;
  iconBackground: string;
};

export type CreateSuggestedContact = {
  id: string;
  name: string;
  meta: string;
  avatarSource: ImageSourcePropType;
  online?: boolean;
};

export type ReelDemoItem = {
  id: string;
  imageSource: ImageSourcePropType;
  caption: string;
  postedAt: string;
};

export const searchPeople = [
  { id: 'quynh-anh', name: 'Nguyễn Quỳnh Anh', handle: '@quynhanh', avatarSource: demoAvatars.avatarH, online: true },
  { id: 'minh-duc', name: 'Trần Minh Đức', handle: '@minhduc', avatarSource: demoAvatars.avatarB, online: true },
  { id: 'hoang-nam', name: 'Lê Hoàng Nam', handle: '0987 654 321', avatarSource: demoAvatars.avatarG },
  { id: 'thao-vy', name: 'Phạm Thảo Vy', handle: '@thaovy', avatarSource: demoAvatars.avatarC },
];

export const searchMiniApps = [
  {
    id: 'bee',
    name: 'Bee',
    category: 'Đặt xe',
    description: 'Gọi xe, giao hàng, tiện ích di chuyển',
    logoText: 'bee',
    backgroundColor: '#FFC400',
    textColor: '#111111',
    logoSource: assetManifest.miniApps.bee,
  },
  {
    id: 'public-service',
    name: 'Dịch vụ công',
    category: 'Hành chính',
    description: 'Xử lý dịch vụ công, nộp hồ sơ, tra cứu',
    logoText: '★',
    backgroundColor: '#DC241F',
    textColor: '#FFD66B',
    logoSource: assetManifest.miniApps.publicService,
  },
  {
    id: 'idpay',
    name: 'IDPay',
    category: 'Tài chính',
    description: 'Ví điện tử, chuyển tiền, thanh toán',
    logoText: '▰',
    backgroundColor: '#7C3AED',
    textColor: '#FFFFFF',
  },
] satisfies SearchMiniAppConfig[];

export const createActions = [
  {
    id: 'group',
    title: 'Tạo nhóm',
    description: 'Bắt đầu trò chuyện với nhiều người',
    icon: UsersRound,
    iconColor: '#355CFF',
    iconBackground: '#EEF3FF',
  },
  {
    id: 'video',
    title: 'Cuộc gọi video nhóm',
    description: 'Tạo phòng gọi video nhanh',
    icon: Video,
    iconColor: '#17A957',
    iconBackground: '#EAF8EF',
  },
  {
    id: 'files',
    title: 'Tài liệu của tôi',
    description: 'File, ảnh và nội dung đã lưu từ hội thoại',
    icon: Folder,
    iconColor: '#7C3AED',
    iconBackground: '#F2EAFF',
  },
  {
    id: 'ai',
    title: 'Chat với AI',
    description: 'Hỏi đáp và hỗ trợ trong Identra',
    icon: Sparkles,
    iconColor: '#355CFF',
    iconBackground: '#EEF3FF',
  },
] satisfies CreateActionConfig[];

export const createSuggestedContacts = [
  { id: 'minh-anh', name: 'Minh Anh', meta: 'Gần đây', avatarSource: demoAvatars.catFlower, online: true },
  { id: 'khanh', name: 'Khánh', meta: 'Thường xuyên', avatarSource: demoAvatars.avatarA, online: true },
  { id: 'tuan', name: 'Tuấn', meta: '@tuan', avatarSource: demoAvatars.avatarB, online: true },
  { id: 'linh', name: 'Linh', meta: 'Gần đây', avatarSource: demoAvatars.avatarC, online: true },
  { id: 'bo-hoang', name: 'Bố Hoàng', meta: 'Gia đình', avatarSource: demoAvatars.avatarD },
] satisfies CreateSuggestedContact[];

export const reelDemoImages = {
  sunset: assetManifest.chat.reels.sunset,
  cafe: assetManifest.chat.reels.cafe,
};

export const reelsByContact: Record<string, ReelDemoItem[]> = {
  'minh-anh': [
    {
      id: 'minh-anh-sunset',
      imageSource: reelDemoImages.sunset,
      caption: 'Hoàng hôn hôm nay\nThành phố thật đẹp!',
      postedAt: '2 phút trước',
    },
    {
      id: 'minh-anh-cafe',
      imageSource: reelDemoImages.cafe,
      caption: 'Một chút cafe trước giờ xem phim.',
      postedAt: '5 phút trước',
    },
  ],
  khanh: [
    {
      id: 'khanh-cafe',
      imageSource: reelDemoImages.cafe,
      caption: 'Cafe chiều nay, bàn chuyện thực chứng.',
      postedAt: '12 phút trước',
    },
    {
      id: 'khanh-sunset',
      imageSource: reelDemoImages.sunset,
      caption: 'Sau cuộc họp vẫn kịp ngắm hoàng hôn.',
      postedAt: '18 phút trước',
    },
  ],
  linh: [
    {
      id: 'linh-sunset',
      imageSource: reelDemoImages.sunset,
      caption: 'Kết nối SSI xong, nhẹ cả người.',
      postedAt: '20 phút trước',
    },
  ],
};

export type SearchPerson = (typeof searchPeople)[number];
export type SearchMiniApp = (typeof searchMiniApps)[number];
