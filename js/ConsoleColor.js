// level    4       3      1    Safari color
//
// debug    DBUG    DBG    D    cyan
// log      LOG?    LOG    L    white (grey/bright black showing no diff in some contexts)
// info     INFO    INF    I    blue
// warn     WARN    WRN    W    yellow
// error    ERRO    ERR    E    red
var _a;
let _isServer;
const isServer = function () {
    var _b;
    if (_isServer === undefined) {
        // https://stackoverflow.com/a/31456668/141032
        _isServer = typeof process !== "undefined" && ((_b = process === null || process === void 0 ? void 0 : process.versions) === null || _b === void 0 ? void 0 : _b.node) ? true : false;
    }
    return _isServer;
};
class ConsoleColor {
    constructor(name = 'transparent', code = 0) {
        this.name = name;
        this.code = code;
    }
    // Unused?
    get bright() {
        if (!isServer()) {
            return this;
        }
        return new _a(undefined, this.code + 60);
    }
    get background() {
        if (!isServer()) {
            return this;
        }
        return new _a(undefined, this.code + 10);
    }
    // WARN: Can also return `number`...
    toString() {
        if (isServer()) {
            return this.code;
        }
        else {
            return this.name;
        }
    }
}
_a = ConsoleColor;
ConsoleColor.Reset = new _a('transparent', 0);
ConsoleColor.Black = new _a('black', 30);
ConsoleColor.Red = new _a('red', 31);
ConsoleColor.Green = new _a('green', 32);
ConsoleColor.Yellow = new _a('yellow', 33);
ConsoleColor.Blue = new _a('blue', 34);
ConsoleColor.Magenta = new _a('magenta', 35);
ConsoleColor.Cyan = new _a('cyan', 36);
ConsoleColor.White = new _a('white', 37);
function colorString(str, color) {
    if (!str) {
        return '';
    }
    if (!color) {
        return str;
    }
    const esc = '\x1b[';
    const codeSuffix = 'm';
    const getSequence = (color) => esc + color + codeSuffix;
    const prefix = getSequence(color);
    const suffix = getSequence(ConsoleColor.Reset);
    return prefix + str + suffix;
}
function getTag(label, color) {
    label = '[' + label + ']';
    if (isServer()) {
        return colorString(label, color);
    }
    else {
        return '%c' + label;
    }
}
// function printToConsole(consoleCopy: Function, args, label: string, color: ConsoleColor) {
// function printToConsole(this: ConsoleCopy, consoleCopy: ConsoleCopy, args: IArguments, label: string, color: ConsoleColor) {
// function printToConsole(consoleCopy: ConsoleCopy, args: IArguments, label: string, color: ConsoleColor) {
function printToConsole(consoleCopy, args, label, color) {
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
    // consoleCopy.apply(this, args)
    // consoleCopy.apply(consoleCopy, [args])
    // consoleCopy.apply(consoleCopy, args)
    consoleCopy.apply(consoleCopy, args);
}
const consoleDebug = console.debug;
console.debug = function () {
    printToConsole(consoleDebug, arguments, 'DBG', ConsoleColor.Cyan);
};
const consoleLog = console.log;
console.log = function () {
    printToConsole(consoleLog, arguments, 'LOG', ConsoleColor.White);
};
const consoleInfo = console.info;
console.info = function () {
    printToConsole(consoleInfo, arguments, 'INF', ConsoleColor.Blue);
};
const consoleWarn = console.warn;
console.warn = function () {
    printToConsole(consoleWarn, arguments, 'WRN', ConsoleColor.Yellow);
};
const consoleError = console.error;
console.error = function () {
    printToConsole(consoleError, arguments, 'ERR', ConsoleColor.Red);
};
export {};
