export interface ZeWebSocketServer {
  register(post_type: string, handler: ZeEventHandler): void;
  init(): void;
  close(): void;
}

export interface ZeEvent {
  type: 'private' | 'group';
  sender_id: string;
  group_id: string;
  content: string;
  timestamp: number;
  msg_id?: number;
}

export interface ZeSessionBase {
  event: ZeEvent;
  send(message: string, reply?: boolean, info?: string | string[]): Promise<void>;
  input(timeoutMs?: number): Promise<ZeSessionBase | void>;   // 其实返回Promise， timeout结束将调用resolve(void)
  finish(message?: string): void;
}

export type ZeEventHandler = (ctx: {
  session: ZeSessionBase;
  raw: any;
}) => Promise<void> | void;

