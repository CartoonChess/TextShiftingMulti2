import '../../ConsoleColor.js';

export class Coordinate {
    constructor(column, line, layer) {
        this.column = column;
        this.line = line;
        this.layer = layer;
    }

    static fromObject(obj) {
        return Object.assign(new this, obj);
    }

    static fromJson(json) {
        return Object.assign(new this, JSON.parse(json));
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
    // possibly provide some func/prop that provides .leftOfMe
}

// TODO: Make child (or sibling) of Map (~fromFile methods redundant)
class MapBorder {
    constructor(width = 1, height = 1, lines = [[' ']]) {
        // this.lines = lines;
        // this.height = lines && lines.length ? lines.length : height;
        // this.width = lines && lines.length && lines[0].length ? lines[0].length: width;

        if (lines && lines.length && lines[0].length && lines[0][0].length) {
            this.lines = lines;
            this.height = lines[0].length;
            this.width = lines[0][0].length;
        } else {
            console.error('Error constructing MapBorder.');
        }
    }

    // currently redundant
    static createFromLines(lines) {
        return new this(undefined, undefined, lines);
    }

    static async loadFromFile(filePath) {
        if (!filePath) { return console.error(`Must provide a file path to use MapBorder.loadFromFile.`); }

        const lines = await this.#loadLinesFromFile(filePath);
        return this.createFromLines(lines);
    }

    // static async #loadLinesFromFile(filePath) {
    //     let data;
    //     try {
    //         const response = await fetch(filePath);
    //         data = await response.text();
    //     } catch (err) {
    //         return console.error(`MapBorder.#loadLinesFromFile(${`filePath`}) failed with error: ${err}`);
    //     }

    //     // Split into 2D array of lines and their tiles
    //     const lines = data.split('\n');
    //     for (let i = 0; i < lines.length; i++) {
    //         lines[i] = lines[i].split('');
    //     }
        
    //     return lines;
    // }
    static async #loadLinesFromFile(filePath) {
        let data;
        try {
            const file = await import(filePath);
            return file.tiles;
        } catch (err) {
            return console.error(`MapBorder.#loadLinesFromFile(${`filePath`}) failed with error: ${err}`);
        }
    }
}

import '../../JSON_stringifyWithClasses.js';
import Tile, { WarpTileScript } from './Tile.js';
// TODO: Are we okay declaring this here?
const customJsonClasses = { Tile, Coordinate, WarpTileScript };

export class GameMap {
    static #packagePath = '../maps/';
    // TODO: Potential for bug with #center
    // If map has even dimensions, then View.isVisible could have OBOE error...
    // esp. for remotePlayers prior to first loading the view
    #center;
    name;
    startPosition;

    // dimension are overridden if lines is supplied
    // info must be an object
    constructor(width = 0, height = 0, lines, border = new MapBorder(), info) {
        if (lines && lines.length && lines[0].length && lines[0][0].length) {
            this.lines = lines;
            this.depth = lines.length;
            this.height = lines[0].length;
            this.width = lines[0][0].length;
        } else {
            // If there's no lines data or it seems improperly formatted
            this.lines = GameMap.#generateBlankLines(width, height);
            this.width = width;
            this.height = height;
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

    static #generateBlankLines(width, height) {
        const lines = new Array(height);
        for (let y = 0; y < height; y++) {
            lines[y] = new Array(width).fill(' ');
        }
        return lines;
    }

    static createBlank(width, height, border, info) {
        return new this(width, height, GameMap.#generateBlankLines(width, height), border, info);
    }

    static createFromLines(lines, border, info) {
        return new this(undefined, undefined, lines, border, info);
    }

    static async #loadInfoFromFile(filePath, pkgName) {
        try {
            const file = await import(filePath);
            
            // Overwrite data.name with path instead
            if (pkgName) {
                file.data.name = pkgName;
            }

            return file.data;
        } catch(err) {
            console.error(`Couldn't open file ${filePath}: ${err}`);
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
    static async #loadLinesFromFile(filePath) {
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
        } catch (err) {
            return console.error(`GameMap.#loadLinesFromFile('${`filePath`}') failed with error: ${err}`);
        }
    }

    static async loadFromFile(filePath, borderFilePath, infoFilePath, pkgName) {
        if (!filePath) { return console.error(`Must provide a file path to use GameMap.loadFromFile.`); }

        const lines = await this.#loadLinesFromFile(filePath);

        let border;
        if (borderFilePath) {
            border = await MapBorder.loadFromFile(borderFilePath);
        }

        const info = await this.#loadInfoFromFile(infoFilePath, pkgName);
        return this.createFromLines(lines, border, info);
    }

    // static async loadFromPackage(pkgName, infoOnly) {
    static loadFromPackage(pkgName, infoOnly) {
        if (!pkgName) { return console.error(`Must provide a package name to use GameMap.loadFromPackage.`); }

        // "advised to access private static props thru class NAME"
        // TODO: Should ask server for path separator symbol (diff for Windows?)
        // TODO: Clean up all this prefix nonsense (handled by server now)
        const prefix = GameMap.#packagePath + pkgName + '/';
        // const prefix__ = pkgName + '/';
        const infoFilePath = prefix + 'info.js'
        if (infoOnly) {
            return this.#loadInfoFromFile(infoFilePath, pkgName);
        } else {
            // TODO: Change to .json
            // const filePath = prefix + 'map.js';
            const filePath = pkgName;
            // const borderFilePath = prefix + 'border';
            const borderFilePath = prefix + 'border.js';
            return this.loadFromFile(filePath, borderFilePath, infoFilePath, pkgName);
        }
    }

    // static async loadInfoFromPackage(pkgName) {
    static loadInfoFromPackage(pkgName) {
        if (!pkgName) { return console.error(`Must provide a package name to use GameMap.loadInfoFromPackage.`); }
        return this.loadFromPackage(pkgName, true);
    }

    static createTestMap(view, width = view.width * 2, height = view.height * 2, boundCharacter = '#', border) {
        if (!view) { return console.warn(`Can't call GameMap.createTestMap without providing view argument.`); }
        
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
                } else if (randomNumber < 0.8) {
                    // character = '.';
                    character = '🌲';
                } else if (randomNumber < 0.95) {
                    character = ',';
                } else if (randomNumber < 0.99) {
                    character = boundCharacter;
                } else {
                    character = '~';
                }
    
                line.push(character);
            }
            lines.push(line);
        }
        return this.createFromLines(lines, border, { name: 'testMap' });
    }

    get center() {
        return this.#center;
    }
}