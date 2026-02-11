
/**
 * 用户信息接口
 */
export interface UserSchema {
  id: string; // 用户ID
  name: string; // 用户名
  level: number; // 等级
  exp: number; // 经验值
  coins: number; // 金币
  gems: number;  // 宝石
  hp: number; // 当前生命
  hp_max: number; // 生命上限
  sta: number; // 当前体力
  sta_max: number;  // 体力上线
  equipment: {
    weapon?: any;
    armor?: any;
  };
  backpack: {
    [key: string]: number;
  };
  status: {
    [key: string]: any;
  };
  [key: string]: any;
}

export type EnemyAction = {
  intent: string;  // attack/block/buff/debuff/special
  effects: any[];
  word: string;  // 台词与动作：如 嗷呜~【嚎叫】/ 也可只加动作 如【暗影突袭】
}

export interface EnemySchema {
  id: string;  // 英文id
  name: string;  // 中文名称
  hp_max: number;  // 生命值（在Core的战斗系统中分为hp和hp_max）
  behavior: {
    type: 'pattern' | 'random' | 'adaptive';
    action: {
      [id: string]: EnemyAction[]  // 一般只有一个action，则数组长度为1
    }
    pattern?: string[]  // 若type为pattern则按这个id数组的顺序依次执行action
    random?: { [id: string]: number}  // 若type为random则按这个加权随机执行
  };
  word: string;  // 开场白
  description: string;  // 查询时的描述
}
export interface CardSchema {
  id: string;  // 英文id
  name: string;  // 中文名称
  type: string;  // attack/skill/power /status/curse(不能被打出)
  cost: number;  // 1,2,3
  target: string; // enemy/self/none
  effects: any[];
  description: string;  // 查询时的描述，可以变量替换 {damage} {block} 
}
