export function throttle<T extends (...args: any) => any>(fn: T, timer: number = 300) {
    let lock = false
    return function (this: any, ...args: any[]) {
        if (lock) return
        lock = true
        setTimeout(() => {
            lock = false
        }, timer);
        if (args.length > 0) {
            fn.bind(this)(...args)
        } else {
            fn.bind(this)
        }
    }

}