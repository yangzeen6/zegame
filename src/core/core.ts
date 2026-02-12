
import { getDatabase } from "@/database/index.js";
import { getWebSocketServer } from "@/adapters/index.js";
import { actionManager } from "./action.js";
import { admin_action } from "./admin.js";
import { UserService } from "./user.js";

const block_list: {
    [user_id: string]: boolean
} = {}
 

export async function launch(admin: string) {
    const server = getWebSocketServer();
    const db = getDatabase();
    await db.load();

    await actionManager.load_actions();

    server.register('message', async ({session, raw}) => {
        await admin_action(session, admin);

        // block的判断是为了防止刷屏
        if (block_list[session.event.sender_id])
            return;

        // 若是群聊消息则判断群聊是否开启游戏
        if (session.event.group_id && 
            !(await db.Config.checkGroupList(session.event.group_id)))
            return;
        
        // 匹配action
        const act = actionManager.match(session.event.content)
        if (!act) return;
        
        // 执行action
        block_list[session.event.sender_id] = true;
        const user = await UserService.getUser(session);
        await actionManager.call(act.action, act.args, user);
        await user.update();
        delete block_list[session.event.sender_id];
    });

    server.bind();
}
