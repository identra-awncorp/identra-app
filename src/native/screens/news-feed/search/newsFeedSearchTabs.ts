import type { I18nKey } from '../../../i18n';
import type { NewsFeedSearchTab } from '../../../data/demo/newsFeedSearchDemoData';

export const newsFeedSearchTabs: Array<{ key: NewsFeedSearchTab; labelKey: I18nKey }> = [
  { key: 'all', labelKey: 'newsFeedSearch.tabs.all' },
  { key: 'trends', labelKey: 'newsFeedSearch.tabs.trends' },
  { key: 'accounts', labelKey: 'newsFeedSearch.tabs.accounts' },
  { key: 'groups', labelKey: 'newsFeedSearch.tabs.groups' },
  { key: 'miniApps', labelKey: 'newsFeedSearch.tabs.miniApps' },
];
