import { Core } from "@/core/index.js";
import { add_action } from "../index.js";
import { ZeSessionBase } from "@/adapters/index.js";
import { User } from "@/core/user/index.js";
import { Info } from "../info/index.js";

add_action('注册', null, async (core: Core, session: ZeSessionBase, args: string[]) => {
    const usr = await core.User.get_user(session.event.sender_id)
    if (usr) {
        await session.send(`尊敬的【${usr.data.name}】，请不要重复注册！`, true)
        return
    }
    if (args.length == 0) {
        await session.send("请在“注册”后面接上您的角色名！", true, Info.注册)
        return
    }
    if (args.length > 1) {
        await session.send("注册失败！角色名不能带有空格，请使用下划线作为连字符！", true, Info.注册)
        return
    }
    const name = args[0];
    if (name.length > 12 || name.length < 2) {
        await session.send(`注册失败！角色名的长度应在2到12之间，“${name}”的长度为${name.length}`, true, Info.注册)
        return
    }
    if (!/^[\u4e00-\u9fa5a-zA-Z0-9_]+$/.test(name) || !/[\u4e00-\u9fa5a-zA-Z]/.test(name)) {
        await session.send(`注册失败！角色名只能含有中文、英文、数字、下划线，不能含有“<”“·”等特殊符号，且不能是纯数字或者下划线`, true, Info.注册)
        return
    }

    await core.User.create_user(session.event.sender_id, name);

    session.send(`恭喜【${name}】注册成功！`, true, Info.菜单);

})
