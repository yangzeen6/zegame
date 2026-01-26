import { createWebSocketServer } from "@/adapters/napcat_ws/index.js";
const server = createWebSocketServer({host:'127.0.0.1',port:3434});

server.register('message', async ({session, raw}) => {
  const event = session.event
  if (event.type == 'group') {
    if (event.content == 'hello') {
      session.send('请发送: a');
      while (1) {
        var e = await session.input()
        if (!e) return;
        if (e.content != 'a') {
          session.send(`请发送: a, 你发送的是 ${e.content}`)
          continue;
        }
        session.send('测试成功');
        break;
      }
      

    }
  }
})
