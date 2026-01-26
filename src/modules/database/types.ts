
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
  backpack?: {
    [key: string]: number
  };
  status?: {
    [key: string]: any
  }
}
