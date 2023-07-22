class ConsoleColor {
    static Reset = new this(0);
    static Black = new this(30);
    static Red = new this(31);
    static Green = new this(32);
    static Yellow = new this(33);
    static Blue = new this(34);
    static Magenta = new this(35);
    static Cyan = new this(36);
    static White = new this(37);

    constructor(code = 0) {
        this.code = code;
    }

    get bright() {
        return new this.constructor(this.code + 60);
    };
    
    get background() {
        return new this.constructor(this.code + 10);
    }
    
    toString() {
        return this.code;
    }
}

function colorString(str, color) {
    if (!str) { return ''; }
    if (!color) { return str; }
    const esc = '\x1b[';
    const codeSuffix = 'm';
    const getSequence = (color) => esc + color + codeSuffix;
    const prefix = getSequence(color);
    const suffix = getSequence(ConsoleColor.Reset);

    return prefix + str + suffix;
}

function getTag(label, color) {
    return colorString('[' + label + ']', color);
}

function printToConsole(consoleCopy, args, label, color) {
    const tag = getTag(label, color);
    Array.prototype.unshift.call(args, tag);
    consoleCopy.apply(this, args);
}

const consoleLog = console.log;
console.log = function() {
    printToConsole(consoleLog, arguments, 'LOG', ConsoleColor.White.background);
};

const consoleInfo = console.info;
console.info = function() {
    printToConsole(consoleInfo, arguments, 'INF', ConsoleColor.Cyan.background);
};

//                              Safari colors
// debug    DBUG    DBG    D    cyan
// log      LOG?    LOG    L    white (grey/bright black showing no diff in repl)
// info     INFO    INF    I    blue
// warn     WARN    WRN    W    yellow
// error    ERRO    ERR    E    red

// different import rule for node vs browser so we can use diff method
// var prefix = "%cDebug: ";
// var color = "color: orange";
// Array.prototype.unshift.call(arguments, prefix, color);

let _isServer;
const isServer = function() {
    if (_isServer === undefined) {
        // https://stackoverflow.com/a/31456668/141032
        _isServer = typeof process !== "undefined" && process?.versions?.node ? true : false;
    }
    return _isServer;
}