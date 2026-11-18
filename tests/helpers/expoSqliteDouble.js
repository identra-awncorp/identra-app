// A test double of the expo-sqlite async database API (the four methods the wallet repository
// calls, same names and array-parameter form) on Node's built-in node:sqlite, so the SQL the app
// ships is really executed. Records every SQL text to check that values are always bound.
const { DatabaseSync } = require('node:sqlite');

function openExpoSqliteDouble(path = ':memory:', { delayMs = 0 } = {}) {
  const db = new DatabaseSync(path);
  const sql = [];
  let active = 0;
  const stats = { maxConcurrent: 0 };
  const step = async (source, fn) => {
    sql.push(source);
    active += 1;
    stats.maxConcurrent = Math.max(stats.maxConcurrent, active);
    try {
      if (delayMs) await new Promise((resolve) => setTimeout(resolve, delayMs));
      else await Promise.resolve();
      return fn();
    } finally {
      active -= 1;
    }
  };
  const params = (p) => {
    if (!Array.isArray(p)) throw new TypeError('the double only implements the array parameter form');
    return p;
  };
  return {
    sql,
    stats,
    raw: db,
    execAsync: (source) => step(source, () => void db.exec(source)),
    runAsync: (source, p) =>
      step(source, () => {
        const r = db.prepare(source).run(...params(p));
        return { lastInsertRowId: Number(r.lastInsertRowid), changes: Number(r.changes) };
      }),
    getFirstAsync: (source, p) =>
      step(source, () => {
        const row = db.prepare(source).get(...params(p));
        return row === undefined ? null : { ...row };
      }),
    getAllAsync: (source, p) => step(source, () => db.prepare(source).all(...params(p)).map((row) => ({ ...row }))),
    close: () => db.close(),
  };
}

module.exports = { openExpoSqliteDouble };
