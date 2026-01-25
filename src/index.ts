import { createWebSocketServer } from "@/adapters/napcat_wss/index.js";
import { Core } from "@/core/index.js";
import { connectDatabase } from "@/database/index.js";
import { ActionManager } from "@/actions/index.js";
import dotenv from 'dotenv';

dotenv.config();

// 创建websocket服务器，由napcat连接
const server = createWebSocketServer({host:process.env.HOST, port:+(process.env.PORT||3434)});

// 连接mongodb数据库
const url = process.env.URL as string;
const db = await connectDatabase(url);

// 初始化游戏核心
const core = new Core(db);

// 初始化指令列表
const actionManager = new ActionManager(core, process.env.ADMIN as string);
await actionManager.init();

// 监听napcat发来的post_type为message的消息
server.register('message', async ({session, raw}) => {
    // 匹配指令
    await actionManager.match(session)
})