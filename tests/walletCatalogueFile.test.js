// The backup catalogue writer against a fake of expo-file-system's File that behaves like the native
// code in node_modules/expo-file-system (read for both platforms):
// - move(dest, { overwrite: true }) deletes an existing destination first, then renames
//   (Android CopyMoveStrategy.LocalFile.prepareAsDestination + renameTo; iOS removeItem + moveItem);
//   without overwrite an existing destination throws; afterwards the moved object POINTS AT dest
//   (Android `uri = finalUri`, iOS `url = destinationUrl`).
// - create() throws when the file exists; delete() and text() throw when it does not.
const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const { createCatalogueFile } = require('../.tmp-test/src/native/data/wallet/catalogueFile');

const NAME = 'identra-backup-catalogue.json';

function createDisk() {
  const disk = { files: new Map(), ops: [], fail: null, short: false };
  const step = (op) => {
    disk.ops.push(op);
    if (disk.fail === disk.ops.length) throw new Error(`injected failure at ${op}`);
  };
  class File {
    constructor(name) {
      this.uri = name;
    }
    get exists() {
      return disk.files.has(this.uri);
    }
    async text() {
      step(`text ${this.uri}`);
      if (!disk.files.has(this.uri)) throw new Error('ENOENT');
      return disk.files.get(this.uri);
    }
    create() {
      step(`create ${this.uri}`);
      if (disk.files.has(this.uri)) throw new Error('file already exists');
      disk.files.set(this.uri, '');
    }
    write(content) {
      step(`write ${this.uri}`);
      disk.files.set(this.uri, disk.short ? content.slice(0, 5) : content);
    }
    delete() {
      step(`delete ${this.uri}`);
      if (!disk.files.has(this.uri)) throw new Error('ENOENT');
      disk.files.delete(this.uri);
    }
    async move(dest, options = {}) {
      step(`move ${this.uri} -> ${dest.uri}`);
      if (disk.files.has(dest.uri)) {
        if (!options.overwrite) throw new Error('DestinationAlreadyExists');
        disk.files.delete(dest.uri);
      }
      if (!disk.files.has(this.uri)) throw new Error('ENOENT');
      disk.files.set(dest.uri, disk.files.get(this.uri));
      disk.files.delete(this.uri);
      this.uri = dest.uri;
    }
  }
  disk.open = (name) => new File(name);
  return disk;
}

const list = (n) => JSON.stringify({ version: 1, items: Array.from({ length: n }, (_, i) => ({ vct: 'v', issuer: `https://i${i}.example` })) });

describe('backup catalogue file', () => {
  it('survives three writes in one session and leaves only the catalogue', async () => {
    const disk = createDisk();
    const catalogue = createCatalogueFile(disk.open, NAME);
    assert.equal(await catalogue.read(), null);
    for (const n of [1, 2, 3]) {
      await catalogue.write(list(n));
      assert.equal(await catalogue.read(), list(n), `write #${n}`);
      assert.deepEqual([...disk.files.keys()], [NAME], `write #${n}: no helper file is left`);
    }
  });

  it('never moves onto an existing file (the native move deletes it first)', async () => {
    const disk = createDisk();
    const catalogue = createCatalogueFile(disk.open, NAME);
    for (const n of [1, 2, 3]) await catalogue.write(list(n));
    const moves = disk.ops.filter((op) => op.startsWith('move'));
    assert.ok(moves.length >= 5);
    assert.equal(disk.ops.some((op) => op === `delete ${NAME}`), false, 'the catalogue itself is never deleted');
  });

  it('keeps the previous list readable when any step of a write fails, and the next write repairs it', async () => {
    // The operations of one successful write over an existing catalogue.
    const probe = createDisk();
    await createCatalogueFile(probe.open, NAME).write(list(1));
    const before = probe.ops.length;
    await createCatalogueFile(probe.open, NAME).write(list(2));
    const steps = probe.ops.slice(before);
    assert.ok(steps.length >= 6, steps.join(' | '));

    for (let i = 1; i <= steps.length; i++) {
      const disk = createDisk();
      const catalogue = createCatalogueFile(disk.open, NAME);
      await catalogue.write(list(1));
      disk.fail = disk.ops.length + i;
      const outcome = await catalogue.write(list(2)).then(() => 'ok', () => 'failed');
      disk.fail = null;
      const read = await catalogue.read();
      if (outcome === 'failed') assert.equal(read, list(1), `failure at "${steps[i - 1]}": the old list stays`);
      else assert.equal(read, list(2), `failure at "${steps[i - 1]}" after the swap: the new list is in place`);
      await catalogue.write(list(3));
      assert.equal(await catalogue.read(), list(3), `after a failure at "${steps[i - 1]}" the next write works`);
      assert.deepEqual([...disk.files.keys()], [NAME]);
    }
  });

  it('refuses a short write without touching the catalogue', async () => {
    const disk = createDisk();
    const catalogue = createCatalogueFile(disk.open, NAME);
    await catalogue.write(list(1));
    disk.short = true;
    await assert.rejects(catalogue.write(list(2)));
    disk.short = false;
    assert.equal(await catalogue.read(), list(1));
  });

  it('reads the committed previous list after a crash between the two moves', async () => {
    const disk = createDisk();
    disk.files.set(`${NAME}.prev`, list(1));
    disk.files.set(`${NAME}.next`, list(2));
    const catalogue = createCatalogueFile(disk.open, NAME);
    assert.equal(await catalogue.read(), list(1), 'the uncommitted .next is never read');
    await catalogue.write(list(3));
    assert.equal(await catalogue.read(), list(3));
    assert.deepEqual([...disk.files.keys()], [NAME]);
  });
});
