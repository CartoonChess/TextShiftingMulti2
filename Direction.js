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