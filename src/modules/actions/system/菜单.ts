import { Core } from "@/core/index.js";
import { add_action } from "../index.js";
import { is_registered } from "../rule/user.js";
import { Info } from "../info/index.js";

add_action('菜单', is_registered, async (core, session, args) => {
    const menu = ['签到', '信息', '探索', '休息']
    const info = menu.map(key => Info[key]);
    let msg = "【菜单】\n";
    for (const line of info) {
        msg += line + "\n";
    }
    await session.send(msg.trim());
})