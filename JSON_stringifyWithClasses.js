// Store and retrieve json that retains custom classes
JSON.stringifyWithClasses = function (data, space) {
    return JSON.stringify(data, (_, value) => {
        // Give class name as "__type" property if object (custom class) but not Object (vanilla)
        if (value && typeof (value) === 'object' && value.constructor.name !== {}.constructor.name) {
            // WARN: This line may fail if code is minimized
            value.__type = value.constructor.name;
        }
        return value;
    }, space);
};
JSON.parseWithClasses = function (json, customClasses) {
    if (!customClasses) {
        return console.error('JSON.parseWithClasses() must be passed an object containing one or more custom classes as keys.');
    }
    // Look for plain objects and specified classes
    let classes = { Object };
    classes = Object.assign(Object.assign({}, classes), customClasses);
    return JSON.parse(json, (_, value) => {
        // Attempt to create instance of custom class when `__type` key is found
        if (value && typeof (value) === 'object' && value.__type) {
            const type = value.__type;
            if (typeof type !== 'string') {
                return value;
            }
            // Create ref to custom class constructor
            let DynamicClass = classes[type];
            if (!DynamicClass) {
                console.warn(`Unknown object class "${type}"; casting as generic Object, but you should add it to the customClasses property passed to JSON.parseWithClasses().`);
                DynamicClass = Object;
            }
            // Instantiate from json
            value = Object.assign(new DynamicClass(), value);
            // Remove unneeded `__type` property
            delete value.__type;
        }
        return value;
    });
};
export {};
