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

    // dimension are overridden if lines is supplied
    constructor(width = 0, height = 0, lines, border = new MapBorder()) {
        console.log(lines);
        if (lines && lines.length && lines[0].length) {
            console.log('O - lines');
            this.lines = lines;
            this.height = lines.length;
            // this.width = lines[0].length ? lines[0].length : 1;
            this.width = lines[0].length;
        } else {
            console.log('X - lines');
            this.lines = Map.#generateBlankLines(width, height);
            this.width = width;
            this.height = height;
        }
        console.log(this.width, this.height);
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

    static createFromLines(lines, border) {
        return new this(undefined, undefined, lines, border);
    }

    static async createFromFile(filePath, borderFilePath) {
        if (!filePath) { return console.error(`Must provide a file path to use Map.createFromFile.`); }

        const lines = await this.#loadLinesFromFile(filePath);

        if (borderFilePath) {
            const border = await MapBorder.createFromFile(borderFilePath);
            return new this(undefined, undefined, lines, border);
        } else {
            return this.createFromLines(lines);
        }        
    }

    static async createFromPackage(pkgName) {
        if (!pkgName) { return console.error(`Must provide a package name to use Map.createFromPackage.`); }

        // "advised to access private static props thru class NAME"
        const filePath = Map.#packagePath + pkgName + '/map';
        const borderFilePath = Map.#packagePath + pkgName + '/border';
        
        return this.createFromFile(filePath, borderFilePath);
    }

    static async #loadLinesFromFile(filePath) {
        // try {
        //     const response = await import('../maps/1x1.js');
        //     console.log(response.map);
        // } catch(err) {
        //     console.log(err);
        // }
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
                    // character = solidCharacter;
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