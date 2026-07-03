export type { ScreenKey, TabKey } from './app/navigation/navigationTypes';

export type Language = 'vi' | 'en';
export type ThemeMode = 'light' | 'dark' | 'system';
export type AppFlowKey = 'chat' | 'feed' | 'scan' | 'payment' | 'miniApp' | 'identity';
export type FlowSettingValues = Record<string, boolean>;
export type AppFlowSettings = Record<AppFlowKey, FlowSettingValues>;
export type CredentialStatus = 'verified' | 'pending' | 'expired';
export type SmartContractAvailability = 'available' | 'soldOut';

export type CredentialIconName =
  | 'graduation'
  | 'languages'
  | 'shield'
  | 'bank'
  | 'clock'
  | 'security'
  | 'identity'
  | 'briefcase';

export interface CredentialAttribute {
  label: string;
  value: string;
  sensitive?: boolean;
}

export interface Credential {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  time?: string;
  expiryDate?: string;
  status: CredentialStatus;
  icon: CredentialIconName;
  didIssuer: string;
  didHolder: string;
  signature: string;
  attributes: CredentialAttribute[];
  isDemo?: boolean;
}

export interface SmartContractPayload {
  id: string;
  title: string;
  status: string;
  availability: SmartContractAvailability;
  assetTitle: string;
  assetSubtitle: string;
  assetCode: string;
  assetStateLabel: string;
  remainingLabel: string;
  remainingCount: number;
  limitMessage?: string;
  amount: string;
  paymentLabel: string;
  deadline: string;
  condition: string;
  security: string;
  eventDate: string;
  location: string;
  owner: string;
  issuer: string;
  itemType: string;
  transferability: string;
  verificationMethod: string;
  transactionStatus: string;
}

export interface SmartContractFeedPost {
  id: string;
  authorName: string;
  handle: string;
  time: string;
  text: string;
  authorKind: 'person' | 'organization';
  contract: SmartContractPayload;
  stats: {
    comments: string;
    reposts: string;
    likes: string;
    views: string;
  };
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  expiresAt?: string;
  type: 'verify' | 'share' | 'add' | 'security' | 'scan';
  status?: 'success' | 'pending' | 'failed';
  title: string;
  description: string;
  partner: string;
  unread?: boolean;
  isNew?: boolean;
  isDemo?: boolean;
}

export interface PersonalInfo {
  fullName: string;
  dob: string;
  studentId: string;
  school: string;
  nationalId: string;
  email: string;
  phone: string;
  address: string;
  did: string;
}

export interface AppSettings {
  language: Language;
  theme: ThemeMode;
  notificationsEnabled: boolean;
  hideSensitiveData: boolean;
  flowSettings: AppFlowSettings;
}
