import { Collection } from "mongodb";

export class ConfigDb {
    private collection: Collection;
    private group_list: string[] | null = null;
  
  
    constructor(connection: Collection) {
      this.collection = connection;
    }
    async get(key: string, default_v?: any): Promise<any> {
      return (await this.collection.findOne({ key }))?.value || default_v;
    }
    async set(key: string, value: any) {
      return await this.collection.updateOne({ key }, { $set: { value } }, { upsert: true });
    }
  
    async group_list_check(group_id: string) {
        if (this.group_list == null)
            this.group_list = await this.get('group_list', []) as string[]
        return this.group_list.includes(group_id)
    }
  
    async group_list_add(group_id: string) {
        if (await this.group_list_check(group_id)) return;
        this.group_list?.push(group_id)
        this.set('group_list', this.group_list)
    }
  
    async group_list_remove(group_id: string) {
        if (this.group_list == null)
            this.group_list = await this.get('group_list', []) as string[]
        this.group_list = this.group_list.filter(v => v != group_id);
        this.set('group_list', this.group_list)
    }
  }