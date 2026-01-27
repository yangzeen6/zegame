import { ZeDatabase } from "@/database/index.js";

export class SystemService {
    private db: ZeDatabase;
    private group_list: string[] | null = null;
    Config;

    constructor(db: ZeDatabase) {
        this.db = db;
        this.Config = db.Config;
    }

    async group_list_check(group_id: string) {
        if (this.group_list == null)
            this.group_list = (await this.Config.get('group_list')) as string[] || []
        return this.group_list.includes(group_id)
    }

    async group_list_add(group_id: string) {
        if (await this.group_list_check(group_id)) return;
        this.group_list?.push(group_id)
        this.Config.set('group_list', this.group_list)
    }

    async group_list_remove(group_id: string) {
        if (this.group_list == null)
            this.group_list = (await this.Config.get('group_list')) as string[] || []
        this.group_list = this.group_list.filter(v => v != group_id);
        this.Config.set('group_list', this.group_list)
    }
}