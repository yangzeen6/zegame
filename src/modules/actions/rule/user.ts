import { ZeRule } from "../types.js";
import { Info } from "../info/index.js";

export const is_registered: ZeRule = async (core, session) => {
    if (await core.User.get_user(session.event.sender_id) == null) {
        await session.send("签到失败，请先【注册】！", true, Info.注册)
        return false;
    }
    return true;
}