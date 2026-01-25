import { UserSchema, ZeDatabase } from "@/database/index.js";

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
            experience: 0,
            coins: 0
        });
        return await this.get_user(id);
    }

    async get_user(id: string): Promise<User | null> {
        const usr = await this.db.User.findById(id);
        if (!usr)
            return null;
        return new User(this.db, usr);
    }
}

export class User {
    private db: ZeDatabase;
    data: UserSchema

    constructor(db: ZeDatabase, user: UserSchema) {
        this.db = db;
        this.data = user;
    }

    async update_today(key: string) {
        await this.db.User.update_setter(this.data.id, {
            "date.签到": new Date()
        })
    }
}