import { add_action } from "../action.js";
import { Rule } from "../rule.js";
import { Info } from "../info.js";

add_action('菜单', Rule.is_registered, async (user, args) => {
    let msg = "【菜单】\n";
    var i = 0;
    for (var key in Info) {
        i++;
        msg += key + (i%2==0 ? "\n" : ' ');
    }
    user.send(msg.trim(), {info: "发送“帮助 <指令名称>”即可查看具体的指令介绍"});
})

add_action('帮助', Rule.is_registered, async (user, args) => {
    const s = args[0] || '';
    if (!Info[s]) {
        user.send(`指令【${s}】不存在`);
        return;
    }
    user.send(`${s}: ${Info[s]}`);
})