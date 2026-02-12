export function randint(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

    // 百分比概率 (0-100)
export function percent(chance: number): boolean {
    return Math.random() * 100 < chance;
}
    
// 从数组中随机取一个
export function arrayPick<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

// 带权重的随机索引
export function weightedIndex(weights: number[]): number {
    const total = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * total;
    
    for (let i = 0; i < weights.length; i++) {
    if (random < weights[i]) return i;
    random -= weights[i];
    }
    
    return weights.length - 1;
}

// 多次独立尝试
export function tryWithAttempts(chance: number, maxAttempts: number): boolean {
    for (let i = 0; i < maxAttempts; i++) {
    if (Math.random() < chance) return true;
    }
    return false;
}
  