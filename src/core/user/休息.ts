import { add_action } from "../action.js";
import { Rule } from "../rule.js";
import { Info, info_rand } from "../info.js";
import { get_intervals } from "@/utils/time.js";


add_action('休息', [Rule.is_registered, Rule.is_wake], async (user, args) => {
    user.send(`【${user.d.name}】你开始休息了，将会随时间恢复一定的生命值和体力值
具体如下：
10s内：无效
10s~30s：3~5点生命值，6~10点体力值（恢复最快）
30s~1小时：5~39点生命值，10~42点体力值（恢复较慢）
1小时以上：每小时恢复10点生命值，10点体力值（恢复最慢）
发送停止休息才会刷新状态`, {info: Info.停止休息});
    user.setStatus('休息', new Date());
})

add_action('停止休息', Rule.is_registered, async (user, args) => {
    const pre = user.getStatus('休息');
    if (pre) {
        // span < 10s 10s~30s 30s~3600s 3600s以上
        var span = Date.now() - pre.getTime();
        const s = get_intervals(span);
        span = Math.floor(span/1000);
        if (span < 10) {
            user.send(`【${user.d.name}】你醒了！总共休息了${s}，你什么也没恢复`, {info: Info.休息});
            user.setStatus('休息', null);
            return;
        } else if (span < 30) {
            var r_hp = user.recoverHP(Math.floor(span/10)+2);
            var r_sta = user.recoverSTA(Math.floor(span/5)+4);
        } else if (span < 3600) {
            var r_hp = user.recoverHP(5 + Math.floor(span/100));
            var r_sta = user.recoverSTA(10 + Math.floor(span/100));
        } else {
            var r_hp = user.recoverHP(39+Math.floor(10*(span-3600)/3600));
            var r_sta = user.recoverSTA(42+Math.floor(10*(span-3600)/3600));
        }
        user.send(`【${user.d.name}】你醒了！总共休息了${s}\n生命值：${user.d.hp}/${user.d.hp_max} (+${r_hp})\n体力值：${user.d.sta}/${user.d.sta_max} (+${r_sta})`, {info: info_rand()});
        user.setStatus('休息', null);
        return;
    } else {
        user.send(`【${user.d.name}】停止休息失败！你并没有在休息`, {info: Info.休息});
        return;
    }
})
