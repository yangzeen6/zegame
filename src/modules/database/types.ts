
/**
 * 用户信息接口
 */
export interface UserSchema {
  id: string; // 用户ID
  name: string; // 用户名
  level: number; // 等级
  experience: number; // 经验值
  coins: number; // 金币
  date?: {
    [key: string]: Date
  };
}
