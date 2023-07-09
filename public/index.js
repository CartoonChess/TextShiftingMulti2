import MessageLog from './js/MessageLog.js';
const log = new MessageLog(document.getElementById('message-log'), true);

const solidCharacter = '#'; // emojis freak out, prob because not one char

// Map and view
import { Map } from './js/Map.js';
import { View } from './js/View.js';

const view = new View(11, 11);
// const map = Map.createTestMap(view, 0, 0, '~', [['?']]);
// const map = await Map.createFromPackage('test1');
// const map = new Map(5, 5);
const map = new Map(7, 7, [], [['?']]);
view.map = map;

import { Player } from './js/Character.js';
const player = new Player();
// TODO: This position should be set differently
// player.position = map.center;
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

// First load
// simulateRemotePlayers(); // fails as soon as socket connects - see Character.js
updateView();
// socket.broadcastMove();

import { Direction } from './js/Direction.js';
document.addEventListener('keydown', function(event) {
    if (['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'].includes(event.key)) {
        // remove 'Arrow' from keypress to get corresponding direction enum
        moveIfAble(player, Direction[event.key.slice(5)])
    }
});

// Mobile - currently disabled
// import './mobile.js';