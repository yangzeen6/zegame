import { ZeSessionBase } from "@/adapters/index.js";
import { getDatabase } from "@/database/index.js";

export async function admin_action(session: ZeSessionBase, admin: string): Promise<boolean> {
    if (session.event.group_id && session.event.sender_id == admin && session.event.content.startsWith('/')) {
        if (session.event.content == '/游戏开启' || session.event.content == '/开启游戏') {
            await getDatabase().Config.addGroupList(session.event.group_id);
            await session.send("已开启！");
            return false;
        }
        if (session.event.content == '/游戏关闭' || session.event.content == '/关闭游戏') {
            await getDatabase().Config.removeGroupList(session.event.group_id);
            await session.send("已关闭！");
            return false;
        }
    }
    return true
}