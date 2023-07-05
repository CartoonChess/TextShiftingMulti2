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
    constructor(coordinate, lines) {
        if (coordinate && lines) {
            this.update(coordinate, lines);
        } else {
            this.here = ' ';
            this.up = ' ';
            this.down = ' ';
            this.left = ' ';
            this.right = ' ';
        }
    }
    // TODO: getters like `player.surroundings(Direction.Up)`
    update(coordinate, lines) {
        const x = coordinate.column;
        const y = coordinate.line;
        this.here = lines[y][x];
        this.up = lines[y - 1][x];
        this.down = lines[y + 1][x];
        this.left = lines[y][x - 1];
        this.right = lines[y][x + 1];
    }
    toString() {
        return ` ${this.up} \n${this.left}${this.here}${this.right}\n ${this.down} `;
    }
}