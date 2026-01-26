import { Core } from "@/core/index.js";
import { add_action } from "../index.js";
import { ZeSessionBase } from "@/adapters/index.js";
import { Rule } from "../rule/index.js";
import { User } from "@/core/user/index.js";

add_action('信息', Rule.is_registered, async (core: Core, session: ZeSessionBase, args: string[]) => {
    const user = await core.User.get_user(session.event.sender_id) as User;
    var msg = `${user.data.name}\n等级：${user.data.level}\n经验：${user.data.exp}/${user.experience_up()}\n`;
    msg += `金币：${user.data.coins}\n`;
    msg += `宝石：${user.data.gems}\n`;
    msg += `生命值：${user.data.hp}/${user.data.hp_max}\n`;
    msg += `体力值：${user.data.sta}/${user.data.sta_max}`;
    await session.send(msg);
})
