import { User } from "./user.js";

export interface ZeAction {
  (user: User, args: string[]): Promise<void>;
}

export interface ZeRule {
  (user: User): Promise<boolean>;  // 返回true则通过，返回false则拦截
}