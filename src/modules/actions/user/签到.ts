import { Core } from "@/core/index.js";
import { add_action } from "../index.js";
import { ZeSessionBase } from "@/adapters/index.js";
import { Rule } from "../rule/index.js";
import { User } from "@/core/user/index.js";
import { Info } from "../info/index.js";

add_action('签到', Rule.is_registered, async (core: Core, session: ZeSessionBase, args: string[]) => {
    const user = await core.User.get_user(session.event.sender_id) as User;
    const now = new Date();
    const pre = await user.get('status.签到');
    if (!pre || pre < now && pre.getDate() != now.getDate()) {
        await user.set("status.签到", now);
        await user.inc_many({
            'coins': 10,
            'exp': 20
        });
        await session.send(`签到成功！恭喜获得10枚金币以及20点经验值`, true, Info.信息);
        await user.level_up(session);
        return;
    } else {
        await session.send(`签到失败！您今天 ${pre.getHours()}:${pre.getMinutes()} 的时候已经签到过了`, true, Info.信息);
        return;
    }
})
