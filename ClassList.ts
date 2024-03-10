// `[_: string]` -> unspecified number of key/value pairs
// - keys are inferred from values
// `...args: any[]` -> unspecified number/type of args
// `new () => any` -> ref to class name/constructor ("typeof")
// - Bassically looks like: `{ SomeClass: typeof Class, AnotherClass: typeof Class }
// - keys are inferred as strings

export default interface ClassList {
    [_: string]: new (...args: any[]) => any
}