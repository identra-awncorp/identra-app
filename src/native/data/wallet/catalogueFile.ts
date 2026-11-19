import type { CatalogueFile } from '../../domain/wallet/walletContainer';

/**
 * The expo-file-system `File` members used here. Native semantics (Android FileSystemPath.move /
 * CopyMoveStrategy.LocalFile, iOS FileSystemPath.move): `move(dest, { overwrite: true })` DELETES an
 * existing destination before it renames, and afterwards the moved object points at `dest`. So a
 * File object is never reused after a move, and nothing is moved onto an existing file.
 */
export interface CatalogueFileEntry<Self> {
  readonly exists: boolean;
  text(): Promise<string>;
  create(): void;
  write(content: string): void;
  delete(): void;
  move(destination: Self): Promise<void>;
}

/**
 * The backup catalogue as `<name>` with two helpers beside it: `<name>.next` (being written, never
 * read) and `<name>.prev` (the committed previous list while the swap runs). Every write: write and
 * verify `.next`, move the current file to `.prev`, move `.next` into place, drop `.prev`. Any failure
 * or crash leaves the previous list readable: read() falls back to `.prev` while `<name>` is missing.
 */
export function createCatalogueFile<F extends CatalogueFileEntry<F>>(open: (name: string) => F, name: string): CatalogueFile {
  // Fresh objects for every step: a moved File object points at its destination afterwards.
  const current = () => open(name);
  const previous = () => open(`${name}.prev`);
  const next = () => open(`${name}.next`);
  return {
    async read() {
      const file = current();
      if (file.exists) return file.text();
      const prev = previous();
      return prev.exists ? prev.text() : null;
    },
    async write(text) {
      const staged = next();
      if (staged.exists) staged.delete();
      staged.create();
      staged.write(text);
      // A short or failed write must never replace a good list.
      const written = await next().text();
      if (written !== text) throw new Error('catalogue write did not verify');
      JSON.parse(written);

      if (current().exists) {
        // `.prev` is stale while the current file exists (a previous write finished).
        if (previous().exists) previous().delete();
        await current().move(previous());
      }
      // Here only `.prev` (or nothing, on a first write) holds the committed list.
      await next().move(current());
      try {
        if (previous().exists) previous().delete();
      } catch {
        // The new list is in place; a stale `.prev` is replaced by the next write.
      }
    },
  };
}
