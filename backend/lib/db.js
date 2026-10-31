/**
 * MailFlow DB Adapter
 * Supports Supabase OR MySQL — controlled by DB_TYPE in .env
 *
 * Usage in routes:
 *   const db = require('../lib/db');
 *   const rows = await db.query('SELECT * FROM users WHERE email = ?', [email]);
 *   const row  = await db.queryOne('SELECT * FROM users WHERE id = ?', [id]);
 *   const id   = await db.insert('users', { name, email, password_hash });
 *   await db.update('users', { name }, { id });
 */

require('dotenv').config();

const DB_TYPE = process.env.DB_TYPE || 'supabase';
let adapter = null;

// ─── Supabase adapter ────────────────────────────────────────────────────────
function makeSupabaseAdapter() {
  let client = null;
  try {
    const { createClient } = require('@supabase/supabase-js');
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
      client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
      console.log('✓ Database: Supabase connected');
    } else {
      console.warn('⚠  Supabase env vars missing — demo mode (no persistence)');
    }
  } catch {
    console.warn('⚠  @supabase/supabase-js not installed — run: npm install @supabase/supabase-js');
  }

  return {
    /**
     * query(table, filters?)  — returns array of rows
     * Supabase adapter uses table name + filter object, not raw SQL
     */
    async query(table, filters = {}) {
      if (!client) return [];
      let q = client.from(table).select('*');
      for (const [col, val] of Object.entries(filters)) q = q.eq(col, val);
      const { data, error } = await q.order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data || [];
    },

    /** queryOne — returns single row or null */
    async queryOne(table, filters = {}) {
      if (!client) return null;
      let q = client.from(table).select('*');
      for (const [col, val] of Object.entries(filters)) q = q.eq(col, val);
      const { data, error } = await q.single();
      if (error && error.code !== 'PGRST116') throw new Error(error.message);
      return data || null;
    },

    /** rawQuery — runs a raw SQL string via Supabase RPC (for complex joins/counts) */
    async rawQuery(sql, params = []) {
      if (!client) return [];
      // Replace $1, $2… with actual values for the RPC call
      let i = 0;
      const formatted = sql.replace(/\?/g, () => {
        const v = params[i++];
        return typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : v;
      });
      const { data, error } = await client.rpc('run_query', { query: formatted });
      if (error) throw new Error(error.message);
      return data || [];
    },

    /** insert — inserts one row, returns inserted row */
    async insert(table, values) {
      if (!client) return { id: 'demo-' + Date.now(), ...values };
      const { data, error } = await client.from(table).insert(values).select().single();
      if (error) throw new Error(error.message);
      return data;
    },

    /** insertMany — inserts multiple rows */
    async insertMany(table, rows) {
      if (!client || !rows.length) return;
      const { error } = await client.from(table).insert(rows);
      if (error) throw new Error(error.message);
    },

    /** update — updates rows matching filters */
    async update(table, values, filters = {}) {
      if (!client) return;
      let q = client.from(table).update(values);
      for (const [col, val] of Object.entries(filters)) q = q.eq(col, val);
      const { error } = await q;
      if (error) throw new Error(error.message);
    },

    /** count — returns a number */
    async count(table, filters = {}) {
      if (!client) return 0;
      let q = client.from(table).select('*', { count: 'exact', head: true });
      for (const [col, val] of Object.entries(filters)) q = q.eq(col, val);
      const { count, error } = await q;
      if (error) throw new Error(error.message);
      return count || 0;
    },

    /** upsert */
    async upsert(table, values, onConflict) {
      if (!client) return;
      const { error } = await client.from(table).upsert(values, { onConflict });
      if (error) throw new Error(error.message);
    },

    isConnected: () => !!client,
  };
}

// ─── MySQL adapter ────────────────────────────────────────────────────────────
function makeMySQLAdapter() {
  let pool = null;
  try {
    const mysql = require('mysql2/promise');
    if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME) {
      pool = mysql.createPool({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
      });
      console.log('✓ Database: MySQL connected');
    } else {
      console.warn('⚠  MySQL env vars missing — demo mode (no persistence)');
    }
  } catch {
    console.warn('⚠  mysql2 not installed — run: npm install mysql2');
  }

  async function run(sql, params = []) {
    if (!pool) return [[]];
    return pool.query(sql, params);
  }

  return {
    async query(table, filters = {}) {
      if (!pool) return [];
      const where = Object.keys(filters);
      const sql = where.length
        ? `SELECT * FROM ${table} WHERE ${where.map(k => `${k} = ?`).join(' AND ')} ORDER BY created_at DESC`
        : `SELECT * FROM ${table} ORDER BY created_at DESC`;
      const [rows] = await run(sql, Object.values(filters));
      return rows;
    },

    async queryOne(table, filters = {}) {
      const rows = await this.query(table, filters);
      return rows[0] || null;
    },

    async rawQuery(sql, params = []) {
      if (!pool) return [];
      const [rows] = await run(sql, params);
      return rows;
    },

    async insert(table, values) {
      if (!pool) return { id: 'demo-' + Date.now(), ...values };
      const keys = Object.keys(values);
      const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`;
      const [result] = await run(sql, Object.values(values));
      const [rows] = await run(`SELECT * FROM ${table} WHERE id = ?`, [result.insertId]);
      return rows[0];
    },

    async insertMany(table, rows) {
      if (!pool || !rows.length) return;
      const keys = Object.keys(rows[0]);
      const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES ?`;
      const values = rows.map(r => Object.values(r));
      await run(sql, [values]);
    },

    async update(table, values, filters = {}) {
      if (!pool) return;
      const set    = Object.keys(values).map(k => `${k} = ?`).join(', ');
      const where  = Object.keys(filters).map(k => `${k} = ?`).join(' AND ');
      const sql    = `UPDATE ${table} SET ${set}${where ? ' WHERE ' + where : ''}`;
      await run(sql, [...Object.values(values), ...Object.values(filters)]);
    },

    async count(table, filters = {}) {
      if (!pool) return 0;
      const where = Object.keys(filters);
      const sql = where.length
        ? `SELECT COUNT(*) AS n FROM ${table} WHERE ${where.map(k => `${k} = ?`).join(' AND ')}`
        : `SELECT COUNT(*) AS n FROM ${table}`;
      const [rows] = await run(sql, Object.values(filters));
      return Number(rows[0]?.n || 0);
    },

    async upsert(table, values) {
      if (!pool) return;
      const keys = Object.keys(values);
      const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})
                   ON DUPLICATE KEY UPDATE ${keys.map(k => `${k}=VALUES(${k})`).join(', ')}`;
      await run(sql, Object.values(values));
    },

    isConnected: () => !!pool,
  };
}

// ─── Export ───────────────────────────────────────────────────────────────────
if (DB_TYPE === 'mysql') {
  adapter = makeMySQLAdapter();
} else {
  adapter = makeSupabaseAdapter();
}

module.exports = adapter;
