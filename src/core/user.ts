import { getDatabase, UserSchema } from "@/database/index.js";
import { createMongoObservable } from "@/utils/mongo_observer.js";
import { ZeSessionBase } from "@/adapters/index.js";
import { Info } from "./info.js";
import {set as obj_set, get as obj_get} from "lodash-es";

const users = new Map<string, User>(); // 暂时不用对象池，估计这个用户量也占不了多大内存，等以后再把Map改成对象池

export const UserService = {
    async createUser(id: string, name: string): Promise<void> {
        await getDatabase().User.create({
            id,
            name,
            level: 1,
            exp: 0,
            coins: 50,
            gems: 0,
            hp: 100,
            hp_max: 100,
            sta: 100,
            sta_max: 100,
            equipment: {},
            status: {},
            backpack: {},
        });
        return;
    },

    // 在最开始处建立一个users对象池，先把所有的数据查询到，这样就不需要再require了
    async getUser(session: ZeSessionBase): Promise<User> {
        if (users.has(session.event.sender_id)) return users.get(session.event.sender_id)?.refreshSession(session) as User;

        const usr = await getDatabase().User.find(session.event.sender_id);
        if (!usr)
            return new User({}, session);
        
        // 自动监听修改
        const usr_ = createMongoObservable(usr, async (setter) => {
            await getDatabase().User.update(session.event.sender_id, setter);
            return;
        })
        const user = new User(usr_, session);
        users.set(session.event.sender_id, user);
        return user;
    }
}



type SendConfig = {
    reply?: boolean,
    info?: string | string[]
}


export class User {
    id: string;
    private s: ZeSessionBase;  // session
    d: UserSchema;  // data
    // [key: string]: any;  // 临时内存储值

    constructor(usr: any & UserSchema, session: ZeSessionBase) {
        this.d = usr;
        this.id = session.event.sender_id
        this.s = session;
    }


    refreshSession(s: ZeSessionBase) {
        this.s = s;
        return this;
    }

    async send(message: string, config?: SendConfig) {
        await this.s.send(message.trim(), config?.reply || true, config?.info)
    }

    async input(timeoutMS?: number) {
        var r = await this.s.input(timeoutMS);
        if (!r) return '';
        this.s = r;
        return r.event.content;

    }

    // 增减背包物品，在inc>=0时始终返回true, 在inc<0且数量不足时返回false
    incItem(item: string, inc: number): boolean {
        var count = this.d.backpack[item];
        if (inc>=0) {
            if (!count) this.d.backpack[item] = inc;
            else this.d.backpack[item] += inc;
        } else {
            if (!count || count + inc < 0) return false;
            if (count + inc == 0) delete this.d.backpack[item];
        }
        return true;
    }

    recoverHP(v: number): number {
        const real_v = Math.min(this.d.hp_max - this.d.hp, v);
        this.d.hp += real_v;
        return real_v;
    }

    recoverSTA(v: number): number {
        const real_v = Math.min(this.d.sta_max - this.d.sta, v);
        this.d.sta += real_v;
        return real_v;
    }

    getStatus(status: string, default_v?: any) {
        return obj_get(this.d, `status.${status}`, default_v);
    }

    setStatus(status: string, value: any) {
        obj_set(this.d, `status.${status}`, value);
    }

    async levelUP() {
        let n = 0;
        while (this.d.exp >= this.expNext()) {
            this.d.level++;
            n++;
        }
        if (n>0) await this.s?.send(`${this.d.name} 升级啦，${this.d.level - n}级 -> ${this.d.level}级！`, false, Info.信息);
    }

    async update() {
        await this.d.$save();
    }

    // 查询升级所需经验
    expNext() {
        const L = this.d.level;
        return L * 100;
    }

}