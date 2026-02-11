import { add_action } from "../action.js";
import { Info } from "../info.js";
import { UserService } from "../user.js";

add_action('注册', null, async (user, args) => {
    if (user.d.id) {
        user.send(`尊敬的【${user.d.name}】，请不要重复注册！`, {info:  Info.菜单});
        return;
    }
    if (args.length == 0) {
        user.send("请在“注册”后面接上您的角色名！", {info:  Info.注册});
        return;
    }
    if (args.length > 1) {
        user.send("注册失败！角色名不能带有空格，请使用下划线作为连字符！", {info:  Info.注册});
        return;
    }
    const name = args[0];
    if (name.length > 12 || name.length < 2) {
        user.send(`注册失败！角色名的长度应在2到12之间，“${name}”的长度为${name.length}`, {info:  Info.注册});
        return;
    }
    if (!/^[\u4e00-\u9fa5a-zA-Z0-9_]+$/.test(name) || !/[\u4e00-\u9fa5a-zA-Z]/.test(name)) {
        user.send(`注册失败！角色名只能含有中文、英文、数字、下划线，不能含有“<”“·”等特殊符号，且不能是纯数字或者下划线`, {info:  Info.注册});
        return;
    }

    await UserService.createUser(user.id, name);

    user.send(`恭喜【${name}】注册成功！`, {info:  Info.菜单});

})
