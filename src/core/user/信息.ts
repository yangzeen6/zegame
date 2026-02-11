import { add_action } from "../action.js";
import { Rule } from "../rule.js";
import { info_rand } from "../info.js";

add_action('信息', Rule.is_registered, async (user, args) => {
    const msg = `${user.d.name}
等级：${user.d.level}
经验：${user.d.exp}/${user.expNext()}
金币：${user.d.coins}
宝石：${user.d.gems}
生命值：${user.d.hp}/${user.d.hp_max}
体力值：${user.d.sta}/${user.d.sta_max}
`;
    user.send(msg, {info: info_rand()});
})
