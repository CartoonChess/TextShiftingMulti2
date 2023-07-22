// var oldConsole = console.log;
// console.log = function(){
//     // var timestamp = "[foo]";
//     // Array.prototype.unshift.call(arguments, timestamp);
//     var prefix = "%cDebug: ";
//     var color = "color: orange";
//     Array.prototype.unshift.call(arguments, prefix, color);
//     oldConsole.apply(this, arguments);
// };

console.debug('debug');
console.log('log');
console.info('info');
console.warn('warn');
console.error('error');

// Game controller
import Game from '../js/Game.js';
const game = new Game();

import MessageLog from './js/MessageLog.js';
const log = new MessageLog(document.getElementById('message-log'), true);
game.log = log;
log.print('Loading...');

// const solidCharacter = '#';

// Map and view
import { GameMap } from './js/GameMap.js';
import { View } from './js/View.js';
const view = new View(25, 25);
view.map = await GameMap.loadFromPackage(Game.defaultMapPackage);
game.view = view;

import { Player } from './js/Character.js';
const player = new Player();
// Will be overwritten if session data is found
game.player = player;
game.remotePlayers = new Map();

// TODO: Map never loads if socket isn't used (prevents single-play/offline...)
import GameSocket from './js/GameSocket.js';
const socket = new GameSocket(game);
socket.listen();

function updateView() {
    // TODO: Maybe this should take an { object } instead, so we can pass whatever comes up
    view.update(player, game.remotePlayers);
}

async function moveIfAble(character, direction) {
    // Maybe this should be handled by the Game object...
    if (!socket.isReadyForView) { return; }

    // if (character.surroundings.at(direction).isSolid) {
    if (character.surroundings.doInclude('isSolid', direction)) {
        // return log.print(`The ${character.surroundings.at(direction).symbol} goes bonk.`);
        return log.print(`*bonk*`);
    }

    // if (character.surroundings.at(direction) != solidCharacter) {
    character.move(direction);
    player.surroundings.update(player.position, view.map);

    // TODO: Specify by coord instead (maps/../info.js); incl. destination
    // if (player.surroundings.here === 'B') {
    //     const blankMap = GameMap.createBlank(10, 5, [['.']], { name: 'blank', startPosition: { column: 1, line: 1 } });
    //     await game.changeMap(blankMap);
    // } else if (player.surroundings.here === 'T') {
    //     const testMap = GameMap.createTestMap(view, 18, 12, 'F', [['★']]);
    //     await game.changeMap(testMap);
    // } else if (player.surroundings.here === 'F') {
    //     const firstMap = 'test1';
    //     await game.changeMap(firstMap);
    // } else if (player.surroundings.here === 'Z') {
    //     const secondMap = 'test2';
    //     await game.changeMap(secondMap);
    // }
    
    updateView();
    socket.broadcastMove();
    // }
}

import InputController from './js/InputController.js';
game.inputController = new InputController();
game.inputController.move = (direction) => {
    moveIfAble(player, direction);
};


game.toggleInput(true);

// Mobile - currently disabled
// import './mobile.js';