export function unstableSort<T>(
    arr: T[],
    compareFn: (a: T, b: T) => number
  ): T[] {
    return arr
      .map((value, index) => ({ value, index, random: Math.random() })) // 添加随机字段
      .sort((a, b) => {
        // 先按比较函数排序
        const cmp = compareFn(a.value, b.value);
        if (cmp !== 0) return cmp;
        // 值相同时，按随机数排序，打破稳定性
        return a.random - b.random;
      })
      .map(item => item.value);
  }