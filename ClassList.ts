export default interface ClassList {
    [_className: string]: new (...args: any[]) => any
}