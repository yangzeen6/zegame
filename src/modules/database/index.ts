/**
 * 数据库模块
 * 提供 MongoDB 连接和操作接口
 */

import { ZeDatabase } from './db.js';
import { MongoClient } from 'mongodb';

export { ZeDatabase } from './db.js';

// 导出类型
export type { UserSchema } from './types.js';


let db: ZeDatabase | null = null;

export const connectDatabase = async (uri: string, db_name: string) => {
    if (db) throw new Error("Database already connected");
    const client = new MongoClient(uri);
    await client.connect();
    db = new ZeDatabase(client.db(db_name));
    return db;
}

export function getDatabase(): ZeDatabase {
    if (!db) throw new Error("Database not connected");
    return db;
}
