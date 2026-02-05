import { add_action } from "../action.js";
import { Rule } from "../rule.js";
import { Info, info_rand } from "../info.js";
import { getDatabase } from "@/database/index.js";


// const Enemy = getDatabase().Data.Enemy;

// add_action('探索', [Rule.is_registered, Rule.is_wake], async (user, args) => {
//     user.set_status('战斗', 1);
//     const enemy = Enemy.getEnemies(['zombie'])[0];
//     user.send(`你在探索的过程中遇到了一只${enemy.name}，是否开始战斗？`, { info: [
//         ' - 1：战斗',
//         ' - 2：逃跑'
//     ]});
//     while (1) {
//         const msg = await user.input();
//         if (!msg) {user.set_status('战斗', 0);return;}
//         if (msg == '1' || msg == '战斗') {
//             // 开始战斗
//             break;
//         } else if (msg == '2' || msg == '逃跑') {
//             user.send(`逃跑成功！`, { info: info_rand()});
//             user.set_status('战斗', 0);
//             return;
//         } else {
//             user.send(`请发送1或2`, {info: [
//                 ' - 1：发起战斗',
//                 ' - 2：逃跑'
//             ]});
//             continue;
//         }
//     }
//     const battle = core.Battle.createBattle(user,
//         ['attack','attack','attack','attack','attack','attack',
//         'defend','defend','defend','defend','defend','defend',],
//         ['zombie']
//     )

    
    
// })