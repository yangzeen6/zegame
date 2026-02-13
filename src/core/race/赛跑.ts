import { add_action } from "../action.js";
import { Rule } from "../rule.js";
import { Info } from "../info.js";
import { ZeSessionBase } from "@/adapters/types.js";
import { User } from "../user.js";
import { getDatabase } from "@/database/index.js";
import { Pet, getRandPet, petExpNext } from "./宠物.js";
import { sleep } from "@/utils/time.js";
import { randint, weightedIndex } from "@/utils/random.js";
import { ZeRule } from "../types.js";
import { unstableSort } from "@/utils/sort.js";

const Config = getDatabase().Config
const races: Map<string, Race> = new Map();

class Player {
    index: number;
    user: User;
    pet: Pet;
    bot: boolean;
    distance = 40;
    buff = 0;
    constructor(user: User, pet: Pet, bot: boolean, index: number) {
        this.user = user;
        this.pet = pet
        this.bot = bot;
        this.index = index;
    }

    getSuffixText() {
        if (this.pet.suffix) {
            if (this.pet.suffix == '💨') return '冲刺了！'
            if (this.pet.suffix == '💦') return '累了...'
            if (this.pet.suffix == '🍌') return '踩香蕉皮滑倒啦...'
            if (this.pet.suffix == '🥤') return '喝饮料后感觉很有动力！'
        }
    }
}

class Race {
    s: ZeSessionBase;
    group: string;
    host: string;
    is_started: boolean = false;
    players: Player[] = [];
    winners: Player[] = [];

    constructor(s: ZeSessionBase) {
        this.s = s;
        this.group = s.event.group_id;
        this.host = s.event.sender_id;
    }

    // distance越小，下标越小
    getPlayerByDistance(): Player[] {
        return unstableSort<Player>(this.players, (a,b)=>a.distance-b.distance);
    }

    getPlayer(user_id: string) {
        for (var p of this.players) {
            if (p.user.id == user_id) {
                return p;
            }
        }
    }

    async addBot(user: User, pet: Pet) {
        this.players.push(new Player(user, pet, true, this.players.length));
    }

    async addPlayer(user: User): Promise<boolean> {
        const pets = user.d.pets  // underfined || Pet[]
        if (!pets || pets.length==0) {
            user.send(`你还没有宠物哦~ 发送“领养”来获得一只宠物吧！`)
            return false;
        }
        // if (pets.length>1) r=0; else
        await user.send(`请选择你的宠物：\n${pets.map((pet: Pet, i: number) => `${i + 1}.【${pet.emoji}${pet.name}】`).join('\n')}\n直接发送数字以进行选择...`)
        var r = 0;
        while(1) {
            r = parseInt(await user.input()); // 1~12
            if (isNaN(r) || !pets[r-1]) {
                await user.send(`请从1到${pets.length}选择发送一个数字作为你的宠物选择，不要发送其他内容！`)
                continue;
            }
            break;
        }
        if (this.players.length >= 5) {
            user.send(`加入失败！当前群聊正在进行一场宠物赛跑哦~ 请等待本场比赛结束再开始下一场吧！或者也可以在其他群聊中新开一场哦~`)
            return false;
        }
        this.players.push(new Player(user, pets[r-1], false, this.players.length));
        return true
    }

    display() {
        var s = this.players.map(p => p.distance <0 ? `${p.pet.emoji}${p.pet.suffix || ''}` : `|${' '.repeat(p.distance)}${p.pet.emoji}${p.pet.suffix || ''}`).join('\n');
        for (var p of this.players) {
            if (p.pet.suffix) {
                s+=`\n${p.index + 1}号【${p.pet.emoji}${p.pet.name}】${p.getSuffixText()}`
                if (p.buff == 1) {
                    p.buff = 0;
                    p.pet.suffix = '💦'
                } else if (p.buff == 2){
                    p.buff = 3;
                    p.pet.suffix = '💨'
                } else if (p.buff == 3){
                    var d = p.distance - this.getPlayerByDistance()[1].distance
                    //  为超前第二名5点且距离终点只剩不到20点 或 超前第二名8点
                    if ((p.distance <= 20 && d <= -5) || d<=-8) {
                        p.buff = 0;
                        delete p.pet.suffix;
                    }
                } else {
                    delete p.pet.suffix;
                }
            }
        }
        return s;
    }

    calc() {
        for(var p of this.players) {
            if (!p.pet.suffix) {
                var r = weightedIndex([70,15,15])
                if (r == 0) {
                    p.distance -= randint(1,3);
                } else if (r == 1) {
                    p.pet.suffix = '💨'
                    p.distance -= randint(4,5);
                } else {
                    p.pet.suffix = '💦'
                    // distance -= 0
                }
            } else {
                if (p.buff == 2) {
                    p.distance -= 4
                } else if (p.buff == 3) {
                    p.distance -= randint(4,5);
                }
            }
            if (p.distance<=0) {
                p.distance = -1;
                for (var w of this.winners) {
                    if (w.pet.suffix == '💨' && p.pet.suffix != '💨') {
                        p.distance = 0;
                    }
                }
                if (p.distance = -1) this.winners.push(p);
            }
        }
    }

    async run() {
        while(1) {
            await sleep(randint(2500,2800));
            this.calc();
            await this.s.send(this.display(), false);
            if (this.winners.length>0) break;
        }
        races.delete(this.group);
        await sleep(1000);
        await this.s.send(`恭喜${this.winners.map((p: Player) => `${p.index + 1}号【${p.pet.emoji}${p.pet.name}${p.bot?'':`@${p.user.d.name}`}】`).join('，')}${this.winners.length > 1 ? '并列': ''}取得宠物赛跑冠军🏆！`, false)
        var msg = ''
        await sleep(1000);
        for (var w of this.winners) {
            if (!w.bot) {
                var coins = randint(15,20);
                var exp = randint(10,15);
                w.user.d.coins+= coins;
                w.pet.exp += exp;
                msg += `@${w.user.d.name} 获得了${coins}枚金币，其宠物【${w.pet.emoji}${w.pet.name}】获得了${exp}点经验值`
                if (w.pet.exp >= petExpNext(w.pet.level)) {
                    w.pet.level++;
                    msg+=`（升级啦！${w.pet.level-1}->${w.pet.level}级）`
                }
                msg+='\n'; 
                w.user.update();
            }
        }
        this.s.send(msg.trim(), false)
    }

    async checkStart() {
        if (this.players.length == 5) {
            this.is_started = true;
            await sleep(1000);
            await this.s.send(`宠物赛跑正式开始！\n${this.players.map((p: Player) => `${p.index + 1}号【${p.pet.emoji}${p.pet.name}${p.bot?'':`@${p.user.d.name}`}】`).join('\n')}`, false)
            await sleep(1000);
            this.run();
        }
    }

    
}

const is_racing: ZeRule = async (user) => {
    const group = user.s.event.group_id;
    if (!group) {
        return false;
    }

    const pets = user.d.pets  // underfined || Pet[]
    if (!pets || pets.length==0) {
        user.send(`你还没有宠物哦~ 发送“领养”来获得一只宠物吧！`)
        return false;
    }

    const race = races.get(group)
    if (!race) {
        user.send(`当前群聊未进行宠物赛跑哦~ 请发送“赛跑”来开启一场新的比赛！`)
        return false;
    }
    return true
}

add_action('香蕉皮', [Rule.is_registered, Rule.is_wake, is_racing], async (user, args) => {
    const race = races.get(user.s.event.group_id) as Race
    
    if (!(user.d.backpack['香蕉皮']>=1)) {
        user.send(`你没有名为“香蕉皮”的物品`, {info: Info.商店});
        return;
    }
    user.incItem('香蕉皮', -1);

    if (randint(1,100) <= 70) {
        const p = race.getPlayerByDistance()[0];
        p.pet.suffix = '🍌';
        p.buff = 1;
        user.send(`使用成功！香蕉皮扔中了${p.index+1}号【${p.pet.emoji}${p.pet.name}】`);
    } else {
        user.send(`使用失败！香蕉皮没扔中哦~`)
    }
    
})

add_action('饮料', [Rule.is_registered, Rule.is_wake, is_racing], async (user, args) => {
    const race = races.get(user.s.event.group_id) as Race
    const p = race.getPlayer(user.id)
    if (!p) {
        user.send(`你没有参加宠物赛跑哦~，请等待本场比赛结束再开始下一场吧！或者也可以在其他群聊中新开一场哦~`)
        return;
    }
    if (!(user.d.backpack['饮料']>=1)) {
        user.send(`你没有名为“饮料”的物品`, {info: Info.商店});
        return;
    }
    user.incItem('饮料', -1);

    p.pet.suffix = '🥤'
    p.buff = 2;
    user.send(`使用成功！${p.index+1}号【${p.pet.emoji}${p.pet.name}】喝了饮料！`);
    
})


add_action('赛跑', [Rule.is_registered, Rule.is_wake], async (user, args) => {
    const group = user.s.event.group_id;
    if (!group) {
        user.send("请在至少两个人的群聊中发起宠物赛跑")
        return;
    }

    const pets = user.d.pets  // underfined || Pet[]
    if (!pets || pets.length==0) {
        user.send(`你还没有宠物哦~ 发送“领养”来获得一只宠物吧！`)
        return;
    }
    const r = races.get(group)
    if (r) {
        if (r.is_started) {
            user.send(`当前群聊的宠物赛跑已经开始了哦~ 请等待本场比赛结束再开始下一场吧！或者也可以在其他群聊中新开一场哦~`)
        } else {
            user.send(`当前群聊正在进行一场宠物赛跑哦~ 发送“加入”即可选择宠物参加比赛`)
        }
        
        return;
    }

    const race = new Race(user.s);
    races.set(group, race);
    if(await race.addPlayer(user)) {
        await user.send(`成功在当前群聊发起一场宠物赛跑！满5人赛跑自动开始，等待群友加入中...
提示：各位群友可发送“加入”来选择宠物参加本场宠物赛跑。若没有群友在线，你也可以发送“添加人机”来补足空位开始游戏。\n当前人数：${race.players.length}/5`)
        race.checkStart();
    }
})

add_action('加入', [Rule.is_registered, Rule.is_wake], async (user, args) => {
    const group = user.s.event.group_id;
    if (!group) {
        return;
    }

    const pets = user.d.pets  // underfined || Pet[]
    if (!pets || pets.length==0) {
        user.send(`你还没有宠物哦~ 发送“领养”来获得一只宠物吧！`)
        return;
    }

    const race = races.get(group)
    if (!race) {
        user.send(`当前群聊未进行宠物赛跑哦~ 请发送“赛跑”来开启一场新的比赛！`)
        return;
    }

    if (race.players.length >= 5) {
        user.send(`加入失败！当前群聊正在进行一场宠物赛跑哦~ 请等待本场比赛结束再开始下一场吧！或者也可以在其他群聊中新开一场哦~`)
        return;
    }

    if (race.getPlayer(user.id)) {
        user.send(`你已经加入了当前比赛，请等待其他群友加入或者发送“添加人机”快速开始！当前人数：${race.players.length}/5`)
        return;
    }

    if (await race.addPlayer(user)) {
        await user.send(`加入成功！当前人数：${race.players.length}/5`)
        race.checkStart();
    }
})

add_action('添加人机', [Rule.is_registered, Rule.is_wake], async (user, args) => {
    const group = user.s.event.group_id;
    if (!group) {
        return;
    }

    const race = races.get(group)
    if (!race) {
        user.send(`当前群聊未进行宠物赛跑哦~ 请发送“赛跑”来开启一场新的比赛！`);
        return;
    }

    if (race.players.length >= 5) {
        user.send(`添加失败！当前群聊正在进行一场宠物赛跑哦~ 请等待本场比赛结束再开始下一场吧！或者也可以在其他群聊中新开一场哦~`)
        return;
    }

    const bot = getRandPet()
    race.addBot(user, bot);
    await user.send(`添加人机【${bot.emoji}${bot.name}】成功！当前人数：${race.players.length}/5`);
    race.checkStart();
})