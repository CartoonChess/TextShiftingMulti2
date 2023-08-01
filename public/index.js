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
                    // TODO: Do we need the following line?
                    // -maybe we should remove it from elsewhere in this file and put it right into the Player.move() func
                    // player.surroundings.update(player.position, view.map);
                }
            }
        }
    }
    
    updateView();
    socket.broadcastMove();
    // }
}

// WARN: Is this going to try and interpret map editor button click events?
import InputController from './js/InputController.js';
game.inputController = new InputController();
game.inputController.move = (direction) => {
    moveIfAble(player, direction);
};

// Model: MapEditor[Data]
// View: MapEditorHtml
// Controller: MapEditorController

// TODO: Real user auth
const isAdmin = true;
import MapEditor from './js/MapEditor.js';
if (isAdmin) {
    const mapEditor = new MapEditor(game);
    // mapEditor.controller.handleInput = (someKindaInput) => {
        
    // }
}

game.toggleInput(true);

// TODO: Don't show any buttons until load is complete

// const decreaseViewHeightButton = document.getElementById('decrease-view-height');
// // decreaseViewButton.addEventListener('click', funcName);
// decreaseViewHeightButton.addEventListener('click', function() {
//     view.resizeBy(0, -2);
//     updateView();
// });

// const increaseViewHeightButton = document.getElementById('increase-view-height');
// increaseViewHeightButton.addEventListener('click', function() {
//     view.resizeBy(0, 2);
//     updateView();
// });

// const decreaseViewWidthButton = document.getElementById('decrease-view-width');
// decreaseViewWidthButton.addEventListener('click', function() {
//     view.resizeBy(-2, 0);
//     updateView();
// });

// const increaseViewWidthButton = document.getElementById('increase-view-width');
// increaseViewWidthButton.addEventListener('click', function() {
//     view.resizeBy(2, 0);
//     updateView();
// });

// // function createCheckboxAfter(element, id, label) {
// function createCheckboxInside(container, id, label) {
//     const checkbox = document.createElement('input');
//     checkbox.type = 'checkbox';
//     checkbox.id = id;
//     // element.after(checkbox);
//     container.appendChild(checkbox);
//     const checkboxLabel = document.createElement('label');
//     checkboxLabel.htmlFor = checkbox.id;
//     checkboxLabel.textContent = label;
//     // checkbox.after(checkboxLabel);
//     container.appendChild(checkboxLabel);

//     return checkbox;
// }

// let controlsContainer;
// let toggleGridCheckbox;
// let toggleMaxViewCheckbox;

// let oldViewWidth = view.width;
// let oldViewHeight = view.height;
// let oldPlayerPosition;

// const toggleEditorButton = document.getElementById('toggle-editor');
// const toggleEditorButtonDisabledText = toggleEditorButton.textContent;
// const toggleEditorButtonEnabledText = 'Close Editor';

// toggleEditorButton.addEventListener('click', function() {
//     // If we're editing now or have ever been, just toggle control visibility
//     if (controlsContainer) {
//         console.debug(controlsContainer.style.display);
//         if (controlsContainer.style.display === 'none') {
//             controlsContainer.style.display = 'block';
//             toggleEditorButton.textContent = toggleEditorButtonEnabledText;
//         } else {
//             controlsContainer.style.display = 'none'
//             toggleEditorButton.textContent = toggleEditorButtonDisabledText;
//         }
//         return;
//     }

//     // If this is our first time entering edit mode, set up controls

//     toggleEditorButton.textContent = toggleEditorButtonEnabledText;

//     controlsContainer = document.createElement('div');
//     toggleEditorButton.after(controlsContainer);
//     toggleGridCheckbox = createCheckboxInside(controlsContainer, 'toggle-grid', 'Grid');
//     toggleMaxViewCheckbox = createCheckboxInside(controlsContainer, 'toggle-max-view', 'Show whole map');

//     toggleGridCheckbox.addEventListener('change', function() {
//         const bodyClasses = document.body.classList;
//         const editClass = 'edit-mode';
//         if (this.checked) {
//             bodyClasses.add(editClass);
//         } else {
//             bodyClasses.remove(editClass);
//         }
//     });

//     toggleMaxViewCheckbox.addEventListener('change', function() {
//         let newWidth = oldViewWidth;
//         let newHeight = oldViewHeight;
//         if (this.checked) {
//             // TODO: Deal with even dimensions moer gracefully
//             // -(currently does +1 to dimension, but visually unclear to user)
//             newWidth = view.map.width;
//             newHeight = view.map.height;
//         }
//         view.resizeTo(newWidth, newHeight);

//         const isBecomingMaxView = this.checked;
//         // Don't allow player movement when map is full size
//         game.toggleInput(!isBecomingMaxView);
//         if (isBecomingMaxView) {
//             // WARN: If clicked before game is fully loaded, player.position will (probably) be undefined!
//             oldPlayerPosition = Coordinate.fromJson(player.position.toJson());
//             player.move(view.staticCenter);
//         } else {
//             player.move(oldPlayerPosition);
//         }
//         player.surroundings.update(player.position, view.map);
//         // NOTE: Does not change on server/refresh as we haven't called socket.broadcastMove()...
        
//         updateView();
//     });
// });

// Mobile - currently disabled
// import './mobile.js';