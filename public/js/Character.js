import '../../ConsoleColor.js';

// abstract
class Character {
    move() {}
}

import { Direction, Surroundings } from './Direction.js';
export class Player extends Character {
    position;
    // #position;
    surroundings = new Surroundings();
    
    #shiftPosition(direction) {
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

    #warpTo(coordinate) {
        this.position.line = coordinate.line;
        this.position.column = coordinate.column;
    }

    move(destination) {
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof
        const className = destination?.constructor?.name;
        // if (typeof className === 'string' && className !== '') {
        //     return className;
        // }
        
        if (className === 'Direction') {
            this.#shiftPosition(destination);
        } else if (className === 'Coordinate') {
            this.#warpTo(destination)
        } else {
            console.error('Character.move() must be passed a Direction or a Coordinate.');
        }
    }

    // // TODO: remove these DEBUG funcs
    // get position() {
    //     console.debug(`Player.position (get): ${this.#position}.`);
    //     return this.#position;
    // }
    // set position(coord) {
    //     console.debug(`Player.position (set): ${this.#position} -> ${coord}.`);
    //     this.#position = coord;
    // }
}

import { Coordinate } from './GameMap.js';
export class RemotePlayer extends Player {
    // Private properties aren't inherited
    // (but we got rid of them all)
    mapName;
    wasInView = true;
    // WARN: JS already has a Symbol type
    // symbol = '%';
    
    constructor(id, mapName, position) {
        // super must be called
        super();
        this.id = id;

        this.mapName = mapName;
        // if (!position) {
        //     // TODO: Won't this actually show up in the border now?
        //     position = new Coordinate(-1, -1);
        // }
        this.position = position;
    }
    static fromJson(json) {
        const position = Coordinate.fromJson(json.positionOnMap);
        return new this(
            json.userId,
            json.gameMap,
            position
        )
    }
}


// old code for simulating remote players
// repurpose later for NPCs etc

// import { RandomBytes } from './randomBytes.js';

// function simulateRemotePlayers() {
//     const randomBytes = new RandomBytes();
//     const randomId = () => randomBytes.hex(16);

//     const randomOffset = () => Math.floor(Math.random() * 5 - Math.ceil(2));
//     const numberOfPlayers = Math.floor(Math.random() * (Math.floor(5) - Math.ceil(2) + 1) + Math.ceil(2));

//     for (let i = 0; i < numberOfPlayers; i++) {
//         const remotePlayer = new RemotePlayer(
//             randomId(),
//             new Coordinate(
//                 player.position.column + randomOffset(),
//                 player.position.line + randomOffset(),
//             )
//         );
//         remotePlayers.push(remotePlayer);
//     }

//     remotePlayers.forEach(remotePlayer => simulateRemotePlayerMovement(remotePlayer));
// }

// function simulateRemotePlayerMovement(remotePlayer) {
//     const randomDirection = () => Math.floor(Math.random() * 4);
//     const randomDelay = () => Math.floor(Math.random() * (Math.floor(2000) - Math.ceil(200) + 1) + Math.ceil(200));

//     var loop = function() {
//         const newPosition = remotePlayer.position;
//         switch (Direction.fromInt(randomDirection())) {
//             case Direction.Left: {
//                 newPosition.column--;
//                 break;
//             }
//             case Direction.Right: {
//                 newPosition.column++;
//                 break;
//             }
//             case Direction.Down: {
//                 newPosition.line++;
//                 break;
//             }
//             default: {
//                 newPosition.line--;
//             }
//         }
//         remotePlayer.position = newPosition;
//         if (remotePlayer.wasInView || remotePlayer.isInView) {
//             updateView();
//         }
//         setTimeout(loop, randomDelay());
//     }
//     setTimeout(loop, randomDelay());
// }