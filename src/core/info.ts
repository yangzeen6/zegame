import { randint } from "@/utils/random.js"

export const Info: {[key:string]: string}  = {
    "注册": "发送“注册 <角色名>”即可创建一个新的游戏角色",
    "签到": "发送“签到”即可领取每日奖励",
    "信息": "发送“信息”即可查看自身角色信息",
    "菜单": "发送“菜单”可以查看各种指令及其用法",
    "休息": "发送“休息”可花费一定时间恢复生命和体力",
    "停止休息": "发送“停止休息”即可结束休息",
    "背包": "发送“背包 [页数=1]”即可查看角色的背包物品数量",
    "商店": "发送“商店 [页数=1]”即可查看商店售卖的物品",
    "购买": "发送“购买 <物品名称> [数量=1]”即可购买指定数量的物品",
    "使用": "发送“使用 <物品名称>”即可使用物品",
}

export const ItemInfo: {[key:string]: string}  = {
    "小钱袋": "使用后随机获得8~12枚金币"

}

export function info_rand() {
    const keys = ['签到', '信息', '菜单', '休息', '停止休息', '背包', '商店', '购买', '使用'];
    const info = keys.map(key => Info[key]);
    return info[randint(0, info.length - 1)]
}