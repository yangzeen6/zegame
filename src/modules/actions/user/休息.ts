import { Core } from "@/core/index.js";
import { add_action } from "../index.js";
import { ZeSessionBase } from "@/adapters/index.js";
import { Rule } from "../rule/index.js";
import { User } from "@/core/user/index.js";
import { Info, info_rand } from "../info/index.js";

add_action('停止休息', Rule.is_registered, async (core: Core, session: ZeSessionBase, args: string[]) => {
    const user = await core.User.get_user(session.event.sender_id) as User;
    const pre = (await user.get('status.休息')) as Date;
    if (pre) {
        // span/1000 < 10s 无效 10s~60s 60s~3600s 3600s以上
        const span = Date.now() - pre.getTime();
        

        await user.inc_many({
            'coins': 10,
            'exp': 20
        });
        await session.send(``, true, info_rand());
        await user.level_up(session);
        return;
    } else {
        await session.send(`【${user.data.name}】停止休息失败！您并没有在休息`, true, Info.休息);
        return;
    }
})
