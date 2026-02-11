
export function pages(obj: Record<string, any>, page: number, each: number, show: (key: string, value: any)=>string) {

    var keys = Object.keys(obj);

    const max_page = Math.ceil(keys.length/each);
    if (page > max_page) page = max_page || 1;

    var s = '';

    for (var i=(page-1)*each; i<each; i++) {
        if (i>keys.length-1) break;
        s+=show(keys[i], obj[keys[i]])+'\n';
    }

    s+=`第 ${page} / ${max_page || 1} 页`;

    return s;
}