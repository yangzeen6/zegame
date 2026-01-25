import { UserService } from "./user/index.js";
import { SystemService } from "./system/index.js";
import { ZeDatabase } from "@/database/index.js";

export class Core {
    private db: ZeDatabase;
    User;
    System;
    constructor(db: ZeDatabase) {
        this.db = db;
        this.User = new UserService(db);
        this.System = new SystemService(db);
    }

}