import { ZeSessionBase } from "@/adapters/index.js";
import { Core } from "@/core/index.js";

export interface ZeAction {
  (core: Core, session: ZeSessionBase, args: string[]): Promise<void>;
}

export interface ZeRule {
  (core: Core, session: ZeSessionBase): Promise<boolean>;  // 返回true则通过，返回false则拦截
}