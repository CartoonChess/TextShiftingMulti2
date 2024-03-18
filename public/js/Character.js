var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Player_instances, _Player_shiftPosition, _Player_warpTo;
import '../../ConsoleColor.js';
import { Coordinate } from './GameMap.js';
import { Direction, Surroundings } from './Direction.js';
// export class Player extends Character {
export class Player {
    constructor() {
        _Player_instances.add(this);
        // Default position so it's never undefined
        this.position = new Coordinate(0, 0);
        // #position;
        this.surroundings = new Surroundings();
    }
    move(destination) {
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
            __classPrivateFieldGet(this, _Player_instances, "m", _Player_shiftPosition).call(this, destination);
        }
        else {
            __classPrivateFieldGet(this, _Player_instances, "m", _Player_warpTo).call(this, destination);
        }
    }
}
_Player_instances = new WeakSet(), _Player_shiftPosition = function _Player_shiftPosition(direction) {
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
}, _Player_warpTo = function _Player_warpTo(coordinate) {
    // this.position.line = coordinate.line
    // this.position.column = coordinate.column
    // this.position = { ...coordinate }
    // Deep copy
    this.position = Coordinate.fromObject(coordinate);
};
export class RemotePlayer extends Player {
    // WARN: JS already has a Symbol type
    // symbol = '%'
    constructor(id, mapName, position) {
        super(); // required
        this.wasInView = true;
        this.id = id;
        this.mapName = mapName;
        this.position = position;
    }
    // static fromJson(json: Session) {
    static fromJson(json) {
        const position = Coordinate.fromJson(json.positionOnMap);
        return new this(json.userId, json.gameMap, position);
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
