import { ZeRule } from "./types.js";
import { Info } from "./info.js";
import { get_intervals } from "@/utils/time.js";

const is_registered: ZeRule = async (user) => {
    if (!user.d.id) {
        await user.send("您好，请先【注册】！", {info: Info.注册})
        return false;
    }
    return true;
}

const is_wake: ZeRule = async (user) => {
    const time = user.d.status?.休息
    if (time) {
        const span = Date.now() - (time as Date).getTime()
        const intervals = get_intervals(span)
        await user.send(`操作失败！【${user?.d.name}】正在休息中...\n你已经休息了${intervals}，请先发送“停止休息”`)
        return false;
    }
    return true;
}



export const Rule = {
    is_registered,
    is_wake
}