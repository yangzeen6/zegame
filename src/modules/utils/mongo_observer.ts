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
 * @param updateCallback 实际执行 MongoDB 更新的回调函数（接收完整的 update 文档，如 { $set, $unset }）
 */
export function createMongoObservable<T extends object>(
  initialData: T,
  updateCallback: (updateDoc: Record<string, any>) => Promise<void>
): T & MongoDocument {
  
  // 存储被修改和被删除的路径集合 (使用 Set 自动去重)
  const modifiedPaths = new Set<string>();
  const deletedPaths = new Set<string>();

  // 移除与当前路径相关的（自身、父级或子级）路径，避免产生冲突
  function removeRelatedPaths(pathSet: Set<string>, basePath: string) {
    const toDelete: string[] = [];
    pathSet.forEach((p) => {
      if (
        p === basePath ||
        p.startsWith(basePath + '.') ||
        basePath.startsWith(p + '.')
      ) {
        toDelete.push(p);
      }
    });
    toDelete.forEach((p) => pathSet.delete(p));
  }

  // 过滤掉有子路径的父路径，避免 MongoDB 更新冲突
  function filterRedundantPaths(paths: Set<string>): string[] {
    const pathsArray = Array.from(paths);
    return pathsArray.filter((path) => {
      return !pathsArray.some((otherPath) => {
        // 如果 otherPath 是 path 的子路径（例如 path='status', otherPath='status.签到'）
        return otherPath !== path && otherPath.startsWith(path + '.');
      });
    });
  }

  // 内部辅助函数：构建递归 Proxy
  function createProxy(target: any, pathPrefix: string = ''): any {
    return new Proxy(target, {
      // 拦截读取操作
      get(obj, prop: string | symbol, receiver) {
        // 1. 如果调用的是 $save 方法
        if (prop === '$save') {
          return async () => {
            if (modifiedPaths.size === 0 && deletedPaths.size === 0) return;

            const setDoc: Record<string, any> = {};
            const unsetDoc: Record<string, any> = {};
            const updateDoc: Record<string, any> = {};

            const filteredSetPaths = filterRedundantPaths(modifiedPaths);
            const filteredUnsetPaths = filterRedundantPaths(deletedPaths);

            // 遍历过滤后的路径，从根对象获取最新值，构建 $set
            filteredSetPaths.forEach((path) => {
              const value = getValueByPath(initialData, path);
              setDoc[path] = value;
            });

            // 构建 $unset
            filteredUnsetPaths.forEach((path) => {
              unsetDoc[path] = true;
            });

            if (Object.keys(setDoc).length > 0) {
              updateDoc['$set'] = setDoc;
            }
            if (Object.keys(unsetDoc).length > 0) {
              updateDoc['$unset'] = unsetDoc;
            }

            // 没有有效更新，直接返回
            if (Object.keys(updateDoc).length === 0) {
              modifiedPaths.clear();
              deletedPaths.clear();
              return;
            }

            // 调用外部传入的更新逻辑
            await updateCallback(updateDoc);
            
            // 清空脏路径，重置状态
            modifiedPaths.clear();
            deletedPaths.clear();
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
        
        // 该路径被重新赋值，移除与之相关的删除记录，并记录修改
        removeRelatedPaths(deletedPaths, currentPath);
        modifiedPaths.add(currentPath);
        
        return result;
      },

      // 拦截删除操作（delete obj.prop）
      deleteProperty(obj, prop: string | symbol) {
        const result = Reflect.deleteProperty(obj, prop);

        const currentPath = pathPrefix ? `${pathPrefix}.${String(prop)}` : String(prop);

        // 删除优先，移除与之相关的修改记录，并记录删除路径
        removeRelatedPaths(modifiedPaths, currentPath);
        deletedPaths.add(currentPath);

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