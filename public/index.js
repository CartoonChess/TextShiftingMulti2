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

async function changeMap(map) {
    if (!map) {
        return console.error(`Can't call changeMap() without providing a package name or Map object.`);
    }
    if (typeof map === 'object') {
        // Assume it's a Map object
        view.map = map;
    } else {
        // Assume it's a map name (string)
        view.map = await GameMap.loadFromPackage(map);
    }
    log.print(`Moved to map '${view.map.name}'`);
    // TODO: This should be derived from info.js or something
    console.log(view.map.startPosition);
    player.position = view.map.startPosition;
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
            // const testMap = GameMap.createTestMap(view, 18, 12, '#', [['?']]);
            const testMap = GameMap.createBlank(10, 5, [['.']], { name: 'blank', startPosition: { column: 1, line: 1 } });
            changeMap(testMap);
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