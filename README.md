## 架构：

 - src/core/
   - 一些文件夹：分类存放一些指令
   - action.ts: 指令匹配
   - admin.ts: 超级管理的指令
   - core.ts：游戏启动核心
   - index.ts: 导出core中的launch函数
   - info.ts: 一些指令的介绍（其实本来可以用json储存，这里直接硬编码了，以后再改吧）
   - rule.ts: 指令的拦截规则
   - types.ts：一些接口的定义
   - user.ts: 用户操作
 - src/modules/
   - adapters：将提供接受群聊/私聊消息的函数注册，提供发送消息的接口（目前只实现了napcat ws）
   - database: mongoodb数据库操作的接口
   - utils: 其他工具
 - src/test: 测试

要添加指令可用action.ts的add_action函数添加，新的ts文件记得在src/core/action.ts中导入一下

游戏玩法和数据操作可修改core和database

记得自己创建.env文件，写入如下内容：
```text
URL=  # 连接mongodb的地址
DB_NAME="zegame"  # mongodb数据库名称（任取即可）
HOST=127.0.0.1  # 给napcat的websocket的地址
PORT=3434  # 给napcat的websocket的端口
ADMIN=  # 在群聊中可发送“/开启游戏” “/关闭游戏”的qq号
```

关于napcat的使用，直接搜官方文档即可


模块函数化：不再传递core, db等参数，而是作为一个类似于全局变量的东西，开始时初始化一遍，之后想用的时候就直接导入


