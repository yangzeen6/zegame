import { WebSocketServer, WebSocket, RawData } from "ws";
import type {
  ZeEvent,
  ZeSessionBase,
  ZeEventHandler,
} from "@/adapters/types.js";

type PendingWait = {
  resolve: (value: ZeEvent | void) => void;
  timer?: NodeJS.Timeout;
};


class PendingManager {
    readonly pendingByUser = new Map<string, PendingWait[]>();

    constructor() {}

    clearPending(userId: string): void { 
        const list = this.pendingByUser.get(userId) ?? [];
        for (let i = 0;i<list.length;i++) {
            list[i].resolve();
        }
        this.pendingByUser.delete(userId);
      }
    
      addPending(userId: string, pending: PendingWait): void { 
        const list = this.pendingByUser.get(userId) ?? [];
        list.push(pending);
        this.pendingByUser.set(userId, list);
      }
    
      resolvePending(userId: string, event: ZeEvent): boolean {
        const list = this.pendingByUser.get(userId);
        if (!list || list.length === 0) return false;
        const pending = list.shift();
        if (pending) {
          if (pending.timer) clearTimeout(pending.timer);
          pending.resolve(event);
          
        }
        if (list && list.length === 0) {
          this.pendingByUser.delete(userId);
        } else if (list) {
          this.pendingByUser.set(userId, list);
        }
        return !!pending;
      }
}


export class ZeSessionNapcat implements ZeSessionBase {
  public readonly event: ZeEvent;
  private readonly ws: WebSocket;
  private readonly pending: PendingManager;

  constructor(params: {
    ws: WebSocket;
    event: ZeEvent;
    pending: PendingManager;
  }) {
    this.ws = params.ws;
    this.event = params.event;
    this.pending = params.pending;
  }

  async send(message: string, reply: boolean = true, info?: string | string[]): Promise<void> {
    if (reply) message = `[CQ:reply,id=${this.event.msg_id}] ${message}`
    if (info) {
      if (typeof info === 'string')
        message = `${message}\n${info}`;
      else {
        for (let each of info) {
          message = `${message}\n${each}`;
        }
      }
    }
    let payload: any = {
        params: {
            message: message
        }
    }
    if (this.event.type == 'group') {
      payload.action = 'send_group_msg'
      payload.params.group_id = parseInt(this.event.group_id);
    } else {
      payload.action = 'send_private_msg'
      payload.params.user_id = parseInt(this.event.sender_id);
    }
    return new Promise((resolve)=>{
        console.debug("SEND: ", JSON.stringify(payload))
        
        this.ws.send(JSON.stringify(payload), ()=>{
            resolve(undefined);
        });
    });
  }

  async input(timeoutMs?: number): Promise<ZeEvent | void> {
    const timeout = timeoutMs;
    return new Promise<ZeEvent | void>((resolve) => {
      const pending: PendingWait = { resolve };
      if (timeout && timeout > 0) {
        pending.timer = setTimeout(() => {
          resolve();
        }, timeout);
      }
      this.pending.addPending(this.event.sender_id, pending);
    });
  }

  finish(message?: string) {
    if (message) this.send(message);
    this.pending.clearPending(this.event.sender_id);
  }

}


export class ZeWebSocketServer {
  private readonly wss: WebSocketServer;
  private readonly handlers = new Map<string, ZeEventHandler>();
  private readonly pending = new PendingManager();

  constructor(options: WebSocket.ServerOptions) {
    this.wss = new WebSocketServer(options);
    console.log("Server started. ", options)
    this.bindEvents();
  }

  close(): void {
    this.wss.close();
  }

  register(post_type: string, handler: ZeEventHandler): void {
    this.handlers.set(post_type, handler);
  }

  private bindEvents(): void {
    this.wss.on("connection", (ws: WebSocket) => {
      console.log("Client connected")
      ws.on("message", (data: RawData) => {
        this.handleMessage(ws, data.toString()).catch((err) => {
          console.error("[ws] handle message error:", err);
        });
      });

      ws.on("close", () => {
        console.log("Client connected")
        for (const [user_id, pendings] of this.pending.pendingByUser) {
            for (let i = 0;i<pendings.length;i++) {
                pendings[i].resolve();
            }
        }

      });
    });
  }

  

  private async handleMessage(ws: WebSocket, raw: string): Promise<void> {
    const request = this.safeParse(raw);
    if (!request) return;

    console.debug("RECEIVE: ", raw)

    // 接下来要处理napcat发过来的一大串又臭又长的data，将其转化为ZeEvent的格式
    var handler = this.handlers.get(request.post_type);
    if (!handler)
        return

    var e: ZeEvent;
    if (request.post_type == 'message') {
        e = {
            type: request.message_type,
            group_id: request.group_id?.toString(),
            sender_id: request.user_id.toString(),
            content: request.raw_message,
            timestamp: request.time,
            msg_id: request.message_id
        };

        const resolved = this.pending.resolvePending(e.sender_id, e);
        if (resolved) return;

    } else {
        e = {
            type: request.sub_type,
            group_id: request.group_id?.toString(),
            sender_id: request.user_id?.toString(),
            content: request.raw_info,
            timestamp: request.time,
        };
    }

    const session = new ZeSessionNapcat({
        ws,
        event: e,
        pending: this.pending,
      });
      await handler({ session, raw: request });

  }

  private safeParse(input: string): any | null {
    try {
      return JSON.parse(input);
    } catch (err) {
      console.warn("[ws] failed to parse JSON:", err);
      return null;
    }
  }
}

export function createWebSocketServer(options: WebSocket.ServerOptions): ZeWebSocketServer {
  return new ZeWebSocketServer(options);
}
