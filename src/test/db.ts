import { connectDatabase } from '@/database/index.js';
import dotenv from 'dotenv';

dotenv.config();
// 连接数据库
const db = await connectDatabase(process.env.URL as string);


// 用户操作
const user = await db.User.create({ id: 'user2', name: 'test', level: 1, experience: 0, coins: 0 });
const foundUser = await db.User.findById('user2');
await db.User.update('user2', { level: 2, coins: 100 });

// 配置操作
await db.Config.set('theme', 'dark');
const theme = await db.Config.get('theme');


console.log(foundUser, theme)