## 架构：

 - src/actions: 指令列表
 - src/adapters：将提供接受群聊/私聊消息的函数注册，提供发送消息的接口（目前只实现了napcat ws）
 - src/core: 游戏核心
 - src/database: mongoodb数据库操作的接口
 - src/utils: 其他工具

要添加指令可在actions中添加，记得在src/actions/index.ts中导入一下

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


