// Store and retrieve json that retains custom classes
class Foo {
}
class Bar {
}
const Store = {
    // const Store = {
    Foo,
    Bar
};
class DynamicClassTYPE {
    // constructor(className: string, opts: any) {
    constructor(className, opts, allClasses) {
        // if (Store[className] === undefined || Store[className] === null) {
        if (allClasses[className] === undefined || allClasses[className] === null) {
            throw new Error(`Class type of \'${className}\' is not in the store`);
        }
        return new allClasses[className](opts);
    }
}
JSON.stringifyWithClasses = function (data, space) {
    return JSON.stringify(data, (key, value) => {
        // Give class name as "__type" property if object but not Object
        if (value && typeof (value) === 'object' && value.constructor.name !== {}.constructor.name) {
            // WARN: This line may fail if code is minimized
            value.__type = value.constructor.name;
        }
        return value;
    }, space);
};
// class Tile {}
// JSON.parseWithClasses = function(json: string, customClasses: object) {
// JSON.parseWithClasses = function(json: string, customClasses: CustomClassList) {
JSON.parseWithClasses = function (json, customClasses) {
    if (!customClasses) {
        return console.error('JSON.parseWithClasses() must be passed an object containing one or more custom classes as keys.');
    }
    // FIXME: `any`
    let classes = { Object };
    classes = Object.assign(Object.assign({}, classes), customClasses);
    // console.debug(classes)
    // classes = { Object, Tile }
    // console.debug(classes)
    // let classes = { 'foo': Object }
    // let classes: Map<string, number> = [
    //     'one': 1,
    //     'two': 2
    // ]
    // return JSON.parse(json, (key, value: CustomClass) => {
    return JSON.parse(json, (key, value) => {
        if (value && typeof (value) === 'object' && value.__type) {
            const type = value.__type;
            if (typeof type !== 'string') {
                return value;
            }
            // const value_ = value; // CustomClass
            // const type_ = value.__type // string
            // const classes_ = classes
            // const type: Object = value.__type
            // let DynamicClass = classes[value.__type];
            // let DynamicClass = classes[type];
            // let DynamicClass = Object.keys(type); // should be ObjectConstructor I guess?
            // let DynamicClass: any = new DynamicClassTYPE(type, value, classes)
            // FIXME: Creates actual instance (w/ all data crammed into first arg) rather than class type
            // let DynamicClass: any = new classes[type](value) // remove 'new'?
            let DynamicClass = classes[type];
            // let DynamicClass = classes[type](value)
            console.debug(DynamicClass);
            if (!DynamicClass) {
                console.warn(`Unknown object class "${type}"; casting as generic Object, but you should add it to the customClasses property passed to JSON.parseWithClasses().`);
                DynamicClass = Object;
            }
            // console.debug('val1: ' + value)
            value = Object.assign(new DynamicClass(), value); // crashes silently
            // value = Object.assign(new Tile(), value)
            // console.debug('val2: ' + value)
            delete value.__type;
        }
        // console.debug('val_f: ' + value)
        return value;
    });
};
export {};
