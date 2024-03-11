import '../../ConsoleColor.js'

export class Coordinate {
    column: number
    line: number
    layer?: number

    // constructor(data: any);
    constructor(column: number, line: number, layer?: number) {
        this.column = column
        this.line = line
        this.layer = layer
    }
 
    // static fromObject(obj: any) {
    static fromObject(obj: { column: number, line: number, layer?: number} ): Coordinate {
        return new this(obj.column, obj.line, obj.layer)
    }

    static fromJson(json: string): Coordinate {
        return Coordinate.fromObject(JSON.parse(json))
    }

    toJson(): string {
        return JSON.stringify(this)
    }

    toString() {
        if (this.layer) {
            return `(x: ${this.column}, y: ${this.line}, z: {${this.layer})`
        }
        return `(x: ${this.column}, y: ${this.line})`
    }
    // possibly provide some func/prop that provides .leftOfMe
}

// type GameMapLines2D = string[][]
type GameMapLines2D = Tile[][]
type GameMapLines3D = [GameMapLines2D]

// TODO: Make child (or sibling) of Map (~fromFile methods redundant)
class MapBorder {
    lines: GameMapLines2D
    width: number
    height: number

    // constructor(width = 1, height = 1, lines = [[' ']]) {
    constructor(width = 1, height = 1, lines = [[ new Tile({ symbol: ' ' })]]) {
        // if (lines && lines.length && lines[0].length && lines[0][0].length) {
        // if (lines?.length && lines[0].length && lines[0][0].length) {
            this.lines = lines
            // this.height = lines[0].length
            // this.width = lines[0][0].length
            this.height = lines.length
            this.width = lines[0].length
            // this.depth = lines[0][0].length
        // } else {
        //    throw new Error('Error constructing MapBorder.')
        // }
    }

    // currently redundant
    static createFromLines(lines: GameMapLines2D): MapBorder {
        return new this(undefined, undefined, lines)
    }

    static async loadFromFile(filePath: string): Promise<MapBorder> {
        // if (!filePath) { return console.error(`Must provide a file path to use MapBorder.loadFromFile.`); }

        const lines: GameMapLines2D = await this.#loadLinesFromFile(filePath)
        return this.createFromLines(lines)
    }

    static async #loadLinesFromFile(filePath: string): Promise<GameMapLines2D> {
        try {
            const file = await import(filePath)
            return file.tiles
        } catch (err) {
            // return console.error(`MapBorder.#loadLinesFromFile(${filePath}) failed with error: ${err}`);
            throw new Error(`MapBorder.#loadLinesFromFile(${filePath}) failed with error: ${err}`)
        }
    }
}

import '../../JSON_stringifyWithClasses.js'
import Tile, { WarpTileScript } from './Tile.js'
// TODO: Are we okay declaring this here?
import ClassList from '../../ClassList.js'
// const customJsonClasses: ClassList = { Tile, Coordinate, WarpTileScript }

export class GameMap {
    static readonly #packagePath = '../maps/';
    // TODO: Potential for bug with #center
    // If map has even dimensions, then View.isVisible could have OBOE error...
    // esp. for remotePlayers prior to first loading the view
    #center;
    name;
    startPosition;

    lines: GameMapLines3D
    width: number
    height: number
    depth: number

    border: MapBorder

    // All classes that can appear in map json data
    static customJsonClasses: ClassList = { Tile, Coordinate, WarpTileScript }
    // Instance version
    get customJsonClasses() {
        return GameMap.customJsonClasses;
    }

    // dimension are overridden if lines is supplied
    // info must be an object
    // constructor(width = 0, height = 0, lines: string | any[], border = new MapBorder(), info: { startPosition: any; name: any; }) {
    constructor(width = 0, height = 0, lines: GameMapLines3D, border = new MapBorder(), info?: { startPosition?: Coordinate; name?: string; }) {
        // if (lines && lines.length && lines[0].length && lines[0][0].length) {
        if (lines?.length && lines[0].length && lines[0][0].length) {
            this.lines = lines;
            this.depth = lines.length;
            this.height = lines[0].length;
            this.width = lines[0][0].length;
        } else {
            // If there's no lines data or it seems improperly formatted
            // FIXME: This assigns a 2d array rather than 3d
            this.lines = GameMap.#generateBlankLines(width, height);
            this.width = width;
            this.height = height;
            this.depth = 1; // see above
        }

        // If border is a 2D array rather than object, create object first
        if (Array.isArray(border)) {
            this.border = MapBorder.createFromLines(border);
        } else {
            this.border = border;
        }

        this.#center = new Coordinate(
            Math.floor(this.width / 2),
            Math.floor(this.height / 2)
        );

        // Can't check info.* immediately, or total failure
        if (info) {
            if (info.startPosition) {
                // TODO: Should be able to check for, and take, Coordinate object proper
                this.startPosition = Coordinate.fromObject(info.startPosition);
            } else {
                // startPosition defaults to center
                this.startPosition = this.#center;
            }
            // Note: This should be automatically set to path, even if info.js tries to supply it
            // if (info.name) {
            if (!this.name && info.name) {
                this.name = info.name;
            }
        }
    }

    static #generateBlankLines(width: number, height: number): GameMapLines3D {
        const lines: GameMapLines2D = new Array(height);
        for (let y = 0; y < height; y++) {
            lines[y] = new Array(width).fill(' ');
        }
        return [lines];
    }

    // static createBlank(width: number | undefined, height: number | undefined, border: MapBorder | undefined, info: any) {
    static createBlank(width: number, height: number, border: MapBorder, info?: { startPosition?: Coordinate; name: string; }) {
        return new this(width, height, GameMap.#generateBlankLines(width, height), border, info);
    }

    // static createFromLines(lines: any[][], border: void | MapBorder, info: { name: string; }) {
    static createFromLines(lines: GameMapLines3D, border?: MapBorder, info?: { startPosition?: Coordinate; name: string; }) {
        return new this(undefined, undefined, lines, border, info);
    }

    // FIXME: Return type; replace `import` with `fetch`
    static async #loadInfoFromFile(filePath: string, pkgName: string): Promise<any> {
        try {
            const file = await import(filePath);
            
            // Overwrite data.name with path instead
            if (pkgName) {
                file.data.name = pkgName;
            }

            return file.data;
        } catch(err) {
            throw new Error(`Couldn't open file ${filePath}: ${err}`);
        }
    }

    // static async #loadLinesFromFile(filePath) {
    //     let data;
    //     try {
    //         const file = await import(filePath);
    //         return file.tiles;
    //     } catch (err) {
    //         return console.error(`GameMap.#loadLinesFromFile(${`filePath`}) failed with error: ${err}`);
    //     }
    // }
    static async #loadLinesFromFile(filePath: string): Promise<GameMapLines3D> {
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
            return JSON.parseWithClasses(json, GameMap.customJsonClasses);
        } catch (err) {
            throw new Error(`GameMap.#loadLinesFromFile('${filePath}') failed with error: ${err}`);
        }
    }

    static async loadFromFile(filePath: string, borderFilePath: string, infoFilePath: string, pkgName: string) {
        // if (!filePath) { return console.error(`Must provide a file path to use GameMap.loadFromFile.`); }

        const lines: GameMapLines3D = await this.#loadLinesFromFile(filePath);

        let border;
        if (borderFilePath) {
            border = await MapBorder.loadFromFile(borderFilePath);
        }

        const info = await this.#loadInfoFromFile(infoFilePath, pkgName);
        return this.createFromLines(lines, border, info);
    }

    // +async
    static async loadFromPackage(pkgName: string, infoOnly?: boolean): Promise<GameMap> {
        // if (!pkgName) { return console.error(`Must provide a package name to use GameMap.loadFromPackage.`); }

        // "advised to access private static props thru class NAME"
        // TODO: Should ask server for path separator symbol (diff for Windows?)
        // TODO: Clean up all this prefix nonsense (handled by server now)
        const prefix = GameMap.#packagePath + pkgName + '/';
        const infoFilePath = prefix + 'info.js'
        if (infoOnly) {
            // +await
            return await this.#loadInfoFromFile(infoFilePath, pkgName);
        } else {
            // TODO: Change to .json
            // const filePath = prefix + 'map.js';
            const filePath = pkgName;
            const borderFilePath = prefix + 'border.js';
            // +await
            return await this.loadFromFile(filePath, borderFilePath, infoFilePath, pkgName);
        }
    }

    // +async
    static async loadInfoFromPackage(pkgName: string): Promise<GameMap> {
        // if (!pkgName) { return console.error(`Must provide a package name to use GameMap.loadInfoFromPackage.`); }
        return await this.loadFromPackage(pkgName, true);
    }

    // NOTE: Currently unused
    // static createTestMap(view: { width: number; height: number; }, width = view.width * 2, height = view.height * 2, boundCharacter = '#', border?: MapBorder): GameMap {
    static createTestMap(view: { width: number; height: number; }, width = view.width * 2, height = view.height * 2, boundCharacter = { symbol: '#' }, border?: MapBorder): GameMap {
        // if (!view) { return console.warn(`Can't call GameMap.createTestMap without providing view argument.`); }
        
        // const lines = [];
        const lines: GameMapLines2D = [];
        
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
            // const line = [];
            const line: Tile[] = [];
            for (let x = 0; x < width; x++) {
                if (x === leftBound || x === rightBound) {
                    line.push(boundCharacter);
                    continue;
                }
                const randomNumber = Math.random();
                let character;
    
                if (randomNumber < 0.65) {
                    character = ' ';
                } else if (randomNumber < 0.8) {
                    // character = '.';
                    character = '🌲';
                } else if (randomNumber < 0.95) {
                    character = ',';
                } else if (randomNumber < 0.99) {
                    // character = boundCharacter;
                    character = boundCharacter.symbol;
                } else {
                    character = '~';
                }
    
                // line.push(character);
                line.push({ symbol: character });
            }
            lines.push(line);
        }
        
        const singleLayerMap: GameMapLines3D = [lines]
        // return this.createFromLines(lines, border, { name: 'testMap' });
        return this.createFromLines(singleLayerMap, border, { name: 'testMap' });
    }

    get center() {
        return this.#center;
    }
}