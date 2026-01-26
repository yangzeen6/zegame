import { Info } from "@/actions/info/index.js";
import { ZeSessionBase } from "@/adapters/types.js";
import { UserSchema, ZeDatabase } from "@/database/index.js";
import { set as set_obj, get as get_obj } from "lodash-es"

export class User {
    private db: ZeDatabase;
    readonly data: UserSchema;  // 要修改请使用set或inc

    constructor(db: ZeDatabase, user: UserSchema) {
        this.db = db;
        this.data = user;
    }

    // 获取属性，key为路径，如coins, status.签到
    async get(key: string, default_v: any = undefined) {
        return get_obj((await this.db.User.find(this.data.id, { key: 1 })), key, default_v);
    }

    // 设置属性，key为路径，如coins, status.签到
    async set(key: string, value: any) {
        set_obj(this.data, key, value);
        var setter = {} as any;
        setter[key] = value
        return await this.db.User.update_set(this.data.id, setter);
    }

    async set_many(setter: { [key: string]: number }) {
        for (let key in setter) {
            set_obj(this.data, key, setter[key]);
        }
        return await this.db.User.update_inc(this.data.id, setter);
    }


    // 增加数值，key为路径，如coins, backpack.石头，若value为负则代表值减少
    async inc(key: string, value: number) {
        set_obj(this.data, key, get_obj(this.data, key, 0) + value);
        return await this.db.User.update_inc(this.data.id, {
            key: value
        });
    }

    async inc_many(setter: { [key: string]: number }) {
        for (let key in setter) {
            set_obj(this.data, key, get_obj(this.data, key, 0) + setter[key]);
        }
        return await this.db.User.update_inc(this.data.id, setter);
    }

    async level_up(session?: ZeSessionBase) {
        let n = 0;
        while (this.data.exp >= this.experience_up()) {
            await this.inc('level', 1);
            n++;
        }
        if (n>0 && session) await session.send(`${this.data.name} 升级啦，${this.data.level - n}级 -> ${this.data.level}级！`, false, Info.信息);
    }

    // 查询升级所需经验
    experience_up() {
        const L = this.data.level;
        return L * 100;
    }

}