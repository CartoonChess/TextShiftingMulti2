import MessageLog from './js/MessageLog.js';
const log = new MessageLog(document.getElementById('message-log'), true);

const solidCharacter = '#'; // emojis freak out, prob because not one char

// Map and view
import { Direction, Surroundings } from './js/Direction.js';
import { Coordinate, Map, View } from './js/Map.js';
const view = new View(9, 9);
const map = new Map(29, 29);
map.generateTestMap(view.width, view.height, solidCharacter);
view.map = map;

// TODO: Stop using these
const leftBound = Math.floor(view.width / 2) - 1;
const rightBound = map.width - leftBound - 1;
const topBound = Math.floor(view.height / 2) - 1;
const bottomBound = map.height - topBound - 1;

import { Player, RemotePlayer } from './js/Character.js';
const player = new Player();
// TODO: This position should be set differently
player.position = map.center;
const remotePlayers = [];

import GameSocket from './js/GameSocket.js';
const socket = new GameSocket(log, view, player, remotePlayers);
socket.listen();

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

document.addEventListener('keydown', function(event) {
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
// simulateRemotePlayers(); // fails as soon as socket connects - see Character.js
updateView();
socket.broadcastMove();

// Mobile - currently disabled
// import './mobile.js';