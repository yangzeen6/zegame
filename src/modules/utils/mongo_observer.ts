import { ObjectId } from 'mongodb';

// 定义我们附加到对象上的特殊方法接口
interface MongoDocument {
    $save: () => Promise<void>;
    [key: string]: any;
}

/**
 * 判断是否为 MongoDB 的特殊原子类型（不需要递归代理）
 */
function isMongoAtomicValue(value: any): boolean {
  return (
    value instanceof Date || 
    value instanceof RegExp ||
    (ObjectId && value instanceof ObjectId) // 如果项目中有 ObjectId，也建议排除
  );
}

/**
 * 创建一个可被监听的 MongoDB 对象
 * @param initialData 初始数据
 * @param updateCallback 实际执行 MongoDB 更新的回调函数
 */
export function createMongoObservable<T extends object>(
  initialData: T,
  updateCallback: (updateDoc: Record<string, any>) => Promise<void>
): T & MongoDocument {
  
  // 存储被修改的路径集合 (使用 Set 自动去重)
  const modifiedPaths = new Set<string>();

  // 内部辅助函数：构建递归 Proxy
  function createProxy(target: any, pathPrefix: string = ''): any {
    return new Proxy(target, {
      // 拦截读取操作
      get(obj, prop: string | symbol, receiver) {
        // 1. 如果调用的是 $save 方法
        if (prop === '$save') {
          return async () => {
            if (modifiedPaths.size === 0) return;

            // 构建 MongoDB 的 $set 对象
            const updateDoc: Record<string, any> = {};
            
            // 遍历所有修改过的路径，从根对象获取最新值
            modifiedPaths.forEach((path) => {
              // 获取该路径对应的当前最新值
              const value = getValueByPath(initialData, path);
              updateDoc[path] = value;
            });

            // 调用外部传入的更新逻辑
            await updateCallback(updateDoc);
            
            // 清空脏路径，重置状态
            modifiedPaths.clear();
          };
        }

        const value = Reflect.get(obj, prop, receiver);

        // 2. 如果获取的值是对象（且不是 null），需要递归代理
        // 这样才能监听到 deep.nested.property 的修改
        if (typeof value === 'object' && value !== null) {
          // 【关键修改】如果是 Date 或其他原子类型，直接返回原值，不进行代理
          if (isMongoAtomicValue(value)) {
            return value;
          }

          const nextPath = pathPrefix ? `${pathPrefix}.${String(prop)}` : String(prop);
          return createProxy(value, nextPath);
        }

        return value;
      },

      // 拦截写入操作
      set(obj, prop: string | symbol, value, receiver) {
        const result = Reflect.set(obj, prop, value, receiver);
        
        // 计算当前修改的完整路径
        const currentPath = pathPrefix ? `${pathPrefix}.${String(prop)}` : String(prop);
        
        // 记录修改路径
        modifiedPaths.add(currentPath);
        
        return result;
      }
    });
  }

  return createProxy(initialData);
}

/**
 * 辅助函数：根据字符串路径（如 "a.b.c"）从对象中获取值
 */
function getValueByPath(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}