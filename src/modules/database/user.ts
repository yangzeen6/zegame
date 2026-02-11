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
    async update(id: string, updateDoc: any) {
      // 这里直接接收完整的 MongoDB 更新文档，例如：{ $set: {...}, $unset: {...} }
      return await this.collection.updateOne({ id }, updateDoc);
    }
  }
  