import { add_action } from "../action.js";
import { Rule } from "../rule.js";
import { Info } from "../info.js";

add_action('签到', Rule.is_registered, async (user, args) => {
    const now = new Date();
    const pre = user.get_status('签到') as Date;
    if (!pre || pre < now && pre.getDate() != now.getDate()) {
        user.set_status('签到', now)
        user.d.coins += 10;
        user.d.exp += 20;
        user.send(`签到成功！恭喜获得10枚金币以及20点经验值`, {info: Info.信息});
        await user.level_up();
        return;
    } else {
        user.send(`签到失败！您今天 ${pre.getHours()}:${pre.getMinutes()} 的时候已经签到过了，明天再来吧`, {info: Info.信息});
        return;
    }
})
