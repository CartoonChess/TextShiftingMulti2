import MessageLog from './js/MessageLog.js';
const log = new MessageLog(document.getElementById('message-log'), true);
log.print('Loading...');

const solidCharacter = '#'; // emojis freak out, prob because not one char

// Game controller
// Will hopefully do more some day
import Game from '../js/Game.js';
const game = new Game();

// Map and view
import { GameMap } from './js/GameMap.js';
import { View } from './js/View.js';
const view = new View(45, 23);
view.map = await GameMap.loadFromPackage(game.defaultMapPackage);

import { Player } from './js/Character.js';
const player = new Player();
// Will be overwritten if session data is found
player.position = view.map.startPosition;

const remotePlayers = [];

import GameSocket from './js/GameSocket.js';
const socket = new GameSocket(log, view, player, remotePlayers);
socket.listen();

function updateView() {
    // TODO: Maybe this should take an { object } instead, so we can pass whatever comes up
    view.update(player, remotePlayers);
}

function changeMap(pkgName) {
    log.print('WARP ZONE');
    view.map = GameMap.createTestMap(view, 18, 12, '#', [['?']]);
    // Blank out surroundings in case we land OOB
    player.surroundings.clear();
    player.surroundings.update(player.position, view.map);
}

function moveIfAble(character, direction) {
    // TODO: Better to have some game-wide "no input" flag
    // Maybe we ought to have a Game object...
    if (!socket.isReadyForView) { return; }
    
    if (character.surroundings.at(direction) != solidCharacter) {
        character.move(direction);
        player.surroundings.update(player.position, view.map);

        // TODO: Specify by coord instead (maps/../info.js); incl. destination
        if (player.surroundings.here === 'D') {
            changeMap('pkgname');
        }
        
        updateView();
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