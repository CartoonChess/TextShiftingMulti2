import { Direction, Surroundings } from './js/Direction.js';
import { Coordinate, Map, View } from './js/Map.js';

import { Player, RemotePlayer } from './js/Character.js';

import MessageLog from './js/MessageLog.js';
const log = new MessageLog(document.getElementById('message-log'), true);

// Map and view bounds
const map = new Map(29, 29);
// const map = new Map('29x29');
const view = new View(9, 9, map.center);
const leftBound = Math.floor(view.width / 2) - 1;
const rightBound = map.width - leftBound - 1;
const topBound = Math.floor(view.height / 2) - 1;
const bottomBound = map.height - topBound - 1;

const solidCharacter = '#'; // emojis freak out, prob because not one char

// function generateArrays(width, height) {
// // function generateArrays(width, height, topBound, bottomBound) {
//     // Build walls around player acessible area
//     // TODO: Someday we'll provide for when the map is smaller than the view
//     const boundCharacter = '#';
    
//     const lines = [];

//     for (let y = 0; y < height; y++) {
//         if (y === topBound || y === bottomBound) {
//             lines.push(Array(width).fill(boundCharacter));
//             continue;
//         }
//         const line = [];
//         for (let x = 0; x < width; x++) {
//             if (x === leftBound || x === rightBound) {
//                 line.push(boundCharacter);
//                 continue;
//             }
//             const randomNumber = Math.random();
//             let character;

//             if (randomNumber < 0.65) {
//                 character = ' ';
//             } else if (randomNumber < 0.8) {
//                 character = '.';
//             } else if (randomNumber < 0.95) {
//                 character = ',';
//             } else if (randomNumber < 0.99) {
//                 character = solidCharacter;
//             } else {
//                 character = '~';
//             }

//             line.push(character);
//         }
//         lines.push(line);
//     }
    
//     return lines;
// }

// Full map
// const arrays = generateArrays(map.width, map.height);
// TODO: We can probably get rid of this after map obj contains arrays
// view.arrays = arrays;
view.arrays = map.lines;

// var textUpdateCount = 0;

const player = new Player();
player.position = map.center;
const remotePlayers = [];

import GameSocket from './js/GameSocket.js';
const socket = new GameSocket(log, view, player, remotePlayers);
socket.listen();

import { RandomBytes } from './randomBytes.js';

function simulateRemotePlayers() {
    const randomBytes = new RandomBytes();
    const randomId = () => randomBytes.hex(16);
    
    const randomOffset = () => Math.floor(Math.random() * 5 - Math.ceil(2));
    const numberOfPlayers = Math.floor(Math.random() * (Math.floor(5) - Math.ceil(2) + 1) + Math.ceil(2));
    
    for (let i = 0; i < numberOfPlayers; i++) {
        const remotePlayer = new RemotePlayer(
            randomId(),
            new Coordinate(
                player.position.column + randomOffset(),
                player.position.line + randomOffset(),
            )
        );
        remotePlayers.push(remotePlayer);
    }

    remotePlayers.forEach(remotePlayer => simulateRemotePlayerMovement(remotePlayer));
}

function simulateRemotePlayerMovement(remotePlayer) {
    const randomDirection = () => Math.floor(Math.random() * 4);
    const randomDelay = () => Math.floor(Math.random() * (Math.floor(2000) - Math.ceil(200) + 1) + Math.ceil(200));
    
    var loop = function() {
        const newPosition = remotePlayer.position;
        switch (Direction.fromInt(randomDirection())) {
            case Direction.Left: {
                newPosition.column--;
                break;
            }
            case Direction.Right: {
                newPosition.column++;
                break;
            }
            case Direction.Down: {
                newPosition.line++;
                break;
            }
            default: {
                newPosition.line--; 
            }
        }
        remotePlayer.position = newPosition;
        if (remotePlayer.wasInView || remotePlayer.isInView) {
            updateView();
        }
        setTimeout(loop, randomDelay());
    }
    setTimeout(loop, randomDelay());
}

function updateView() {
    view.update(player, remotePlayers);
}

function moveIfAble(character, direction) {
    var canMove = false;
    switch (direction) {
        case Direction.Up: {
            canMove = character.position.line > topBound + 1 > 0 && character.surroundings.up != solidCharacter;
            break;
        }
        case Direction.Down: {
            canMove = character.position.line < bottomBound - 1 && character.surroundings.down != solidCharacter;
            break;
        }
        case Direction.Left: {
            canMove = character.position.column > leftBound + 1 > 0 && character.surroundings.left != solidCharacter;
            break;
        }
        case Direction.Right: {
            canMove = character.position.column < rightBound - 1 && character.surroundings.right != solidCharacter;
            break;
        }
        default: {
            // this should never happen
        }
    }
    if (canMove) {
        character.move(direction);
        updateView();
        socket.broadcastMove();
    }
}

document.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowRight') {
        moveIfAble(player, Direction.Right)
    } else if (event.key === 'ArrowLeft') {
        moveIfAble(player, Direction.Left);
    } else if (event.key === 'ArrowUp') {
        moveIfAble(player, Direction.Up);
    } else if (event.key === 'ArrowDown') {
        moveIfAble(player, Direction.Down);
    }
});

// First load
// simulateRemotePlayers(); // fails as soon as socket connects
updateView();
socket.broadcastMove();

// Mobile

// Ignore swipes so page won't move
// Except this doesn't actually work
// document.addEventListener("touchmove", function (event) {
//     event.codeventDefault();
// });

// Now the actual swipes
// Unfortunately Y isn't doing anything

var initialX = null;
var initialY = null;

document.addEventListener("touchstart", function (event) {
    initialX = event.touches[0].clientX;
    initialY = event.touches[0].clientY;
});

document.addEventListener("touchend", function (event) {
    if (initialX !== null) {
        var currentX = event.changedTouches[0].clientX;
        var deltaX = currentX - initialX;
        if (deltaX < 0) {
            movePlayer(Direction.Left);
        } else if (deltaX > 0) {
            movePlayer(Direction.Right);
        }
        initialX = null;
    }
    if (initialY !== null) {
        var currentY = event.changedTouches[0].clientY;
        var deltaY = currentY - initialY;
        if (deltaY < 0) {
            movePlayer(Direction.Down);
        } else if (deltaY > 0) {
            movePlayer(Direction.Up);
        }
        initialY = null;
    }
});