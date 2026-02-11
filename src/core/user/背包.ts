import { add_action } from "../action.js";
import { Rule } from "../rule.js";
import { info_rand } from "../info.js";
import { pages } from "@/utils/page.js";

// 单页的条数
const eachpage = 10;

add_action('背包', Rule.is_registered, async (user, args) => {
    // 背包[页数=1]
    // TODO: 查询<物品名称> - 查看物品的介绍，同时查看自己背包中该物品的数量。可考虑模糊搜索功能

    var page = parseInt(args[0]);
    if (isNaN(page) || page < 1) page = 1;

    const s = pages(user.d.backpack, page, eachpage, (k, n)=>`${k} : ${n}`);

    const msg = `${user.d.name} 的背包：\n${s}`;

    user.send(msg, {info: info_rand()});
})
