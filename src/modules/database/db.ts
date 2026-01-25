import { MongoClient, Db, Collection, Document } from "mongodb";
import { UserSchema } from "./types.js";

export class Database {
  private client: MongoClient;
  private db: Db;
  constructor(client: MongoClient) {
    this.client = client;
    this.db = this.client.db('zegame');
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

export const connectDatabase = async (uri: string) => {
  const client = new MongoClient(uri);
  await client.connect();
  return new ZeDatabase(new Database(client));
}


export class UserDatabase {
  private collection: Collection<UserSchema>;
  constructor(connection: Collection<UserSchema>) {
    this.collection = connection;
  }
  async create(user: UserSchema) {
    return await this.collection.insertOne(user);
  }
  async findById(id: string) {
    return await this.collection.findOne({ id });
  }
  async update(id: string, user: Partial<UserSchema>) {
    return await this.collection.updateOne({ id }, { $set: user });
  }
  async update_setter(id: string, setter: {}) {
    return await this.collection.updateOne({ id }, { $set: setter });
  }
  async update_inc(id: string, user: Partial<Pick<UserSchema, 'level' | 'experience' | 'coins'>>) {
    return await this.collection.updateOne({ id }, { $inc: user });
  }
}

export class ConfigDatabase {
  private collection: Collection;
  constructor(connection: Collection) {
    this.collection = connection;
  }
  async get(key: string): Promise<any> {
    return (await this.collection.findOne({ key }))?.value;
  }
  async set(key: string, value: any) {
    return await this.collection.updateOne({ key }, { $set: { value } }, { upsert: true });
  }
}
