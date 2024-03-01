// Store and retrieve json that retains custom classes

// https://oooops.dev/2022/09/30/serializing-and-de-serializing-es6-class-instances-recursively/
// WARN: Potential issues when using constructors
// - If an issue, consider this implementation instead:
// - https://dev.to/krofdrakula/extending-json-for-fun-and-profit-3cg3


JSON.stringifyWithClasses = function(data, space) {
    return JSON.stringify(data, (key, value) => {
        // Give class name as "__type" property if object but not Object
        if (value && typeof (value) === 'object' && value.constructor.name !== {}.constructor.name) {
            // WARN: This line may fail if code is minimized
            value.__type = value.constructor.name;
        }
        return value;
    },
    space);
}

JSON.parseWithClasses = function(json, customClasses) {
    if (!customClasses) { return console.error('JSON.parseWithClasses() must be passed an object containing one or more custom classes as keys.'); }

    let classes = { Object };
    classes = {...classes, ...customClasses};
    
    return JSON.parse(json, (key, value) => {
        if (value && typeof (value) === 'object' && value.__type) {
            let DynamicClass = classes[value.__type];
            if (!DynamicClass) {
                console.warn(`Unknown object class "${value.__type}"; casting as generic Object, but you should add it to the customClasses property of JSON.parseWithClasses().`);
                DynamicClass = Object;
            }
            value = Object.assign(new DynamicClass(), value);
            delete value.__type;
        }
        return value;
    });
}