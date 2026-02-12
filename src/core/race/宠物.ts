import { add_action } from "../action.js";
import { Rule } from "../rule.js";
import { Info } from "../info.js";
import { randint } from "@/utils/random.js";

var bot_index = 10;

export function getRandPet(): Pet {
    bot_index += randint(2,7);
    if (bot_index >= 100) bot_index = 10;
    return {
        name: `bot_${bot_index}`,
        emoji: emojis[bot_index % 12],
        exp: 0,
        level: 1,
    }
}

export type Pet = {
    name: string,
    emoji: string,
    suffix?: string,  // 💨|💦
    exp: number,
    level: number,
}

const emojis = [
    '🐀','🐄','🐇','🐈','🐒','🐏','🐖','🐘','🐓','🦆','🐢','🐍'
]

add_action('领养', [Rule.is_registered, Rule.is_wake], async (user, args) => {
    const pets = user.d.pets  // underfined || Pet[]
    if (pets && pets.length>=1) {
        user.send(`目前只能领养一只宠物哦~ 你已经有【${pets[0].emoji}${pets[0].name}】了`)
        return;
    }
    await user.send(`请选择你想领养的宠物\n${emojis.map((item, i) => `${i + 1}. ${item}`).join('\n')}\n > 直接发送数字来确定你选择的宠物...`);
    var r = 0;
    while(1) {
        r = parseInt(await user.input()); // 1~12
        if (isNaN(r) || !emojis[r-1]) {
            await user.send(`请从1到${emojis.length}选择发送一个数字作为你的宠物选择，不要发送其他内容！`)
            continue;
        }
        break;
    }
    r-=1; // 0~11
    await user.send(`你选择了${emojis[r]}作为你的宠物，现在请给ta取个名字吧！（仅限中文、英文、数字和下划线哦~）\n > 请直接发送你想给宠物取的名字...`)
    
    var name;
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

    await user.send(`你要领养的宠物是：【${emojis[r]}${name}】\n确定领养吗？发送“确定”则领养成功，发送“取消”则可以重新发送“领养”并重新选择...`)
    
    while(1) {
        var ans = await user.input();
        if (ans == '取消') {
            await user.send(`已取消此次领养，如需再次领养请重新发送“领养”`);
            return;
        } else if (ans == '确定') {
            user.d.pets = [{
                name: name,
                emoji: emojis[r],
                exp: 0,
                level: 1,
            }]
            user.send(`领养成功！发送“宠物”即可查看自己拥有的宠物信息`);
            break;
        }
        await user.send(`请发送“确定”或“取消”`);
    }
})

add_action('宠物', Rule.is_registered, async (user, args) => {
    const pets = user.d.pets  // underfined || Pet[]
    if (!pets || pets.length==0) {
        user.send(`你还没有宠物哦~ 发送“领养”来获得一只宠物吧！`)
        return;
    }
    
    var index = parseInt(args[0]);
    if (isNaN(index) || index < 1) index = 1;
    if (index > pets.length) index = pets.length;
    index -= 1;

    const msg = `【${pets[index].emoji}${pets[index].name}】
> 等级：${pets[index].level}
> 经验：${pets[index].exp}/${petExpNext(pets[index].level)}
宠物列表 ${index+1}/${pets.length}
`;
    user.send(msg);
})

export function petExpNext(L: number) {
    return L*50 + L*L*10;
}
