
// at的CQ码替换为对应qq，face的CQ码保留，其他CQ码替换为空
export function cqcode_process(input: string): string {
    // 匹配所有 CQ 码
    const CQ_PATTERN = /\[CQ:([^,]+)(?:,[^=\]]+=[^\]]+)*\]/g;
    
    return input.replace(CQ_PATTERN, (match, cqType, ...args) => {
      const fullMatch = match;
      
      // 处理 at 类型
      if (cqType === 'at') {
        const qqMatch = fullMatch.match(/qq=(\d+)/);
        return qqMatch ? `${qqMatch[1]}` : '';
      }
      
      // 保留 face 类型
      if (cqType === 'face') {
        return fullMatch;
      }
      
      // 其他类型替换为空
      return '';
    });
}