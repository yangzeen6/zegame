import { Collection, Db } from "mongodb";
import { CardSchema, EnemySchema } from "./types.js";

export class DataDb {
    Enemy;
    Card;

    constructor(db: Db) {
        this.Enemy = new EnemyData(db.collection('data_enemies'))
        this.Card = new CardData(db.collection('data_cards'))
    }

    async load() {
        await Promise.all([
            this.Enemy.load(),
            this.Card.load()
        ])
    }
}

export class EnemyData {
    private collection: Collection<EnemySchema>;
    private data: Map<string, EnemySchema>;  // id: enemy
    constructor(connection: Collection<EnemySchema>) {
      this.collection = connection;
      this.data = new Map();
    }
  
    async load(): Promise<void> {
      const cursor = this.collection.find();
      for await (const doc of cursor) {
        this.data.set(doc.id, doc)
      }
  
      if (!this.data.has('zombie')) {
        this.data.set('zombie', {
          id: 'zombie',  // 英文id
          name: '僵尸',  // 中文名称
          hp_max: 35,
          behavior: {
            type: 'random',
            action: {
              'tear': [{
                intent: 'attack',
                effects: [{
                  type: 'damage',
                  base_value: 4,
                  hits: 1
                }],
                word: '【撕扯】'
              }],
              'bite': [{
                intent: 'attack',
                effects: [{
                  type: 'damage',
                  base_value: 7,
                  hits: 1
                }],
                word: '【咬碎】'
              }],
              'defend': [{
                intent: 'block',
                effects: [{
                  type: 'block',
                  base_value: 7,
                  hits: 1
                }],
                word: '【血肉之墙】'
              }]
            },
            random: {
              'tear': 0.4,
              'bite': 0.2,
              'defend': 0.4
            },
          },
          word: '【嘶吼】',
          description: '这是僵尸的描述'
        })
      }
  
    }
  
    get(id: string) {
      const d = JSON.parse(JSON.stringify(this.data.get(id))) as EnemySchema;
      if (!d) throw Error(`未找到id为${id}的enemy`);
      return d;
    }

    getMany(ids: string[]) {
        
    }

  }


  export class CardData {
    private collection: Collection<CardSchema>;
    private data: Map<string, CardSchema>;  // id: enemy
    constructor(connection: Collection<CardSchema>) {
      this.collection = connection;
      this.data = new Map();
    }
  
    async load(): Promise<void> {
      const cursor = this.collection.find();
      for await (const doc of cursor) {
        this.data.set(doc.id, doc)
      }
  
      if (!this.data.has('strike')) {
        this.data.set('strike', {
          id: 'strike',  // 英文id
          name: '打击',  // 中文名称
          type: 'attack',  // attack/skill/power /status/curse(不能被打出)
          cost: 1,  // 1,2,3
          target: 'enemy', // enemy/self/none
          effects: [
            {
              type: "damage",
              base_value: 6,
              hits: 1
            }
          ],
          description: '造成6点伤害'
        })
      }
  
      if (!this.data.has('defend')) {
        this.data.set('defend', {
          id: 'defend',  // 英文id
          name: '防御',  // 中文名称
          type: 'skill',  // attack/skill/power /status/curse(不能被打出)
          cost: 1,  // 1,2,3
          target: 'self', // enemy/self/none
          effects: [
            {
              type: "block",
              base_value: 5,
            }
          ],
          description: '获得5点格挡'
        })
      }
      
  
    }
    
  
    get(id: string) {
      const d = JSON.parse(JSON.stringify(this.data.get(id))) as CardSchema;
      if (!d) throw Error(`未找到id为${id}的card`);
      return d;
    }
  }
  