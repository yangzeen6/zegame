import { ZeSessionBase } from "@/adapters/index.js";
import { Core } from "@/core/index.js";
import { cqcode_process } from "@/utils/cqcode.js";
import { ZeAction, ZeRule } from "./types.js";

type ActionCon = {
    rule: ZeRule | null;
    action: ZeAction;
}

const actions = new Map<string, ActionCon>();

export function add_action(action_name: string, rule: ZeRule | null, action: ZeAction) {
    actions.set(action_name, {rule, action});
}

export class ActionManager {
    private core: Core;
    private admin: string;
    constructor(core: Core, admin: string) {
        this.core = core;
        this.admin = admin;
    }
    async init() {
        await import('./user/注册.js');
        await import('./user/签到.js');
        await import('./user/信息.js');
    }
    async match(session: ZeSessionBase) {
        if (session.event.group_id && session.event.sender_id == this.admin && session.event.content.startsWith('/')) {
            if (session.event.content == '/游戏开启') {
                await this.core.System.group_list_add(session.event.group_id)
                await session.send("已开启！")
                return
            }
            if (session.event.content == '/游戏关闭') {
                await this.core.System.group_list_remove(session.event.group_id)
                await session.send("已关闭！")
                return
            }
        }

        if (!session.event.group_id || await this.core.System.group_list_check(session.event.group_id)) {
            const msg = cqcode_process(session.event.content).trim().split(' ')
            if (msg.length == 0) return;
            const action_name = msg[0];
            const args = msg.length > 1 ? msg.slice(1) : [];
            const action = actions.get(action_name);
            if (action) {
                if (action.rule)
                    if(!await action.rule(this.core, session))
                        return;
                await action.action(this.core, session, args);
            }
        }
    }
}

