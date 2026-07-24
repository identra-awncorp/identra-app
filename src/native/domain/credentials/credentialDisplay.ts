export function formatDidForDisplay(did: string, compact: boolean): string {
  if (!compact || did.length <= 24) {
    return did;
  }

  return `${did.slice(0, 15)}…${did.slice(-7)}`;
}
