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

// TODO: Work global logic in here
export class Map {
    #center;
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
    get center() {
        return new Coordinate(
            Math.floor(this.width / 2),
            Math.floor(this.height / 2)
        );
    }
}