import { Collection } from "mongodb";

export class ConfigDb {
    private collection: Collection;
    private group_list: string[] | null = null;
    private group_status: Map<string, any> | null = null;
  
  
    constructor(connection: Collection) {
      this.collection = connection;
    }
    async get(key: string, default_v?: any): Promise<any> {
      return (await this.collection.findOne({ key }))?.value || default_v;
    }
    async set(key: string, value: any) {
      return await this.collection.updateOne({ key }, { $set: { value } }, { upsert: true });
    }

    async getGroupStatus(group_id: string, key: string, default_v?: any): Promise<any> {
      if (this.group_status == null)
          this.group_status = new Map(Object.entries(await this.get('group_status', {})));
      return this.group_status.get(group_id)[key] || default_v;
    }
    async setGroupStatus(group_id: string, key: string, value: any) {
      if (this.group_status == null)
        this.group_status = new Map(Object.entries(await this.get('group_status', {})));
      this.group_status.get(group_id)[key] = value;
      this.set(`group_status.${group_id}.${key}`, value);
    }
  
    async checkGroupList(group_id: string) {
        if (this.group_list == null)
            this.group_list = await this.get('group_list', []) as string[]
        return this.group_list.includes(group_id)
    }
  
    async addGroupList(group_id: string) {
        if (await this.checkGroupList(group_id)) return;
        this.group_list?.push(group_id)
        this.set('group_list', this.group_list)
    }
  
    async removeGroupList(group_id: string) {
        if (this.group_list == null)
            this.group_list = await this.get('group_list', []) as string[]
        this.group_list = this.group_list.filter(v => v != group_id);
        this.set('group_list', this.group_list)
    }
  }