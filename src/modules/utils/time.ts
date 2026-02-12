export function get_intervals(timestampInterval: number) {
    // 忽略毫秒，转换为秒
    const totalSeconds = Math.floor(timestampInterval / 1000);
    
    // 计算小时、分钟和秒
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    // 严格按规则格式化：要么显示秒，要么显示分，要么显示时+分
    if (totalSeconds < 60) {
        // 小于1分钟，显示秒
        return `${seconds}秒`;
    } else if (totalSeconds < 3600) {
        // 小于1小时，显示分钟（不显示秒）
        return `${minutes}分`;
    } else {
        // 大于等于1小时，显示小时和分钟（不显示秒）
        return `${hours}时${minutes}分`;
    }
}

export const sleep = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
};