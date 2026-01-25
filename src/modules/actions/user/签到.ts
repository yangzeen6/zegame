import { Core } from "@/core/index.js";
import { add_action } from "../index.js";
import { ZeSessionBase } from "@/adapters/index.js";
import { Rule } from "../rule/index.js";
import { User } from "@/core/user/index.js";

add_action('签到', Rule.is_registered, async (core: Core, session: ZeSessionBase, args: string[]) => {
    const user = await core.User.get_user(session.event.sender_id) as User;
    await user.update_today("签到");
    const now = new Date();
    const last = user.data.date?.签到;
    if (!last || last < now && last.getDate() != now.getDate()) {
        await session.send(`签到成功！`);
        return
    } else {
        await session.send(`签到失败！你在今天的 ${last.getHours()}:${last.getMinutes()} 已经签到过了`);
        return
    }
})
