import '../../ConsoleColor.js';

export class Direction {
    static Up = new this('up');
    static Down = new this('down');
    static Left = new this('left');
    static Right = new this('right');
    static Here = new this('here');

    constructor(name) {
        this.name = name;
    }
    static fromInt(num) {
        switch (num) {
            case 0: { return this.Up; }
            case 1: { return this.Right; }
            case 2: { return this.Down; }
            case 3: { return this.Left; }
            default: { return this.Here; }
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
        // this.here = ' ';
        // this.up = ' ';
        // this.down = ' ';
        // this.left = ' ';
        // this.right = ' ';
        this.here = [' '];
        this.up = [' '];
        this.down = [' '];
        this.left = [' '];
        this.right = [' '];
    }
    
    update(coordinate, map) {
        // Start fresh
        this.clear();
        
        const x = coordinate.column;
        const y = coordinate.line;
        
        // If OOB somehow, blank everything at stop
        // if (x < 0 || y < 0
        //    || y >= map.lines.length
        //    || x >= map.lines[y].length) {
        //     return this.clear();
        // }
        if (x < 0 || y < 0
           // || y >= map.lines[0].length
           // || x >= map.lines[0][0].length) {
           || y >= map.height
           || x >= map.width) {
            return;
        }

        // // If inbounds, update 'here' and any other inbound values
        // this.here = map.lines[y][x];
        
        // if (y > 0) { this.up = map.lines[y - 1][x] }
        // if (y < map.lines.length - 1) { this.down = map.lines[y + 1][x] }
        // if (map.lines[y][x - 1]) { this.left = map.lines[y][x - 1] }
        // if (map.lines[y][x + 1]) { this.right = map.lines[y][x + 1] }
        
        // If inbounds, update 'here' and any other inbound values
        for (const layer of map.lines) {
            this.here.push(layer[y][x]);
            
            if (y > 0) { this.up.push(layer[y - 1][x]) }
            if (y < layer.length - 1) { this.down.push(layer[y + 1][x]) }
            if (layer[y][x - 1]) { this.left.push(layer[y][x - 1]) }
            if (layer[y][x + 1]) { this.right.push(layer[y][x + 1]) }
        }
    }

    // TODO: Update to handle z axis... or simply remove. Or ask for layer?
    // Return the tile at a given direction object
    at(direction) {
        return this[direction.toString()];
    }

    // TODO: How do we handle the boolean check so doInclude and areAll can both call here setting matchAll?
    // #[combines doInclude and areAll](property, direction, matchAll) {
    //     if (!direction) { console.error(`Surroundings.doInclude must be supplied a Tile property and a Direction.`); }
    //     const tiles = this.at(direction);
    //     for (let tile of tiles) {
    //         // TODO: How do we check the condition...?
    //         if (tile[property]) { return true; }
    //     }
    //     return false;
    // }

    // // Return true if at least one tile meets condition
    // doInclude(property, direction) {
    //     if (!direction) { return console.error(`Surroundings.doInclude must be supplied a Tile property and a Direction.`); }
    //     const tiles = this.at(direction);
    //     for (let tile of tiles) {
    //         // TODO: How do we check the condition...?
    //         if (tile[property]) { return true; }
    //     }
    //     return false;
    // }
    
    // Return array of all tiles that meet condition, or empty array if none
    thatInclude(property, direction) {
        if (!direction) { return console.error(`Surroundings.doInclude must be supplied a Tile property and a Direction.`); }
        const allTiles = this.at(direction);
        const matchingTiles = [];
        for (let tile of allTiles) {
            // TODO: How do we check the condition...?
            if (tile[property]) { matchingTiles.push(tile); }
        }
        return matchingTiles;
    }

    // Return true if all tiles meet condition
    areAll(property, direction) {
        if (!direction) { return console.error(`Surroundings.areAll must be supplied a Tile property and a Direction.`); }
        const tiles = this.at(direction);
        for (let tile of tiles) {
            if (!tile[property]) { return false; }
        }
        return true;
    }

    // TODO: Update to show uppermost tile at each coord. Or ask for layer? Or give full details??
    toString() {
        // return `\n ${this.up} \n${this.left}${this.here}${this.right}\n ${this.down} `;
        return `\n ${this.up} \n${this.left}${this.here}${this.right}\n ${this.down} `;
    }
}