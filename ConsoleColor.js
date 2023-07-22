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

const consoleLog = console.log;
console.log = function() {
    const tag = getTag('INF', ConsoleColor.White.background);
    Array.prototype.unshift.call(arguments, tag);
    consoleLog.apply(this, arguments);
};

//                         safari colors
// debug    DBUG    DBG    cyan
// log      LOG?    LOG    white (grey/bright black showing no diff in repl)
// info     INFO    INF    blue
// warn     WARN    WRN    yellow
// error    ERRO    ERR    red

// different import rule for node vs browser so we can use diff method
// var prefix = "%cDebug: ";
// var color = "color: orange";
// Array.prototype.unshift.call(arguments, prefix, color);