import type { SmartContractFeedPost } from '../../types';
import { assetManifest } from '../../assets/assetManifest';

export const identraFeedImage = assetManifest.newsFeed.identraFeed;
export const dalatFeedImage = assetManifest.newsFeed.dalat;
export const linhFeedImage = assetManifest.newsFeed.linh;
export const liveStreamImage = dalatFeedImage;
export const liveHostAvatar = assetManifest.app.studentAvatar;
export const liveViewerAvatar = assetManifest.chat.avatars.avatarH;
export const liveViewerAvatarAlt = assetManifest.chat.avatars.avatarE;
export const verifiedBadgeIcon = assetManifest.badges.verified;

export const demoSmartContractPosts: SmartContractFeedPost[] = [
  {
    id: 'genfest-official-ticket-sale',
    authorName: 'GENfest Official',
    handle: '@genfest_official',
    time: '30 phút',
    text: 'GENfest 2025 mở bán vé VIP A qua hợp đồng thông minh.\nSố lượng giới hạn, giao dịch an toàn qua Identra Pay.',
    authorKind: 'organization',
    contract: {
      id: 'genfest-official-available',
      title: 'Bán vé concert GENfest 2025',
      status: 'Còn 1 vé',
      availability: 'available',
      assetTitle: 'Vé concert GENfest 2025',
      assetSubtitle: 'Hạng: VIP A · 08/06/2025',
      assetCode: 'Mã vé: GEN2025-VPA-0832',
      assetStateLabel: 'Còn 1 vé',
      remainingLabel: '1 vật phẩm còn lại',
      remainingCount: 1,
      amount: '₫ 1.500.000 VNĐ',
      paymentLabel: 'Thanh toán qua Identra Pay',
      deadline: '23:59 · 18/05/2025',
      condition: 'Chỉ chuyển quyền sở hữu sau khi thanh toán được xác nhận',
      security: 'Mọi giao dịch được lưu vết minh bạch trên blockchain',
      eventDate: '08/06/2025',
      location: 'TP.HCM',
      owner: 'GENfest Official',
      issuer: 'GENfest Official',
      itemType: 'Thực chứng vé sự kiện',
      transferability: 'Theo hợp đồng',
      verificationMethod: 'Ký số + blockchain',
      transactionStatus: 'Sẵn sàng giao dịch',
    },
    stats: {
      comments: '32',
      reposts: '86',
      likes: '420',
      views: '9,8K',
    },
  },
  {
    id: 'minh-khoa-ticket-resale',
    authorName: 'Minh Khoa',
    handle: '@minhkhoa.eth',
    time: '1 giờ',
    text: 'Tôi vừa tạo một hợp đồng trao đổi vé an toàn.\nCùng kiểm tra chi tiết bên dưới nhé.',
    authorKind: 'person',
    contract: {
      id: 'minh-khoa-sold-out',
      title: 'Bán lại vé concert GENfest 2025',
      status: 'Đã hết vật phẩm',
      availability: 'soldOut',
      assetTitle: 'Vé concert GENfest 2025',
      assetSubtitle: 'Hạng: VIP A · 08/06/2025',
      assetCode: 'Mã vé: GEN2025-VPA-0832',
      assetStateLabel: 'Đã hết',
      remainingLabel: '0 vật phẩm còn lại',
      remainingCount: 0,
      limitMessage: 'Hợp đồng đã đạt giới hạn số lượng vật phẩm giao dịch.',
      amount: '₫ 1.500.000 VNĐ',
      paymentLabel: 'Thanh toán qua Identra Pay',
      deadline: '23:59 · 18/05/2025',
      condition: 'Chỉ chuyển quyền sở hữu sau khi thanh toán được xác nhận',
      security: 'Mọi giao dịch được lưu vết minh bạch trên blockchain',
      eventDate: '08/06/2025',
      location: 'TP.HCM',
      owner: 'Minh Khoa',
      issuer: 'GENfest Official',
      itemType: 'Thực chứng vé sự kiện',
      transferability: 'Theo hợp đồng',
      verificationMethod: 'Ký số + blockchain',
      transactionStatus: 'Hết lượt giao dịch',
    },
    stats: {
      comments: '18',
      reposts: '42',
      likes: '203',
      views: '5,2K',
    },
  },
];
