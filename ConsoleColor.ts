// level    4       3      1    Safari color
//
// debug    DBUG    DBG    D    cyan
// log      LOG?    LOG    L    white (grey/bright black showing no diff in some contexts)
// info     INFO    INF    I    blue
// warn     WARN    WRN    W    yellow
// error    ERRO    ERR    E    red

let _isServer: boolean;
const isServer = function() {
    if (_isServer === undefined) {
        // https://stackoverflow.com/a/31456668/141032
        _isServer = typeof process !== "undefined" && process?.versions?.node ? true : false;
    }
    return _isServer;
}

class ConsoleColor {
    static Reset = new this('transparent', 0);
    static Black = new this('black', 30);
    static Red = new this('red', 31);
    static Green = new this('green', 32);
    static Yellow = new this('yellow', 33);
    static Blue = new this('blue', 34);
    static Magenta = new this('magenta', 35);
    static Cyan = new this('cyan', 36);
    static White = new this('white', 37);

    name: string;
    code: number;

    constructor(name = 'transparent', code = 0) {
        this.name = name;
        this.code = code;
    }

    // Unused?
    get bright(): ConsoleColor {
        if (!isServer()) { return this; }
        return new ConsoleColor(undefined, this.code + 60);
    };
    
    get background(): ConsoleColor {
        if (!isServer()) { return this; }
        return new ConsoleColor(undefined, this.code + 10);
    }
    
    // WARN: Can also return `number`...
    toString() {
        if (isServer()) {
            return this.code;
        } else {
            return this.name;
        }
    }
}

function colorString(str: string, color: ConsoleColor) {
    if (!str) { return ''; }
    if (!color) { return str; }
    
    const esc = '\x1b[';
    const codeSuffix = 'm';
    const getSequence = (color: ConsoleColor) => esc + color + codeSuffix;
    const prefix = getSequence(color);
    const suffix = getSequence(ConsoleColor.Reset);

    return prefix + str + suffix;
}

function getTag(label: string, color: ConsoleColor) {
    label = '[' + label + ']';
    if (isServer()) {
        return colorString(label, color);
    } else {
        return '%c' + label;
    }
}

type ConsoleCopy = {
    (...data: any[]): void;
    (message?: any, ...optionalParams: any[]): void;
}

// function printToConsole(consoleCopy: Function, args, label: string, color: ConsoleColor) {
// function printToConsole(this: ConsoleCopy, consoleCopy: ConsoleCopy, args: IArguments, label: string, color: ConsoleColor) {
function printToConsole(consoleCopy: ConsoleCopy, args: IArguments, label: string, color: ConsoleColor) {
    if (isServer()) {
        color = color.background;
    }
    const tag = getTag(label, color);
    if (!isServer()) {
        const fontColor = color === ConsoleColor.Blue ? 'white' : 'black';
        Array.prototype.unshift.call(args, `color: ${fontColor}; background-color: ${color}`);
    }
    Array.prototype.unshift.call(args, tag);
    // this/consoleCopy -> console?
    // consoleCopy.apply(this, args);
    consoleCopy.apply(consoleCopy, [args]);
}

const consoleDebug = console.debug;
console.debug = function() {
    printToConsole(consoleDebug, arguments, 'DBG', ConsoleColor.Cyan);
};

const consoleLog = console.log;
console.log = function() {
    printToConsole(consoleLog, arguments, 'LOG', ConsoleColor.White);
};

const consoleInfo = console.info;
console.info = function() {
    printToConsole(consoleInfo, arguments, 'INF', ConsoleColor.Blue);
};

const consoleWarn = console.warn;
console.warn = function() {
    printToConsole(consoleWarn, arguments, 'WRN', ConsoleColor.Yellow);
};

const consoleError = console.error;
console.error = function() {
    printToConsole(consoleError, arguments, 'ERR', ConsoleColor.Red);
};