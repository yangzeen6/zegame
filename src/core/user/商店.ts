import { add_action } from "../action.js";
import { Rule } from "../rule.js";
import { Info, info_rand } from "../info.js";
import { pages } from "@/utils/page.js";

// 这个其实也可以储存在json中
const shop = {
    '小钱袋': {'coins': 10},
    '改名卡': {'coins': 100},  // 玩家名称不能重复，宠物名称可以重复
    '宠物改名卡': {'coins': 35},
    '宝石样本': {'gems': 1}
} as {[key: string]: any}

function getPrice(item: string): string {
    var s='';
    if(shop[item].gems) s+= `${shop[item].gems}宝石`;
    if(shop[item].coins) s+= `${shop[item].coins}金币`;
    return s;
}


add_action('商店', Rule.is_registered, async (user, args) => {
    // 商店[页数=1]

    var page = parseInt(args[0]);
    if (isNaN(page) || page < 1) page = 1;

    const s = pages(shop, page, 7, (k,v)=>` > ${k} : ${getPrice(k)}`)

    user.send(`欢迎来到小卖铺\n${s}\n您的金币：${user.d.coins} 宝石：${user.d.gems}`, {info: Info.购买});

})

add_action('购买', [Rule.is_registered, Rule.is_wake], async (user, args) => {
    // 购买<物品名称> [数量=1]
    var item = args[0];
    if (!(item in shop)) {
        user.send(`购买失败！不存在名为“${item}”的物品`, {info: Info.购买});
        return;
    }
    var price = shop[item];
    var num = parseInt(args[1]);
    if (isNaN(num)) num = 1;
    if (num < 1) {
        user.send(`购买失败！不可购买数量为“${num}”的物品`, {info: Info.购买});
        return;
    }
    if ((price.coins && user.d.coins < price.coins*num) || (price.gems && user.d.gems < price.gems*num)) {
        user.send(`购买失败！你太穷了`, {info: info_rand()});
        return;
    }

    for(var i=0;i<num;i++) {
        user.d.coins -= price.coins || 0;
        user.d.gems -= price.gems || 0;
    }
    user.incItem(item, num);
    user.send(`购买成功！背包：${item} +${num}\n剩余金币：${user.d.coins} 宝石：${user.d.gems}`, {info: Info.使用})

})
