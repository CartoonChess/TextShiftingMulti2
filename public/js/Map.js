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

export class View {
    mapCenter;
    localCenter;
    #left;
    #right;
    #top;
    #bottom;
    
    constructor(width, height, mapCenter) {
        this.width = width;
        this.height = height;
        this.mapCenter = mapCenter;
        this.localCenter = new Coordinate(
            Math.floor(this.width / 2),
            Math.floor(this.height / 2)
        );
    }

    get left() {
        return this.mapCenter.column - Math.floor(this.width / 2);
    }
    get right() {
        return this.mapCenter.column + Math.floor(this.width / 2);
    }
    get top() {
        return this.mapCenter.line - Math.floor(this.height / 2);
    }
    get bottom() {
        return this.mapCenter.line + Math.floor(this.height / 2);
    }
    
    isVisible(tile, mapCenter) {
        if (mapCenter) { this.mapCenter = mapCenter; }
        const isInXView = tile.position.column >= this.left && tile.position.column <= this.right;
        const isInYView = tile.position.line >= this.top && tile.position.line <= this.bottom;
        return isInXView && isInYView;
    }
}