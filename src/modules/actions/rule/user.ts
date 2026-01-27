import { ZeRule } from "../types.js";
import { Info } from "../info/index.js";
import { get_intervals } from "@/utils/time.js";

export const is_registered: ZeRule = async (core, session) => {
    if (await core.User.get_user(session.event.sender_id) == null) {
        await session.send("您好，请先【注册】！", true, Info.注册)
        return false;
    }
    return true;
}

export const is_wake: ZeRule = async (core, session) => {
    const usr = await core.User.get_user(session.event.sender_id)
    const time = await usr?.get('status.休息')
    if (time) {
        const span = Date.now() - (time as Date).getTime()
        const intervals = get_intervals(span)
        await session.send(`操作失败！【${usr?.data.name}】正在休息中...\n你已经休息了${intervals}，请先【停止休息】`, true, Info.停止休息)
        return false;
    }
    return true;
}