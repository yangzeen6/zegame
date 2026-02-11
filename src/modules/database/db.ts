import { Db } from "mongodb";
import { UserDb } from "./user.js";
import { ConfigDb } from "./config.js";
import { DataDb } from "./data.js";



export class ZeDatabase {
  private db;
  User: UserDb;
  Config: ConfigDb;
  Data: DataDb;

  constructor(db: Db) {
    this.db = db;
    this.User = new UserDb(db.collection('users'));
    this.Config = new ConfigDb(db.collection('config'));
    this.Data = new DataDb(db);
  }

  async load() {
    await this.Data.load();
  }
}


