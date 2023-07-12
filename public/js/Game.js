import { GameMap } from './GameMap.js';
// import InputController from './js/InputController.js';

export default class Game {
    log;
    view;
    player;
    remotePlayers;
    inputController;
    
    defaultMapPackage = 'test1';

    async changeMap(map, position) {
        if (!map) {
            return console.error(`Can't call Game.changeMap() without providing a package name or Map object.`);
        }
        if (typeof map === 'object') {
            // Assume it's a Map object
            this.view.map = map;
        } else {
            // Assume it's a map name (string)
            // Disable movement until await is finished
            this.toggleInput(false);
            this.view.map = await GameMap.loadFromPackage(map);
            this.toggleInput(true);
        }
        this.log.print(`Moved to map '${this.view.map.name}'`);
        // TODO: This should be derived from info.js or something
        if (!position) { position = this.view.map.startPosition; }
        this.player.position = position;
        // Blank out surroundings in case we land OOB
        this.player.surroundings.clear();
        this.player.surroundings.update(this.player.position, this.view.map);
        // TODO: Update data for all remote players here?
    }
    
    toggleInput(isEnabled) {
        if (isEnabled) {
            document.addEventListener('keydown', this.inputController);
            this.log.print('Keyboard input enabled.');
        } else {
            document.removeEventListener('keydown', this.inputController);
            this.log.print('Keyboard input disabled.');
        }
    }
}