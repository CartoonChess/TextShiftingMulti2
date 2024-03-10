var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _a, _MapBorder_loadLinesFromFile, _b, _GameMap_packagePath, _GameMap_center, _GameMap_generateBlankLines, _GameMap_loadInfoFromFile, _GameMap_loadLinesFromFile;
import '../../ConsoleColor.js';
export class Coordinate {
    // constructor(data: any);
    constructor(column, line, layer) {
        this.column = column;
        this.line = line;
        this.layer = layer;
    }
    // static fromObject(obj: any) {
    static fromObject(obj) {
        // return Object.assign(new this, obj);
        return new this(obj.column, obj.line, obj.layer);
    }
    static fromJson(json) {
        // return Object.assign(new this, JSON.parse(json));
        // return new this
        return Coordinate.fromObject(JSON.parse(json));
    }
    toJson() {
        return JSON.stringify(this);
    }
    toString() {
        if (this.layer) {
            return `(x: ${this.column}, y: ${this.line}, z: {${this.layer})`;
        }
        return `(x: ${this.column}, y: ${this.line})`;
    }
}
// TODO: Make child (or sibling) of Map (~fromFile methods redundant)
class MapBorder {
    constructor(width = 1, height = 1, lines = [[' ']]) {
        // if (lines && lines.length && lines[0].length && lines[0][0].length) {
        if ((lines === null || lines === void 0 ? void 0 : lines.length) && lines[0].length && lines[0][0].length) {
            this.lines = lines;
            this.height = lines[0].length;
            this.width = lines[0][0].length;
        }
        else {
            throw new Error('Error constructing MapBorder.');
        }
    }
    // currently redundant
    // static createFromLines(lines: any[] | undefined) {
    static createFromLines(lines) {
        return new this(undefined, undefined, lines);
    }
    // static async loadFromFile(filePath: any) {
    static async loadFromFile(filePath) {
        // if (!filePath) { return console.error(`Must provide a file path to use MapBorder.loadFromFile.`); }
        const lines = await __classPrivateFieldGet(this, _a, "m", _MapBorder_loadLinesFromFile).call(this, filePath);
        return this.createFromLines(lines);
    }
}
_a = MapBorder, _MapBorder_loadLinesFromFile = async function _MapBorder_loadLinesFromFile(filePath) {
    try {
        const file = await import(filePath);
        return file.tiles;
    }
    catch (err) {
        // return console.error(`MapBorder.#loadLinesFromFile(${filePath}) failed with error: ${err}`);
        throw new Error(`MapBorder.#loadLinesFromFile(${filePath}) failed with error: ${err}`);
    }
};
import '../../JSON_stringifyWithClasses.js';
import Tile, { WarpTileScript } from './Tile.js';
const customJsonClasses = { Tile, Coordinate, WarpTileScript };
export class GameMap {
    // dimension are overridden if lines is supplied
    // info must be an object
    // constructor(width = 0, height = 0, lines: string | any[], border = new MapBorder(), info: { startPosition: any; name: any; }) {
    constructor(width = 0, height = 0, lines, border = new MapBorder(), info) {
        // TODO: Potential for bug with #center
        // If map has even dimensions, then View.isVisible could have OBOE error...
        // esp. for remotePlayers prior to first loading the view
        _GameMap_center.set(this, void 0);
        // if (lines && lines.length && lines[0].length && lines[0][0].length) {
        if ((lines === null || lines === void 0 ? void 0 : lines.length) && lines[0].length && lines[0][0].length) {
            this.lines = lines;
            this.depth = lines.length;
            this.height = lines[0].length;
            this.width = lines[0][0].length;
        }
        else {
            // If there's no lines data or it seems improperly formatted
            // FIXME: This assigns a 2d array rather than 3d
            this.lines = __classPrivateFieldGet(_b, _b, "m", _GameMap_generateBlankLines).call(_b, width, height);
            this.width = width;
            this.height = height;
            this.depth = 1; // see above
        }
        // If border is a 2D array rather than object, create object first
        if (Array.isArray(border)) {
            this.border = MapBorder.createFromLines(border);
        }
        else {
            this.border = border;
        }
        __classPrivateFieldSet(this, _GameMap_center, new Coordinate(Math.floor(this.width / 2), Math.floor(this.height / 2)), "f");
        // Can't check info.* immediately, or total failure
        if (info) {
            if (info.startPosition) {
                // TODO: Should be able to check for, and take, Coordinate object proper
                this.startPosition = Coordinate.fromObject(info.startPosition);
            }
            else {
                // startPosition defaults to center
                this.startPosition = __classPrivateFieldGet(this, _GameMap_center, "f");
            }
            // Note: This should be automatically set to path, even if info.js tries to supply it
            // if (info.name) {
            if (!this.name && info.name) {
                this.name = info.name;
            }
        }
    }
    // static createBlank(width: number | undefined, height: number | undefined, border: MapBorder | undefined, info: any) {
    static createBlank(width, height, border, info) {
        return new this(width, height, __classPrivateFieldGet(_b, _b, "m", _GameMap_generateBlankLines).call(_b, width, height), border, info);
    }
    // static createFromLines(lines: any[][], border: void | MapBorder, info: { name: string; }) {
    static createFromLines(lines, border, info) {
        return new this(undefined, undefined, lines, border, info);
    }
    static async loadFromFile(filePath, borderFilePath, infoFilePath, pkgName) {
        // if (!filePath) { return console.error(`Must provide a file path to use GameMap.loadFromFile.`); }
        const lines = await __classPrivateFieldGet(this, _b, "m", _GameMap_loadLinesFromFile).call(this, filePath);
        let border;
        if (borderFilePath) {
            border = await MapBorder.loadFromFile(borderFilePath);
        }
        const info = await __classPrivateFieldGet(this, _b, "m", _GameMap_loadInfoFromFile).call(this, infoFilePath, pkgName);
        return this.createFromLines(lines, border, info);
    }
    // +async
    static async loadFromPackage(pkgName, infoOnly) {
        // if (!pkgName) { return console.error(`Must provide a package name to use GameMap.loadFromPackage.`); }
        // "advised to access private static props thru class NAME"
        // TODO: Should ask server for path separator symbol (diff for Windows?)
        // TODO: Clean up all this prefix nonsense (handled by server now)
        const prefix = __classPrivateFieldGet(_b, _b, "f", _GameMap_packagePath) + pkgName + '/';
        const infoFilePath = prefix + 'info.js';
        if (infoOnly) {
            // +await
            return await __classPrivateFieldGet(this, _b, "m", _GameMap_loadInfoFromFile).call(this, infoFilePath, pkgName);
        }
        else {
            // TODO: Change to .json
            // const filePath = prefix + 'map.js';
            const filePath = pkgName;
            const borderFilePath = prefix + 'border.js';
            // +await
            return await this.loadFromFile(filePath, borderFilePath, infoFilePath, pkgName);
        }
    }
    // +async
    static async loadInfoFromPackage(pkgName) {
        // if (!pkgName) { return console.error(`Must provide a package name to use GameMap.loadInfoFromPackage.`); }
        return await this.loadFromPackage(pkgName, true);
    }
    // NOTE: Currently unused
    static createTestMap(view, width = view.width * 2, height = view.height * 2, boundCharacter = '#', border) {
        // if (!view) { return console.warn(`Can't call GameMap.createTestMap without providing view argument.`); }
        // const lines = [];
        const lines = [];
        // Build walls around map edge
        const leftBound = Math.floor(view.width / 2) - 1;
        const rightBound = width - leftBound - 1;
        const topBound = Math.floor(view.height / 2) - 1;
        const bottomBound = height - topBound - 1;
        for (let y = 0; y < height; y++) {
            if (y === topBound || y === bottomBound) {
                lines.push(Array(width).fill(boundCharacter));
                continue;
            }
            const line = [];
            for (let x = 0; x < width; x++) {
                if (x === leftBound || x === rightBound) {
                    line.push(boundCharacter);
                    continue;
                }
                const randomNumber = Math.random();
                let character;
                if (randomNumber < 0.65) {
                    character = ' ';
                }
                else if (randomNumber < 0.8) {
                    // character = '.';
                    character = '🌲';
                }
                else if (randomNumber < 0.95) {
                    character = ',';
                }
                else if (randomNumber < 0.99) {
                    character = boundCharacter;
                }
                else {
                    character = '~';
                }
                line.push(character);
            }
            lines.push(line);
        }
        const singleLayerMap = [lines];
        // return this.createFromLines(lines, border, { name: 'testMap' });
        return this.createFromLines(singleLayerMap, border, { name: 'testMap' });
    }
    get center() {
        return __classPrivateFieldGet(this, _GameMap_center, "f");
    }
}
_b = GameMap, _GameMap_center = new WeakMap(), _GameMap_generateBlankLines = function _GameMap_generateBlankLines(width, height) {
    const lines = new Array(height);
    for (let y = 0; y < height; y++) {
        lines[y] = new Array(width).fill(' ');
    }
    return [lines];
}, _GameMap_loadInfoFromFile = async function _GameMap_loadInfoFromFile(filePath, pkgName) {
    try {
        const file = await import(filePath);
        // Overwrite data.name with path instead
        if (pkgName) {
            file.data.name = pkgName;
        }
        return file.data;
    }
    catch (err) {
        throw new Error(`Couldn't open file ${filePath}: ${err}`);
    }
}, _GameMap_loadLinesFromFile = async function _GameMap_loadLinesFromFile(filePath) {
    const query = '?' + new URLSearchParams({ name: filePath }).toString();
    try {
        // Fetch map json from API point
        const response = await fetch('/fetchMap' + query);
        if (!response.ok) {
            const err = await response.text();
            throw new Error(err);
        }
        // Deserialize with classes intact
        const json = await response.text();
        return JSON.parseWithClasses(json, customJsonClasses);
    }
    catch (err) {
        throw new Error(`GameMap.#loadLinesFromFile('${filePath}') failed with error: ${err}`);
    }
};
_GameMap_packagePath = { value: '../maps/' };
