export class Direction {
    static Up = new this('up');
    static Down = new this('down');
    static Left = new this('left');
    static Right = new this('right');

    constructor(name) {
        this.name = name;
    }
    static fromInt(num) {
        switch (num) {
            case 1: { return this.Right; }
            case 2: { return this.Down; }
            case 3: { return this.Left; }
            default: { return this.Up; }
        }
    }
    toString() {
        return this.name;
    }
}

export class Surroundings {
    constructor(coordinate, map) {
        if (coordinate && map) {
            this.update(coordinate, map);
        } else {
            this.clear();
        }
    }

    clear() {
        this.here = ' ';
        this.up = ' ';
        this.down = ' ';
        this.left = ' ';
        this.right = ' ';
    }
    
    update(coordinate, map) {
        const x = coordinate.column;
        const y = coordinate.line;

        // // If OOB somehow, don't change anything
        // if (x < 0 || y < 0
        //    || y >= map.lines.length
        //    || x >= map.lines[y].length) { return; }
        // If OOB somehow, blank everything
        if (x < 0 || y < 0
           || y >= map.lines.length
           || x >= map.lines[y].length) {
            return this.clear();
        }

        // If inbounds, update 'here' and any other inbound values
        this.here = map.lines[y][x];
        
        if (y > 0) { this.up = map.lines[y - 1][x] }
        if (y < map.lines.length - 1) { this.down = map.lines[y + 1][x] }
        if (map.lines[y][x - 1]) { this.left = map.lines[y][x - 1] }
        if (map.lines[y][x + 1]) { this.right = map.lines[y][x + 1] }
    }

    // return the tile at a given direction object
    at(direction) {
        return this[direction.toString()];
    }
    
    toString() {
        return ` ${this.up} \n${this.left}${this.here}${this.right}\n ${this.down} `;
    }
}