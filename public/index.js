import MessageLog from './js/MessageLog.js';
const log = new MessageLog(document.getElementById('message-log'), true);

const solidCharacter = '#'; // emojis freak out, prob because not one char

// Map and view
import { Direction, Surroundings } from './js/Direction.js';
import { Coordinate, Map, View } from './js/Map.js';

// const view = new View(9, 9);
const view = new View(11, 11);
const map = new Map(29, 29);
// map.generateTestMap(view.width, view.height, solidCharacter);
await map.loadFromFile('./maps/29x29');
view.map = map;

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
    if (character.surroundings.at(direction) != solidCharacter) {
        character.move(direction);
        updateView();
        socket.broadcastMove();
    }
}

document.addEventListener('keydown', function(event) {
    if (['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'].includes(event.key)) {
        // remove 'Arrow' from keypress to get corresponding direction enum
        moveIfAble(player, Direction[event.key.slice(5)])
    }
});

// First load
// simulateRemotePlayers(); // fails as soon as socket connects - see Character.js
updateView();
socket.broadcastMove();

// Mobile - currently disabled
// import './mobile.js';