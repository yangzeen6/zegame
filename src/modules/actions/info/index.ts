import { randint } from "@/utils/random.js"

export const Info: {[key:string]: string}  = {
    "注册": " - 注册：发送“注册 <角色名>”即可创建一个新的游戏角色",
    "签到": " - 签到：发送“签到”即可领取每日奖励",
    "信息": " - 信息：发送“信息”即可查看自身角色信息",
    "探索": " - 探索：发送“探索”即可开始游戏",
    "菜单": " - 菜单：发送“菜单”可以查看各种指令及其用法",
    "休息": " - 休息：发送“休息”可花费一定时间恢复生命和体力",
    "停止休息": " - 停止休息：发送“停止休息”即可结束休息"
}

export function info_rand() {
    const keys = ['签到', '信息', '探索', '菜单', '休息', '停止休息'];
    const info = keys.map(key => Info[key]);
    return info[randint(0, info.length - 1)]
}