import { add_action } from "../action.js";
import { Rule } from "../rule.js";
import { Info, info_rand } from "../info.js";
import { randint } from "@/utils/random.js";

add_action('使用', [Rule.is_registered, Rule.is_wake], async (user, args) => {
    // 使用<物品名称> // 一次使用一个
    var item = args[0]
    if (!(user.d.backpack[item]>=1)) {
        user.send(`你没有名为“${item}”的物品`, {info: info_rand()});
        return;
    }

    user.incItem(item, -1);
    if (item == '小钱袋') {
        var n = randint(8,12);
        user.d.coins += n;
        user.send(`你使用了小钱袋，获得了${n}枚金币！`, {info: info_rand()});
    }
    
})
