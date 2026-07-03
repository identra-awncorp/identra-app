import type { ImageSourcePropType } from 'react-native';

import { assetManifest } from '../../assets/assetManifest';
import type { I18nKey } from '../../i18n';

export type MiniAppTone = 'finance' | 'utility' | 'payment' | 'transport';

export interface MiniAppTile {
  id: string;
  titleKey: I18nKey;
  icon: ImageSourcePropType;
}

export interface RecommendedMiniApp {
  id: string;
  titleKey: I18nKey;
  descriptionKey: I18nKey;
  categoryKey: I18nKey;
  icon: ImageSourcePropType;
  tone: MiniAppTone;
}

export interface MiniAppCollection {
  id: string;
  titleKey: I18nKey;
  descriptionKey: I18nKey;
  actionKey: I18nKey;
  image: ImageSourcePropType;
  tone: 'publicService' | 'transport';
}

const icons = assetManifest.miniAppDemo.icons;
const banners = assetManifest.miniAppDemo.banners;

export const frequentMiniApps: MiniAppTile[] = [
  { id: 'public-service', titleKey: 'miniApp.apps.publicService', icon: icons.publicService },
  { id: 'civil-status', titleKey: 'miniApp.apps.civilStatus', icon: icons.civilStatus },
  { id: 'social-insurance', titleKey: 'miniApp.apps.socialInsurance', icon: icons.socialInsurance },
  { id: 'personal-tax', titleKey: 'miniApp.apps.personalTax', icon: icons.personalTax },
  { id: 'temporary-residence', titleKey: 'miniApp.apps.temporaryResidence', icon: icons.temporaryResidence },
  { id: 'traffic-fine', titleKey: 'miniApp.apps.trafficFine', icon: icons.trafficFine },
  { id: 'public-health', titleKey: 'miniApp.apps.publicHealth', icon: icons.publicHealth },
  { id: 'public-education', titleKey: 'miniApp.apps.publicEducation', icon: icons.publicEducation },
];

export const popularMiniAppCategories: MiniAppTile[] = [
  { id: 'finance', titleKey: 'miniApp.categories.finance', icon: icons.finance },
  { id: 'payment', titleKey: 'miniApp.categories.payment', icon: icons.payment },
  { id: 'shopping', titleKey: 'miniApp.categories.shopping', icon: icons.shopping },
  { id: 'transport', titleKey: 'miniApp.categories.transport', icon: icons.bee },
  { id: 'entertainment', titleKey: 'miniApp.categories.entertainment', icon: icons.entertainment },
  { id: 'education', titleKey: 'miniApp.categories.education', icon: icons.education },
];

export const recommendedMiniApps: RecommendedMiniApp[] = [
  {
    id: 'mirae-asset',
    titleKey: 'miniApp.recommended.mirae.title',
    descriptionKey: 'miniApp.recommended.mirae.description',
    categoryKey: 'miniApp.categories.finance',
    icon: icons.mirae,
    tone: 'finance',
  },
  {
    id: 'traffic-lookup',
    titleKey: 'miniApp.recommended.traffic.title',
    descriptionKey: 'miniApp.recommended.traffic.description',
    categoryKey: 'miniApp.categories.utility',
    icon: icons.lookupTrafficFine,
    tone: 'utility',
  },
  {
    id: 'viettel-money',
    titleKey: 'miniApp.recommended.viettel.title',
    descriptionKey: 'miniApp.recommended.viettel.description',
    categoryKey: 'miniApp.categories.payment',
    icon: icons.viettel,
    tone: 'payment',
  },
  {
    id: 'bee-ride',
    titleKey: 'miniApp.recommended.bee.title',
    descriptionKey: 'miniApp.recommended.bee.description',
    categoryKey: 'miniApp.categories.transport',
    icon: icons.bee,
    tone: 'transport',
  },
];

export const featuredMiniAppCollections: MiniAppCollection[] = [
  {
    id: 'public-services',
    titleKey: 'miniApp.collections.publicService.title',
    descriptionKey: 'miniApp.collections.publicService.description',
    actionKey: 'miniApp.collections.publicService.action',
    image: banners.publicService,
    tone: 'publicService',
  },
  {
    id: 'daily-transport',
    titleKey: 'miniApp.collections.transport.title',
    descriptionKey: 'miniApp.collections.transport.description',
    actionKey: 'miniApp.collections.transport.action',
    image: banners.transport,
    tone: 'transport',
  },
];

export const miniAppHeroBanner = banners.hero;
