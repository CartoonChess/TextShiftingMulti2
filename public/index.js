import MessageLog from './js/MessageLog.js';
const log = new MessageLog(document.getElementById('message-log'), true);
log.print('Loading...');

const solidCharacter = '#';

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
        // Disable movement until await is finished
        toggleInput(false);
        view.map = await GameMap.loadFromPackage(map);
        toggleInput(true);
    }
    log.print(`Moved to map '${view.map.name}'`);
    // TODO: This should be derived from info.js or something
    player.position = view.map.startPosition;
    // Blank out surroundings in case we land OOB
    player.surroundings.clear();
    player.surroundings.update(player.position, view.map);
}

async function moveIfAble(character, direction) {
    // Maybe this should be handled by the Game object...
    if (!socket.isReadyForView) { return; }

    if (character.surroundings.at(direction) != solidCharacter) {
        character.move(direction);
        player.surroundings.update(player.position, view.map);

        // TODO: Specify by coord instead (maps/../info.js); incl. destination
        if (player.surroundings.here === 'B') {
            const blankMap = GameMap.createBlank(10, 5, [['.']], { name: 'blank', startPosition: { column: 1, line: 1 } });
            await changeMap(blankMap);
        } else if (player.surroundings.here === 'T') {
            const testMap = GameMap.createTestMap(view, 18, 12, 'F', [['★']]);
            await changeMap(testMap);
        } else if (player.surroundings.here === 'F') {
            const firstMap = 'test1';
            await changeMap(firstMap);
        } else if (player.surroundings.here === 'Z') {
            const secondMap = 'test2';
            await changeMap(secondMap);
        }
        
        updateView();
        socket.broadcastMove();
    }
}

import InputController from './js/InputController.js';
const inputController = new InputController();
inputController.move = (direction) => {
    moveIfAble(player, direction);
};

function toggleInput(isEnabled) {
    if (isEnabled) {
        document.addEventListener('keydown', inputController);
        log.print('Keyboard input enabled.');
    } else {
        document.removeEventListener('keydown', inputController);
        log.print('Keyboard input disabled.');
    }
}

toggleInput(true);

// Mobile - currently disabled
// import './mobile.js';