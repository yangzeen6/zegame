import { MongoClient, Db, Collection, Document } from "mongodb";
import { UserSchema } from "./types.js";

export class Database {
  private client: MongoClient;
  private db: Db;
  constructor(client: MongoClient, db_name: string) {
    this.client = client;
    this.db = this.client.db(db_name);
  }
  getCollection<T extends Document>(name: string): Collection<T> {
    return this.db.collection<T>(name);
  }

  getUserCollection(): Collection<UserSchema> {
    return this.getCollection<UserSchema>('users');
  }
  getConfigCollection(): Collection {
    return this.getCollection('config');
  }
}

export class ZeDatabase {
  User: UserDatabase;
  Config: ConfigDatabase;

  constructor(db: Database) {
      this.User = new UserDatabase(db.getUserCollection());
      this.Config = new ConfigDatabase(db.getConfigCollection());
  }
}

export const connectDatabase = async (uri: string, db_name: string) => {
  const client = new MongoClient(uri);
  await client.connect();
  return new ZeDatabase(new Database(client, db_name));
}


export class UserDatabase {
  private collection: Collection<UserSchema>;
  constructor(connection: Collection<UserSchema>) {
    this.collection = connection;
  }
  async create(user: UserSchema) {
    return await this.collection.insertOne(user);
  }
  async find(
    id: string, 
    require: any = { "weapon": 0, "date": 0, "backpack": 0 }
  ) {
    return await this.collection.findOne({ id }, require);
  }
  async update_set(id: string, setter: any) {
    return await this.collection.updateOne({ id }, { $set: setter });
  }
  async update_inc(id: string, setter: any) {
    return await this.collection.updateOne({ id }, { $inc: setter });
  }
}

export class ConfigDatabase {
  private collection: Collection;
  constructor(connection: Collection) {
    this.collection = connection;
  }
  async get(key: string, default_v: any): Promise<any> {
    return (await this.collection.findOne({ key }))?.value || default_v;
  }
  async set(key: string, value: any) {
    return await this.collection.updateOne({ key }, { $set: { value } }, { upsert: true });
  }
}
