import MessageLog from './js/MessageLog.js';
const log = new MessageLog(document.getElementById('message-log'), true);
log.print('Loading...');

const solidCharacter = '#'; // emojis freak out, prob because not one char

// Map and view
import { Map } from './js/Map.js';
import { View } from './js/View.js';

const view = new View(11, 11);
// const map = Map.createTestMap(view, 0, 0, '~', [['?']]);
const map = await Map.createFromPackage('test1');
// const map = new Map(5, 5);
// const map = new Map(7, 7, [], [['?']]);
view.map = map;

import { Player } from './js/Character.js';
const player = new Player();
// TODO: Map files should provide this
// player.position = map.center;
// import { Coordinate } from './js/Map.js';
// const spawnPoint = new Coordinate(1, 2);
// // I guess this will be overwritten if session data is found?
// player.position = spawnPoint;
console.log(map);
console.log(map.startPosition);
player.position = map.startPosition;

const remotePlayers = [];

import GameSocket from './js/GameSocket.js';
const socket = new GameSocket(log, view, player, remotePlayers);
socket.listen();

function updateView() {
    // TODO: Maybe this should take an { object } instead, so we can pass whatever comes up
    view.update(player, remotePlayers);
}

function moveIfAble(character, direction) {
    // TODO: Better to have some game-wide "no input" flag
    // Maybe we ought to have a Game object...
    if (!socket.isReadyForView) { return; }
    
    if (character.surroundings.at(direction) != solidCharacter) {
        character.move(direction);
        updateView();
        // player.surroundings.update(player.position, map.lines);
        player.surroundings.update(player.position, map);
        socket.broadcastMove();
    }
}

// First load
// simulateRemotePlayers(); // fails as soon as socket connects - see Character.js
// updateView();
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