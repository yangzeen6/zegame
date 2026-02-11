import { add_action } from "../action.js";
import { Rule } from "../rule.js";
import { Info } from "../info.js";

add_action('菜单', Rule.is_registered, async (user, args) => {
    const menu = ['签到', '信息', '背包', '商店', '休息', '使用']
    const info = menu.map(key => `${key}: ${Info[key]}`);
    let msg = "【菜单】\n";
    for (const line of info) {
        msg += line + "\n";
    }
    await user.send(msg.trim());
})