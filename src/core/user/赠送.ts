import { add_action } from "../action.js";
import { Rule } from "../rule.js";
import { Info, info_rand, ItemInfo } from "../info.js";
import { User, UserService } from "../user.js";

add_action('赠送', [Rule.is_registered, Rule.is_wake], async (user, args) => {
    // 赠送 <物品名称> <对方QQ>  // 接收消息的at会自动转化为qq号
    var item = args[0];
    var qq = args[1];
    if (!(user.d.backpack[item]>=1)) {
        user.send(`你没有名为“${item}”的物品`, {info: info_rand()});
        return;
    }
    var toUser = await UserService.getUserTo(user.s, qq)
    if (!(toUser)) {
        user.send(`qq号为“${qq}”的玩家不存在或尚未注册！\n提示：真at会自动转换成qq号，你也可以手动输入对方的qq号`);
        return;
    }
    user.incItem(item, -1);
    toUser.incItem(item, 1);
    user.send(`${item} 赠送成功！`);
})