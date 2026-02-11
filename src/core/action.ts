import { cqcode_process } from "@/utils/cqcode.js";
import { ZeAction, ZeRule } from "./types.js";
import { User } from "./user.js";

type ActionCon = {
    rule: ZeRule | ZeRule[] | null;
    action: ZeAction;
}

const actions = new Map<string, ActionCon>();

export function add_action(action_name: string, rule: ZeRule | ZeRule[] | null, action: ZeAction) {
    actions.set(action_name, {rule, action});
}

export const actionManager = {
    async load_actions() {
        await Promise.all([
            import('./system/菜单.js'),

            import('./user/休息.js'),
            import('./user/信息.js'),
            import('./user/商店.js'),
            import('./user/注册.js'),
            import('./user/物品.js'),
            import('./user/签到.js'),
            import('./user/背包.js'),
        ])
    },

    match(msg: string): {action: ActionCon, args: string[]} | void {
        const pieces = cqcode_process(msg).trim().split(' ')
        if (pieces.length == 0) return;
        const action_name = pieces[0];
        const action = actions.get(action_name);
        if (!action) return;
        const args = pieces.length > 1 ? pieces.slice(1) : [];
        return {
            action,
            args
        }
    },

    async call(action: ActionCon, args: string[], user: User) {
        if (action.rule) {
            const rules = Array.isArray(action.rule) ? action.rule : [action.rule]
            for (const rule of rules) {
                if(!await rule(user))
                    return;
            } 
        }
        await action.action(user, args);
    }
}

