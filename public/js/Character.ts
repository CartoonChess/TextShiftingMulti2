import '../../ConsoleColor.js'

// class Character {
interface Character {
    move(destination: Coordinate): void
}

import { Coordinate } from './GameMap.js'
import { Direction, Surroundings } from './Direction.js'

// export class Player extends Character {
export class Player implements Character {
    // Default position so it's never undefined
    position = new Coordinate(0, 0)
    // #position;
    surroundings = new Surroundings()
    
    #shiftPosition(direction: Direction) {
        switch (direction) {
            case Direction.Up: {
                return this.position.line--
            }
            case Direction.Down: {
                return this.position.line++
            }
            case Direction.Left: {
                return this.position.column--
            }
            case Direction.Right: {
                return this.position.column++
            }
            default: {
                console.warn(`Player.move() default case was triggered (should never happen).`)
            }
        }
    }

    #warpTo(coordinate: Coordinate) {
        // this.position.line = coordinate.line
        // this.position.column = coordinate.column
        // this.position = { ...coordinate }
        // Deep copy
        this.position = Coordinate.fromObject(coordinate)
    }

    move(destination: Direction | Coordinate) {
        // // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof
        // const className = destination?.constructor?.name
        
        // if (className === 'Direction') {
        //     this.#shiftPosition(destination)
        // } else if (className === 'Coordinate') {
        //     this.#warpTo(destination)
        // } else {
        //     console.error('Character.move() must be passed a Direction or a Coordinate.')
        // }
        // if (typeof destination === Direction) {
        if (destination instanceof Direction) {
            this.#shiftPosition(destination)
        } else {
            this.#warpTo(destination)
        }
    }
}

// FIXME: This probably isn't exposed by express
// - And also should be its own separate file as the client shouldn't know how the store works
import { Session } from '../../sessionStore.js'

export class RemotePlayer extends Player {
    id
    mapName
    wasInView = true
    // WARN: JS already has a Symbol type
    // symbol = '%'
    
    constructor(id: string, mapName: string, position: Coordinate) {
        super() // required
        this.id = id
        this.mapName = mapName
        this.position = position
    }
    // FIXME: Interface/type alias needed here?
    static fromJson(json: Session) {
        const position = Coordinate.fromJson(json.positionOnMap)
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