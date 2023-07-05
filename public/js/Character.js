// abstract
class Character {
    move() {}
}

import { Direction, Surroundings } from './Direction.js';
export class Player extends Character {
    position;
    surroundings = new Surroundings();

    move(direction) {
        switch (direction) {
            case Direction.Up: {
                return this.position.line--;
            }
            case Direction.Down: {
                return this.position.line++;
            }
            case Direction.Left: {
                return this.position.column--;
            }
            case Direction.Right: {
                return this.position.column++;
            }
            default: {
                console.warn(`Player.move() default case was triggered (should never happen).`);
            }
        }
    }
}

import { Coordinate } from './Map.js';
export class RemotePlayer extends Player {
    // Private properties aren't inherited
    // (but we got rid of them all)
    wasInView = true;
    
    constructor(id, position) {
        // super must be called
        super();
        this.id = id;
        if (!position) {
            position = new Coordinate(-1, -1);
        }
        this.position = position;
    }
    static fromJson(json) {
        const position = Coordinate.fromObject(json.positionOnMap);
        return new this(
            json.userId,
            position
        )
    }
}