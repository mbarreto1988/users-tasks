import sql, { ConnectionPool, config as SqlConfig } from 'mssql';

import { env } from '../config';

export class Database {
  private static instance: Database;
  private pool: ConnectionPool | null = null;

  private constructor() {}

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  async connect(): Promise<ConnectionPool> {
    if (this.pool && this.pool.connected) return this.pool;

    const config: SqlConfig = {
      server: env.DB_HOST,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
      port: env.DB_PORT,
      options: {
        encrypt: env.DB_ENCRYPT,
        trustServerCertificate: env.DB_TRUST_SERVER_CERT
      },
      pool: {
        min: env.DB_POOL_MIN,
        max: env.DB_POOL_MAX,
        idleTimeoutMillis: env.DB_POOL_IDLE
      }
    };

    try {
      this.pool = await sql.connect(config);
      console.log(`[DB] Conected to ${env.DB_NAME} en ${env.DB_HOST}`);
      this.pool.on('error', (err) => {
        console.error('[DB] Pool connection error:', err);
        this.pool = null;
      });
      return this.pool;
    } catch (error) {
      console.error('[DB] Error connecting:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.close();
      console.log('[DB] Connection properly closed');
      this.pool = null;
    }
  }
}
