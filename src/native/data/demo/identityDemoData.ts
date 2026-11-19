import type {
  ActivityLog,
  AppSettings,
  Credential,
  PersonalInfo,
} from '../../types';
import { defaultFlowSettings } from '../../domain/app-store/appSettingsDefaults';

export const INITIAL_PROFILE: PersonalInfo = {
  fullName: 'Nguyễn Văn An',
  dob: '15/10/2002',
  studentId: '20021345',
  school: 'Đại học Công nghệ',
  nationalId: '001202003847',
  email: 'an.nguyen@vnu.edu.vn',
  phone: '0382948210',
  address: 'Phố Xuân Thủy, Cầu Giấy, Hà Nội',
  // No demo identifier: the wallet has none to show, and the scanner's invitation does not use one.
  did: '',
};

export const INITIAL_SETTINGS: AppSettings = {
  language: 'vi',
  theme: 'system',
  notificationsEnabled: true,
  hideSensitiveData: true,
  flowSettings: defaultFlowSettings,
};

/** The wallet's documents live in the SDK vault; the app store keeps no demo credential. */
export const INITIAL_CREDENTIALS: Credential[] = [];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'activity-1',
    timestamp: '2026-06-11T10:30:00+07:00',
    type: 'verify',
    status: 'success',
    title: 'Bằng tốt nghiệp',
    description: 'Xác minh thành công',
    partner: 'Đại học Công nghệ',
    isDemo: true,
  },
  {
    id: 'activity-2',
    timestamp: '2026-06-11T09:15:00+07:00',
    type: 'verify',
    status: 'success',
    title: 'Chứng chỉ ngoại ngữ',
    description: 'Xác minh thành công',
    partner: 'IELTS',
    isDemo: true,
  },
  {
    id: 'activity-3',
    timestamp: '2026-06-11T08:45:00+07:00',
    type: 'share',
    status: 'pending',
    title: 'Chia sẻ thông tin',
    description: 'Đang chờ xác nhận',
    partner: 'Ngân hàng ABC',
    isDemo: true,
  },
  {
    id: 'activity-4',
    timestamp: '2024-06-20T16:20:00+07:00',
    type: 'verify',
    status: 'success',
    title: 'KYC Level 2',
    description: 'Xác minh thành công',
    partner: 'SSI KYC',
    isDemo: true,
  },
  {
    id: 'activity-5',
    timestamp: '2024-06-20T11:05:00+07:00',
    type: 'share',
    status: 'success',
    title: 'Chia sẻ thông tin',
    description: 'Xác minh thành công',
    partner: 'Bảo hiểm XYZ',
    isDemo: true,
  },
  {
    id: 'activity-6',
    timestamp: '2024-06-20T09:30:00+07:00',
    type: 'verify',
    status: 'failed',
    title: 'KYC Level 2',
    description: 'Xác minh thất bại',
    partner: 'FinTech Pro',
    isDemo: true,
  },
];

export const NOTIFICATIONS = [
  {
    id: 'notification-1',
    title: 'Yêu cầu chia sẻ dữ liệu',
    body: 'Công ty TNHH ABC đang yêu cầu một số thông tin từ ví của bạn.',
    time: '5 phút trước',
  },
  {
    id: 'notification-2',
    title: 'Thực chứng đã được xác minh',
    body: 'Bằng tốt nghiệp của bạn đã được xác minh thành công.',
    time: 'Hôm qua',
  },
  {
    id: 'notification-3',
    title: 'Cảnh báo bảo mật',
    body: 'Identra phát hiện một lần đăng nhập mới trên thiết bị này.',
    time: '09/06/2026',
  },
];
