import { Collection } from "mongodb";
import { UserSchema } from "./types.js";

export class UserDb {
    private collection: Collection<UserSchema>;
    constructor(connection: Collection<UserSchema>) {
      this.collection = connection;
    }
    async create(user: UserSchema) {
      return await this.collection.insertOne(user);
    }
    async find(
      id: string, 
    ) {
      return await this.collection.findOne({ id });
    }
    async update_set(id: string, setter: any) {
      return await this.collection.updateOne({ id }, { $set: setter });
    }
  }
  