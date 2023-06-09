export class Coordinate {
    constructor(column, line) {
        this.column = column;
        this.line = line;
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
        return `(x: ${this.column}, y: ${this.line})`;
    }
    // possibly provide some func/prop that provides .leftOfMe
}

// TODO: Make child (or sibling) of Map (~fromFile methods redundant)
class MapBorder {
    constructor(width = 1, height = 1, lines = [[' ']]) {
        this.lines = lines;
        this.height = lines && lines.length ? lines.length : height;
        this.width = lines && lines.length && lines[0].length ? lines[0].length: width;
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

    static async #loadLinesFromFile(filePath) {
        let data;
        try {
            const response = await fetch(filePath);
            data = await response.text();
        } catch (err) {
            return console.error(`MapBorder.#loadLinesFromFile(${`filePath`}) failed with error: ${err}`);
        }

        // Split into 2D array of lines and their tiles
        const lines = data.split('\n');
        for (let i = 0; i < lines.length; i++) {
            lines[i] = lines[i].split('');
        }
        
        return lines;
    }
}

export class GameMap {
    static #packagePath = '../maps/';
    #center;
    name;
    startPosition;

    // dimension are overridden if lines is supplied
    // info must be an object
    constructor(width = 0, height = 0, lines, border = new MapBorder(), info) {
        if (lines && lines.length && lines[0].length) {
            this.lines = lines;
            this.height = lines.length;
            this.width = lines[0].length;
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
            if (info.name) {
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

    static async #loadInfoFromFile(filePath) {
        try {
            const file = await import(filePath);
            return file.data;
        } catch(err) {
            console.error(`Couldn't open file "${filePath}": ${err}`);
        }
    }

    static async loadFromFile(filePath, borderFilePath, infoFilePath) {
        if (!filePath) { return console.error(`Must provide a file path to use GameMap.loadFromFile.`); }

        const lines = await this.#loadLinesFromFile(filePath);

        let border;
        if (borderFilePath) {
            border = await MapBorder.loadFromFile(borderFilePath);
        }

        // let info;
        // if (infoFilePath) {
        //     try {
        //         const infoFile = await import(infoFilePath);
        //         info = infoFile.data;
        //     } catch(err) {
        //         console.error(`Couldn't open file "${infoFilePath}": ${err}`);
        //     }
        // }
        const info = await this.#loadInfoFromFile(infoFilePath);

        return this.createFromLines(lines, border, info);
    }

    // static async loadFromPackage(pkgName, infoOnly) {
    static loadFromPackage(pkgName, infoOnly) {
        if (!pkgName) { return console.error(`Must provide a package name to use GameMap.loadFromPackage.`); }

        // "advised to access private static props thru class NAME"
        const prefix = GameMap.#packagePath + pkgName + '/';
        const infoFilePath = prefix + 'info.js'
        if (infoOnly) {
            return this.#loadInfoFromFile(infoFilePath);
        } else {
            const filePath = prefix + 'map';
            const borderFilePath = prefix + 'border';
            // return this.loadFromFile(filePath, borderFilePath, infoFilePath);
            return this.loadFromFile(filePath, borderFilePath, infoFilePath);
        }
    }

    // static async loadInfoFromPackage(pkgName) {
    static loadInfoFromPackage(pkgName) {
        if (!pkgName) { return console.error(`Must provide a package name to use GameMap.loadInfoFromPackage.`); }
        return this.loadFromPackage(pkgName, true);
    }

    static async #loadLinesFromFile(filePath) {
        let data;
        try {
            const response = await fetch(filePath);
            data = await response.text();
        } catch (err) {
            return console.error(`GameMap.#loadLinesFromFile(${`filePath`}) failed with error: ${err}`);
        }

        // Split into 2D array of lines and their tiles
        const lines = data.split('\n');
        for (let i = 0; i < lines.length; i++) {
            lines[i] = lines[i].split('');
        }
        
        return lines;
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
                    character = '.';
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