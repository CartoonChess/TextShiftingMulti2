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

class MapBorder {
    // TODO: Error handling
    // TODO: creating directly from constructor
    constructor(lines = [[' ']]) {
        this.lines = lines;
        this.height = lines.length;
        this.width = lines[0].length;
    }

    // currently redundant
    // static createFromLines(lines) {
    //     return new this(lines);
    // }

    // TODO: Make this not redundant from Map method
    static async createFromFile(filePath) {
        if (!filePath) { return console.error(`Must provide a file path to use MapBorder.createFromFile.`); }

        const lines = await this.#loadLinesFromFile(filePath);
        // return this.createFromLines(lines);
        return new this(lines);
    }

    // TODO: Make this not redundant from Map method
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

export class Map {
    static #packagePath = '../maps/';
    #center;
    startPosition;

    // dimension are overridden if lines is supplied
    // info should be an object
    constructor(width = 0, height = 0, lines, border = new MapBorder(), info) {
        if (lines && lines.length && lines[0].length) {
            this.lines = lines;
            this.height = lines.length;
            // this.width = lines[0].length ? lines[0].length : 1;
            this.width = lines[0].length;
        } else {
            // If there's no lines data or it seems improperly formatted
            this.lines = Map.#generateBlankLines(width, height);
            this.width = width;
            this.height = height;
        }
        // If border is a 2D array rather than object, create object first
        if (Array.isArray(border)) {
            this.border = new MapBorder(border);
        } else {
            this.border = border;
        }

        this.#center = new Coordinate(
            Math.floor(this.width / 2),
            Math.floor(this.height / 2)
        );

        // Can't check info.* immediately, or total failure
        // console.log('constructor');
        // if (info) {
        //     console.log('info');
        //     // startPosition defaults to center
        //     if (info.startPosition) {
        //         console.log('O sP');
        //         this.startPosition = info.startPosition;
        //     } else {
        //         console.log('X sP');
        //         this.startPosition = this.#center;
        //     }
        // }
        console.log('constructor');
        if (info && info.startPosition) {
            console.log('O sP');
            this.startPosition = Coordinate.fromObject(info.startPosition);
        } else {
            console.log('X sP');
            this.startPosition = this.#center;
        }
    }

    static #generateBlankLines(width, height) {
        const lines = new Array(height);
        for (let y = 0; y < height; y++) {
            lines[y] = new Array(width).fill(' ');
        }
        return lines;
    }

    static createBlank(width, height) {
        return new this(width, height, Map.#generateBlankLines(width, height));
    }

    static createFromLines(lines, border, info) {
        return new this(undefined, undefined, lines, border, info);
    }

    static async createFromFile(filePath, borderFilePath, infoFilePath) {
        if (!filePath) { return console.error(`Must provide a file path to use Map.createFromFile.`); }

        const lines = await this.#loadLinesFromFile(filePath);

        let border;
        if (borderFilePath) {
            const border = await MapBorder.createFromFile(borderFilePath);
        }

        let info;
        if (infoFilePath) {
            try {
                // const info = await import(infoFilePath);
                // // console.log(info.map);
                // console.log(info.startPosition);
                // console.log(info);
                const infoFile = await import(infoFilePath);
                // console.log(info.data);
                // console.log(info.data.startPosition);
                info = infoFile.data;
            } catch(err) {
                console.error(`Couldn't open file "${infoFilePath}": ${err}`);
            }
        }

        // if (borderFilePath) {
        //     const border = await MapBorder.createFromFile(borderFilePath);
        //     return new this(undefined, undefined, lines, border);
        // } else {
        //     return this.createFromLines(lines);
        // }
        
        // return new this(undefined, undefined, lines, border, info);
        return this.createFromLines(lines, border, info);
    }

    static async createFromPackage(pkgName) {
        if (!pkgName) { return console.error(`Must provide a package name to use Map.createFromPackage.`); }

        // "advised to access private static props thru class NAME"
        const prefix = Map.#packagePath + pkgName + '/';
        const filePath = prefix + 'map';
        const borderFilePath = prefix + 'border';
        const infoFilePath = prefix + 'info.js'
        
        return this.createFromFile(filePath, borderFilePath, infoFilePath);
    }

    static async #loadLinesFromFile(filePath) {
        let data;
        try {
            const response = await fetch(filePath);
            data = await response.text();
        } catch (err) {
            return console.error(`Map.#loadLinesFromFile(${`filePath`}) failed with error: ${err}`);
        }

        // Split into 2D array of lines and their tiles
        const lines = data.split('\n');
        for (let i = 0; i < lines.length; i++) {
            lines[i] = lines[i].split('');
        }
        
        return lines;
    }

    static createTestMap(view, width = view.width * 2, height = view.height * 2, boundCharacter = '#', border) {
        if (!view) { return console.warn(`Can't call Map.createTestMap without providing view argument.`); }
        
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
        return this.createFromLines(lines, border);
    }

    get center() {
        return this.#center;
    }
}