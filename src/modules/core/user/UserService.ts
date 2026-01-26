import { ZeDatabase } from "@/database/index.js";
import { User } from "./User.js";

export class UserService {
    db: ZeDatabase
    constructor(db: ZeDatabase) {
        this.db = db;
    }
    async create_user(id: string, name: string): Promise<User | null> {
        await this.db.User.create({
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

        });
        return await this.get_user(id);
    }

    async get_user(id: string): Promise<User | null> {
        const usr = await this.db.User.find(id);
        if (!usr)
            return null;
        return new User(this.db, usr);
    }
}