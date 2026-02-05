import { WebSocket } from "ws";
import { ZeWebSocketServer } from "./napcat_ws/server.js";

export { ZeWebSocketServer } from "./napcat_ws/server.js";

export type {
  ZeEvent,
  ZeSessionBase,
  ZeEventHandler,
} from "./types.js";

let server: ZeWebSocketServer | null = null;

export function createWebSocketServer(options: WebSocket.ServerOptions): ZeWebSocketServer {
  if (server) throw new Error("WebSocket server already created");
  server =  new ZeWebSocketServer(options);
  return server;
}

export function getWebSocketServer(): ZeWebSocketServer {
  if (!server) throw new Error("WebSocket server not created");
  return server;
}
