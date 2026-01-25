/**
 * 数据库模块
 * 提供 MongoDB 连接和操作接口
 */

export { ZeDatabase, Database, UserDatabase, ConfigDatabase } from './db.js';

// 导出连接函数
export { connectDatabase } from './db.js';

// 导出类型
export type { UserSchema } from './types.js';
