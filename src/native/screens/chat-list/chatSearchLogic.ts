type PersonSearchItem = {
  handle: string;
  name: string;
};

type MiniAppSearchItem = {
  category: string;
  description: string;
  name: string;
};

export function normalizeSearchQuery(query: string): string {
  return query.trim().toLocaleLowerCase('vi-VN');
}

export function filterChatSearchPeople<T extends PersonSearchItem>(items: T[], query: string): T[] {
  const normalizedQuery = normalizeSearchQuery(query);
  if (!normalizedQuery) return items;

  return items.filter((item) =>
    `${item.name} ${item.handle}`.toLocaleLowerCase('vi-VN').includes(normalizedQuery),
  );
}

export function filterChatSearchMiniApps<T extends MiniAppSearchItem>(items: T[], query: string): T[] {
  const normalizedQuery = normalizeSearchQuery(query);
  if (!normalizedQuery) return items;

  return items.filter((item) =>
    `${item.name} ${item.category} ${item.description}`.toLocaleLowerCase('vi-VN').includes(normalizedQuery),
  );
}
