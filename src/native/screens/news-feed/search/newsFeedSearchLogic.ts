import type { NewsFeedSearchTab } from '../../../data/demo/newsFeedSearchDemoData';

export function normalizeSearchText(value: string): string {
  return value.trim().toLocaleLowerCase('vi-VN');
}

export function shouldShowNewsFeedSearchFilter(tab: NewsFeedSearchTab): boolean {
  return tab !== 'all';
}

export function getFilteredInterestSuggestions({
  limit = 8,
  query,
  selectedInterests,
  suggestions,
}: {
  limit?: number;
  query: string;
  selectedInterests: string[];
  suggestions: string[];
}): string[] {
  const normalizedQuery = normalizeSearchText(query);
  const selectedSet = new Set(selectedInterests.map(normalizeSearchText));

  return suggestions
    .filter((interest) => !selectedSet.has(normalizeSearchText(interest)))
    .filter((interest) => !normalizedQuery || normalizeSearchText(interest).includes(normalizedQuery))
    .slice(0, limit);
}

export function canAddCustomInterest({
  interest,
  selectedInterests,
  suggestions,
}: {
  interest: string;
  selectedInterests: string[];
  suggestions: string[];
}): boolean {
  const trimmedInterest = interest.trim();
  const normalizedInterest = normalizeSearchText(trimmedInterest);

  return (
    trimmedInterest.length > 1 &&
    !selectedInterests.some((item) => normalizeSearchText(item) === normalizedInterest) &&
    !suggestions.some((item) => normalizeSearchText(item) === normalizedInterest)
  );
}

export function addUniqueInterest(current: string[], interest: string): string[] {
  const trimmedInterest = interest.trim();
  if (!trimmedInterest) return current;

  return current.some((item) => normalizeSearchText(item) === normalizeSearchText(trimmedInterest))
    ? current
    : [...current, trimmedInterest];
}
