import '../../ConsoleColor.js'

// TODO: Consider making this a const instead
// https://www.typescriptlang.org/docs/handbook/enums.html#objects-vs-enums
export class Direction {
    static Up = new this('up')
    static Down = new this('down')
    static Left = new this('left')
    static Right = new this('right')
    static Here = new this('here')

    // name: string
    name: 'up' | 'down' | 'left' | 'right' | 'here'

    // constructor(name: string) {
    constructor(name: Direction['name']) {
        this.name = name
    }

    static fromInt(num: number) {
        switch (num) {
            case 0: { return this.Up }
            case 1: { return this.Right }
            case 2: { return this.Down }
            case 3: { return this.Left }
            default: { return this.Here }
        }
    }

    // toString(): 'up' | 'down' | 'left' | 'right' | 'here' {
    toString(): Direction['name'] {
        return this.name
    }
}

import { GameMap, Coordinate } from './GameMap.js'
import Tile from './Tile.js'

export class Surroundings {
    // static #none = [' ']

    // up = Surroundings.#none
    // down = Surroundings.#none
    // left = Surroundings.#none
    // right = Surroundings.#none
    // here = Surroundings.#none
    // up = [' ']
    // down = [' ']
    // left = [' ']
    // right = [' ']
    // here = [' ']
    up: Tile[] = []
    down: Tile[] = []
    left: Tile[] = []
    right: Tile[] = []
    here: Tile[] = []

    // #all = [
    //     this.up,
    //     this.down,
    //     this.left,
    //     this.right,
    //     this.here
    // ]

    constructor(coordinate?: Coordinate, map?: GameMap) {
        // if (coordinate && map) {
        //     this.update(coordinate, map);
        // } else {
        //     this.clear();
        // }
        if (coordinate && map) {
            this.update(coordinate, map)
        }
    }

    clear() {
        // this.here = [' ']
        // this.up = [' ']
        // this.down = [' ']
        // this.left = [' ']
        // this.right = [' ']
        this.here = []
        this.up = []
        this.down = []
        this.left = []
        this.right = []
    }
    
    update(coordinate: Coordinate, map: GameMap) {
        // Start fresh
        this.clear()
        
        const x = coordinate.column
        const y = coordinate.line
        
        // If OOB somehow, blank everything and stop
        if (x < 0 || y < 0
           || y >= map.height
           || x >= map.width) {
            return
        }

        // // If inbounds, update 'here' and any other inbound values
        for (const layer of map.lines) {
            // TODO: Should we be removing the blank ' ' first..?
            this.here.push(layer[y][x])
            
            if (y > 0) { this.up.push(layer[y - 1][x]) }
            if (y < layer.length - 1) { this.down.push(layer[y + 1][x]) }
            if (layer[y][x - 1]) { this.left.push(layer[y][x - 1]) }
            if (layer[y][x + 1]) { this.right.push(layer[y][x + 1]) }
        }
    }

    // TODO: Update to handle z axis... or simply remove. Or ask for layer?
    // Return the tile at a given direction object
    at(direction: Direction): Tile[] {
        return this[direction.toString()]
        // const directionString = direction.toString() as keyof Surroundings
        // return this[directionString]
    }

    // TODO: Consider using Array.some()
    thatInclude(property: string, direction: Direction) {
        // if (!direction) { return console.error(`Surroundings.thatInclude must be supplied a Tile property and a Direction.`); }
        const allTiles: Tile[] = this.at(direction);
        const matchingTiles: Tile[] = [];
        for (let tile of allTiles) {
            // TODO: How do we check the condition...?
            if (tile[property]) { matchingTiles.push(tile); }
        }
        return matchingTiles;
    }

    // Return true if all tiles meet condition
    areAll(property: string, direction: Direction) {
        // if (!direction) { return console.error(`Surroundings.areAll must be supplied a Tile property and a Direction.`); }
        const tiles = this.at(direction);
        for (let tile of tiles) {
            if (!tile[property]) { return false; }
        }
        return true;
    }

    // TODO: Update to show uppermost tile at each coord. Or ask for layer? Or give full details??
    toString() {
        return `\n ${this.up} \n${this.left}${this.here}${this.right}\n ${this.down} `;
    }
}