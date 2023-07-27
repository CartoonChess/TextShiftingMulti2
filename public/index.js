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
const view = new View(7, 7, 'game-view');
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

import { Direction } from './js/Direction.js';
import { Coordinate } from './js/GameMap.js';
async function moveIfAble(character, direction) {
    // Maybe this should be handled by the Game object...
    if (!socket.isReadyForView) { return; }

    if (character.surroundings.thatInclude('isSolid', direction).length) {
        return log.print(`*bonk*`);
    }

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

    const tilesWithScripts = character.surroundings.thatInclude('scripts', Direction.Here);
    for (const tile of tilesWithScripts) {
        for (const script of tile.scripts) {
            const className = script.constructor?.name;
            if (className === 'WarpTileScript') {
                // HACK: Passing Coordinate in script.destinationCoordinate means it gets stuck to this tile's coord
                // -Next time you return to this map, you'll be standing on where this warp tile was (modifies WarpTileScript)
                const destinationCoordinate = Coordinate.fromJson(script.destinationCoordinate.toJson());
                if (script.destinationMap) {
                    await game.changeMap(script.destinationMap, destinationCoordinate);
                } else {
                    character.move(destinationCoordinate);
                }
            }
        }
    }
    
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

const shrinkViewButton = document.getElementById('shrink-view');
// shrinkViewButton.addEventListener('click', funcName);
shrinkViewButton.addEventListener('click', function() {
    // view.width -= 2;
    // updateView();
});

const growViewButton = document.getElementById('grow-view');
// shrinkViewButton.addEventListener('click', funcName);
growViewButton.addEventListener('click', function() {
    view.resize(0, 2);
});

// Mobile - currently disabled
// import './mobile.js';