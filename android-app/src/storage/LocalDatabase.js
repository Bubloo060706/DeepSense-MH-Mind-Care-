import SQLite from "react-native-sqlite-storage";

/**
 * LocalDatabase.js
 *
 * Lightweight SQLite wrapper using react-native-sqlite-storage.
 * Provides insert, query, count, exists, deleteOldest operations
 * for all sensor reading types and risk score storage.
 *
 * All data stays on device until explicitly synced by BackendClient.
 * This is the core of the privacy-preserving architecture.
 */

SQLite.enablePromise(true);

const DB_NAME    = "depression_detection.db";
const DB_VERSION = "1.0";

class LocalDatabase {
  constructor() {
    this.db = null;
  }

  async init() {
    try {
      this.db = await SQLite.openDatabase({
        name:     DB_NAME,
        location: "default",
      });
      await this._createTables();
      console.log("[LocalDatabase] Initialized");
    } catch (err) {
      console.error("[LocalDatabase] Init failed:", err);
    }
  }

  async _createTables() {
    const queries = [
      `CREATE TABLE IF NOT EXISTS sensor_readings (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        type        TEXT NOT NULL,
        data        TEXT NOT NULL,
        timestamp   TEXT NOT NULL,
        synced      INTEGER DEFAULT 0
      )`,
      `CREATE TABLE IF NOT EXISTS risk_scores (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        score        REAL NOT NULL,
        window_start TEXT NOT NULL,
        window_end   TEXT NOT NULL,
        features     TEXT,
        is_high_risk INTEGER DEFAULT 0,
        synced       INTEGER DEFAULT 0,
        timestamp    TEXT NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS idx_sensor_type      ON sensor_readings(type)`,
      `CREATE INDEX IF NOT EXISTS idx_sensor_timestamp ON sensor_readings(timestamp)`,
      `CREATE INDEX IF NOT EXISTS idx_score_timestamp  ON risk_scores(timestamp)`,
    ];

    for (const query of queries) {
      await this.db.executeSql(query);
    }
  }

  // --- Insert ---
  async insert(table, data) {
    if (!this.db) await this.init();

    if (table === "sensor_readings") {
      const { type, timestamp, ...rest } = data;
      const ts = timestamp || new Date().toISOString();
      await this.db.executeSql(
        `INSERT INTO sensor_readings (type, data, timestamp) VALUES (?, ?, ?)`,
        [type, JSON.stringify(rest), ts]
      );
    } else if (table === "risk_scores") {
      const { score, window_start, window_end, features, is_high_risk, timestamp } = data;
      await this.db.executeSql(
        `INSERT INTO risk_scores
           (score, window_start, window_end, features, is_high_risk, timestamp)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          score,
          window_start,
          window_end,
          JSON.stringify(features || []),
          is_high_risk ? 1 : 0,
          timestamp || new Date().toISOString(),
        ]
      );
    }
  }

  // --- Query ---
  async query(table, filters = {}) {
    if (!this.db) await this.init();

    let sql    = `SELECT * FROM ${table} WHERE 1=1`;
    const args = [];

    if (table === "sensor_readings" && filters.type) {
      sql += " AND type = ?";
      args.push(filters.type);
    }
    if (filters.since) {
      sql += " AND timestamp >= ?";
      args.push(filters.since);
    }
    if (filters.until) {
      sql += " AND timestamp <= ?";
      args.push(filters.until);
    }

    sql += " ORDER BY timestamp ASC";

    const [result] = await this.db.executeSql(sql, args);
    const rows = [];

    for (let i = 0; i < result.rows.length; i++) {
      const row = result.rows.item(i);
      if (table === "sensor_readings") {
        rows.push({
          ...JSON.parse(row.data),
          type:      row.type,
          timestamp: row.timestamp,
          id:        row.id,
        });
      } else {
        rows.push({
          ...row,
          features:     JSON.parse(row.features || "[]"),
          is_high_risk: row.is_high_risk === 1,
        });
      }
    }

    return rows;
  }

  // --- Count ---
  async count(table, filters = {}) {
    if (!this.db) await this.init();

    let sql    = `SELECT COUNT(*) as cnt FROM ${table} WHERE 1=1`;
    const args = [];

    if (filters.type) {
      sql += " AND type = ?";
      args.push(filters.type);
    }

    const [result] = await this.db.executeSql(sql, args);
    return result.rows.item(0).cnt;
  }

  // --- Exists ---
  async exists(table, filters = {}) {
    const count = await this.count(table, filters);
    return count > 0;
  }

  // --- Delete oldest N rows ---
  async deleteOldest(table, filters = {}, n = 100) {
    if (!this.db) await this.init();

    let sql    = `DELETE FROM ${table} WHERE id IN (
                   SELECT id FROM ${table} WHERE 1=1`;
    const args = [];

    if (filters.type) {
      sql += " AND type = ?";
      args.push(filters.type);
    }

    sql += ` ORDER BY timestamp ASC LIMIT ?)`;
    args.push(n);

    await this.db.executeSql(sql, args);
  }

  // --- Clear all data (for testing / user reset) ---
  async clearAll() {
    if (!this.db) await this.init();
    await this.db.executeSql("DELETE FROM sensor_readings");
    await this.db.executeSql("DELETE FROM risk_scores");
    console.log("[LocalDatabase] All data cleared");
  }
}

export default new LocalDatabase();