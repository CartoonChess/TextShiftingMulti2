import { Direction, Surroundings } from './js/Direction.js';
import { Coordinate, Map, View } from './js/Map.js';

import { Player, RemotePlayer } from './js/Character.js';

import MessageLog from './js/MessageLog.js';
const log = new MessageLog(document.getElementById('message-log'), true);

// // Get player set up for remote connection
// // Using default URL param
// const socket = io(window.location.host, { autoConnect: false });
// //socket.auth = { username: "joe" };

// // `localStorage` is a property of browser `window`
// const sessionId = localStorage.getItem('sessionId');
// if (sessionId) {
//     socket.auth = { sessionId };
//     log.print(`had seshId ${sessionId}.`)
// }

// // Not in the tutorial but
// // let's just try connecting down here instead
// socket.connect();

// // Get session ID, whether new or returning
// socket.on('session', ({ sessionId, userId }) => {
//     // 'attach sessionId to next reconnection attempts'
//     socket.auth = { sessionId };
//     // Store in browser's localStorage
//     localStorage.setItem('sessionId', sessionId);
//     // Save (public) userId
//     socket.userId = userId;
//     // socket.positionOnMap = positionOnMap;
//     log.print(`got userId ${socket.userId}.`);
// });

// socket.on('connect_error', (err) => {
//     var errorMessage = '(unknown error)';
//     if (err.message) { errorMessage = err.message; }
//     log.print(`ERROR: [Socket.io]: ${errorMessage}.`);
// });

// // socket.on('self connected', (id) => {
// //     log.print(`You're in (ID: ${id}).`);
// // });

// var socketConnectCount = 0;
// socket.on('connect', () => {
//     socketConnectCount++;
//     log.print(`Socket connect count: ${socketConnectCount}.`);
// });

// var socketDisonnectCount = 0;
// socket.on('disconnect', (reason) => {
//     socketDisonnectCount++;
//     log.print(`Socket disconnect count: ${socketDisonnectCount}. Reason: ${reason}.`);
// });

// // Get already-connected users when joining
// // socket.on('users'...
// socket.on('all players', (allPlayers) => {
//     // Let's just replace the old data and get in sync w/ server
//     remotePlayers.length = 0;
//     allPlayers.forEach((json) => {
//         const remotePlayer = RemotePlayer.fromJson(json);
//         log.print(`found player (id ${remotePlayer.id}, position ${remotePlayer.position}`);
//         // Only add if it's not ourself
//         if (remotePlayer.id !== socket.userId) {
//             remotePlayers.push(remotePlayer);
//         }
//     });
//     log.print(`number of remote players: ${remotePlayers.length}`);
//     updateText();
// });

// // Get new users who join after you
// // socket.on('user connected'...
// // socket.on('other connected', ({ userId, positionOnMap }) => {
// socket.on('other connected', (remotePlayerJson) => {
//     const remotePlayer = RemotePlayer.fromJson(remotePlayerJson);
//     log.print(`Friend's in (ID: ${remotePlayer.id}).`);
//     if (remotePlayer.id === socket.userId) { return; }
//     // Only add if it's a new player, not a second session
//     for (const existingPlayer of remotePlayers) {
//         if (remotePlayer.id === existingPlayer.id) { return; }
//     }
//     remotePlayers.push(remotePlayer);
// });

// // Only happens when remote user ends all sessions
// socket.on('other disconnected', (userId) => {
//     log.print(`userId ${userId} left.`);
//     for (let i = 0; i < remotePlayers.length; i++) {
//         if (remotePlayers[i].id === userId) {
//             remotePlayers.splice(i, 1);
//         }
//     }
//     updateText();
// });

// // socket.on('private message'...
// socket.on('move', ({ userId, positionOnMap }) => {
//     const position = Coordinate.fromJson(positionOnMap);
    
//     // If you moved in one tab, update all your tabs
//     if (userId === socket.userId) {
//         player.position = position;
//         return updateText();
//     }

//     // Otherwise, let's see which remote user moved
//     for (let i = 0; i < remotePlayers.length; i++) {
//         if (remotePlayers[i].id === userId) {
//             remotePlayers[i].position = position;
//             const isInView = view.isVisible(remotePlayers[i]);
//             if (remotePlayers[i].wasInView || isInView) {
//                 updateText();
//             }
//             remotePlayers[i].wasInView = isInView;
//         }
//     }
// });

// Map and view bounds
const map = new Map(29, 29);
const view = new View(9, 9, map.center);
const leftBound = Math.floor(view.width / 2) - 1;
const rightBound = map.width - leftBound - 1;
const topBound = Math.floor(view.height / 2) - 1;
const bottomBound = map.height - topBound - 1;

const solidCharacter = '#'; // emojis freak out, prob because not one char

// function generateArrays(width, height) {
function generateArrays(width, height, topBound, bottomBound) {
    // Build walls around player acessible area
    // TODO: Someday we'll provide for when the map is smaller than the view
    const boundCharacter = '#';
    
    const lines = [];

    for (let y = 0; y < height; y++) {
        if (y === topBound || y === bottomBound) {
            lines.push(Array(width).fill(boundCharacter));
            continue;
        }
        const line = [];
        for (let x = 0; x < width; x++) {
            if (x === leftBound || x === rightBound) {
                line.push(boundCharacter);
                continue;
            }
            const randomNumber = Math.random();
            let character;

            if (randomNumber < 0.65) {
                character = ' ';
            } else if (randomNumber < 0.8) {
                character = '.';
            } else if (randomNumber < 0.95) {
                character = ',';
            } else if (randomNumber < 0.99) {
                character = solidCharacter;
            } else {
                character = '~';
            }

            line.push(character);
        }
        lines.push(line);
    }
    
    return lines;
}

// Full map
const arrays = generateArrays(map.width, map.height);
// TODO: We can probably get rid of this after map obj contains arrays
view.arrays = arrays;

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
            updateText();
        }
        setTimeout(loop, randomDelay());
    }
    setTimeout(loop, randomDelay());
}

// function replaceCharAt(index, chr, str) {
//     // If called as a func of string, operate on copy of String itself
//     if (!str) {str = this;}
//     if (index > str.length - 1) return str;
//     return str.substring(0, index) + chr + str.substring(index + 1);
// }
// // Add this as a method on String
// String.prototype.replaceCharAt = replaceCharAt;

// import './String_prototype.js';

// function updateText() {
//     view.mapCenter = player.position;
//     const lines = [];
//     // Generate map lines and local player
//     for (let i = 0; i < view.height; i++) {
//         var lineIndex = view.top + i;
//         lines[i] = arrays[lineIndex].slice(view.left, view.left + view.width).join('');
//         // Show @char at centre of both axes
//         if (i === view.localCenter.line) {
//             lines[i] = lines[i].replaceCharAt(view.localCenter.column, '@');
//         }
//     }
//     // Add in remote players
//     for (const remotePlayer of remotePlayers) {
//         if (view.isVisible(remotePlayer)) {
//             lineIndex = remotePlayer.position.line - view.top;
//             const columnIndex = remotePlayer.position.column - view.left;
//             lines[lineIndex] = lines[lineIndex].replaceCharAt(columnIndex, '%');
//         }
//     }
//     // Print to screen
//     for (let i = 0; i < view.height; i++) {
//         document.getElementById(`line${i}`).textContent = lines[i];
//     }
//     // Used to determine whether player can move again
//     // TODO: We should do this at time of move instead
//     player.surroundings.update(player.position, arrays);
// }

function updateText() {
    // view.update(arrays, player, remotePlayers);
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
        updateText();
        socket.broadcastMove();
    }
}

// TODO: Move these into GameSocket maybe

// // Send position to other players
// function broadcastMove() {
//     // Should this be broadcast/other instead? Can it be?
//     socket.emit('move', player.position.toJson());
// }

// function pingServer() {
//     const start = Date.now();
//     socket.emit('latency', () => {
//         const duration = Date.now() - start;
//         return duration;
//     });
// }

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
updateText();
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