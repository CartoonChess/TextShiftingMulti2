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
    
    update(coordinate, lines) {
        const x = coordinate.column;
        const y = coordinate.line;
        // If OOB somehow, don't return anything
        // if (x < 0 || y < 0
        //    || y >= lines.length - 1
        //    || x >= lines[y].length) { return ' ';}
        
        // this.here = lines[y][x];
        // this.up = lines[y - 1][x];
        // this.down = lines[y + 1][x];
        // this.left = lines[y][x - 1];
        // this.right = lines[y][x + 1];

        // If OOB somehow, don't change anything
        if (x < 0 || y < 0
           || y >= lines.length
           || x >= lines[y].length) { return; }

        // If inbounds, update 'here' and any other inbound values
        this.here = lines[y][x];
        console.log('made it');
        
        // this.up = lines[y - 1][x];
        if (y > 0) { this.up = lines[y - 1][x] }
        // this.down = y < lines[y].length - 1 ? lines[y + 1][x] : ' ';
        // this.down = lines[y + 1][x];
        if (y < lines[y].length - 1) { this.down = lines[y + 1][x] }
        
        if (lines[y][x - 1]) { this.left = lines[y][x - 1] }
        if (lines[y][x + 1]) { this.right = lines[y][x + 1] }
    }

    // return the tile at a given direction object
    at(direction) {
        return this[direction.toString()];
    }
    
    toString() {
        return ` ${this.up} \n${this.left}${this.here}${this.right}\n ${this.down} `;
    }
}