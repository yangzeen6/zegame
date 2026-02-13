import { add_action } from "../action.js";
import { Rule } from "../rule.js";
import { Info, info_rand, ItemInfo } from "../info.js";
import { randint } from "@/utils/random.js";
import { User, UserService } from "../user.js";
import { Pet } from "../race/宠物.js";

const ItemUsing = {
    '小钱袋': (user, item) => {
        user.incItem(item, -1)
        var n = randint(8,12);
        user.d.coins += n;
        user.send(`你使用了小钱袋，获得了${n}枚金币！`, {info: info_rand()});
        return;
    },

    '改名卡': async (user, item) => {
        user.send(`你使用了改名卡，现在请直接发送你要修改的新名称...`)
        var name = await user.input()
        if (name.includes(' ')) {
            user.send("修改失败！角色名不能带有空格，请使用下划线作为连字符！\n你可以重新发送“使用 改名卡”");
            return;
        }
        if (name.length > 12 || name.length < 2) {
            user.send(`修改失败！角色名的长度应在2到12之间，“${name}”的长度为${name.length}\n你可以重新发送“使用 改名卡”`);
            return;
        }
        if (!/^[\u4e00-\u9fa5a-zA-Z0-9_]+$/.test(name) || !/[\u4e00-\u9fa5a-zA-Z]/.test(name)) {
            user.send(`修改失败！角色名只能含有中文、英文、数字、下划线，不能含有“<”“·”等特殊符号，且不能是纯数字或者下划线\n你可以重新发送“使用 改名卡”`);
            return;
        }
        if (await UserService.checkName(name)) {
            user.send(`修改失败！角色名【${name}】已存在，换个名字吧！\n你可以重新发送“使用 改名卡”`);
            return;
        }
        await user.send(`你的新名字为【${name}】，确定修改吗？回复“确定”将消耗改名卡并修改为新名字，回复“取消”则放弃修改并可重新使用改名卡`)
        while(1) {
            var ans = await user.input();
            if (ans == '取消') {
                await user.send(`你取消了改名，若需重新改名请再次发送“使用 改名卡”`);
                return;
            } else if (ans == '确定') {
                user.d.name = name
                user.incItem(item, -1)
                user.send(`改名成功！发送“信息”即可查看自己角色的新名称`);
                break;
            }
            await user.send(`请发送“确定”或“取消”`);
        }
        return;
    },

    '宠物改名卡': async (user, item) => {
        const pets = user.d.pets as Pet[];
        if (!pets || pets.length==0) {
            user.send(`你还没有宠物哦~ 发送“领养”来获得一只宠物吧！`)
            return;
        }
        await user.send(`请选择你要改名的宠物：\n${pets.map((pet: Pet, i: number) => `${i + 1}.【${pet.emoji}${pet.name}】`).join('\n')}\n直接发送数字以进行选择...`)
        var r = 0;
        while(1) {
            r = parseInt(await user.input());
            if (isNaN(r) || !pets[r-1]) {
                await user.send(`请从1到${pets.length}选择发送一个数字作为你要改名的宠物选择，不要发送其他内容！`)
                continue;
            }
            break;
        }
        const pet = pets[r-1]
        await user.send(`你选择了${r}.【${pet.emoji}${pet.name}】，现在，请输入宠物的新名字...`)
        var name = '';
        while(1) {
            name = await user.input();
            if (name.length > 10 || name.length < 2) {
                await user.send(`宠物名的长度应在2到10之间，“${name}”的长度为${name.length}\n请重新发送你想给宠物取的名字...`);
                continue
            }
            if (!/^[\u4e00-\u9fa5a-zA-Z0-9_]+$/.test(name) || !/[\u4e00-\u9fa5a-zA-Z]/.test(name)) {
                await user.send(`宠物名只能含有中文、英文、数字和下划线，不能含有“<”,“·”以及空格等符号，且不能是纯数字或者下划线\n请重新发送你想给宠物取的名字...`);
                continue
            }
            break;
        }
        await user.send(`该宠物的新名字为【${name}】，确定修改吗？回复“确定”将消耗宠物改名卡并修改为新名字，回复“取消”则放弃修改并可重新使用宠物改名卡`)
        while(1) {
            var ans = await user.input();
            if (ans == '取消') {
                await user.send(`你取消了改名，若需重新改名请再次发送“使用 宠物改名卡”`);
                return;
            } else if (ans == '确定') {
                pet.name = name;
                user.incItem(item, -1)
                user.send(`改名成功！发送“宠物 ${r}”即可查看自己宠物的新名称`);
                break;
            }
            await user.send(`请发送“确定”或“取消”`);
        }
        return;

    }

} as Record<string, (user: User, item: string)=>void>


add_action('查询', [Rule.is_registered], async (user, args) => {
    // 查询<物品名称> // 可查看物品的介绍，以及玩家拥有的数量
    var item = args[0]
    var info = ItemInfo[item]
    if (!info) {
        user.send(`不存在名为“${item}”的物品`);
        return;
    }
    user.send(`${item}\n${info}\n你的背包中 ${item} : ${user.d.backpack[item] || 0}`, {info: info_rand()});
})



add_action('使用', [Rule.is_registered, Rule.is_wake], async (user, args) => {
    // 使用<物品名称> // 一次使用一个
    var item = args[0]
    if (!(user.d.backpack[item]>=1)) {
        user.send(`你没有名为“${item}”的物品`, {info: info_rand()});
        return;
    }

    const using = ItemUsing[item]

    if (using) { 
        using(user, item)
    } else {
        user.send(`该物品无法直接使用哦！请发送“查询 ${item}”获取详细信息`)
    }
})
