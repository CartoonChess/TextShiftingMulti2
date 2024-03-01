import '../../ConsoleColor.js';
import { Coordinate, GameMap } from './GameMap.js';

export default class Game {
    log;
    view;
    player;
    remotePlayers;
    inputController;

    #listeners = new Set();

    addListener(listener) {
        this.#listeners.add(listener);
    }

    // removeListener(listener) {
    //     this.#listeners.delete(listener);
    // }

    #notifyListeners() {
        for (const listener of this.#listeners) {
            listener.listen();
        }
    }

    static defaultMapPackage = '0';

    static async #getMapPackageInfo(pkgName) {
        if (!pkgName || typeof pkgName === 'object') {
            return console.error(`Can't call Game.#getMapPackageInfo() without providing a package name as string.`);
        }
        
        try {
            return await GameMap.loadInfoFromPackage(pkgName);
        } catch(err) {
            return console.error(`Couldn't load map package "${pkgMap}".`);
        }
    }

    // Returns [Object], NOT json string
    static async getDefaultStartPositionJson() {
        const info = await this.#getMapPackageInfo(Game.defaultMapPackage);
        return info.startPosition;
    }

    static async getDefaultStartPosition() {
        const startPositionJson = await this.getDefaultStartPositionJson();
        return Coordinate.fromObject(startPositionJson);
    }

    async changeMap(map, position) {
        if (!map) {
            return console.error(`Can't call Game.changeMap() without providing a package name or GameMap object.`);
        }
        if (typeof map === 'object') {
            // Assume it's a GameMap object
            this.view.map = map;
        } else {
            // Assume it's a map package name (string)
            // Disable movement until await is finished
            this.toggleInput(false);
            let newMap;
            try {
                newMap = await GameMap.loadFromPackage(map);
            } catch(err) {
                return console.error(`Couldn't load map package "${map}".`);
            }
            this.view.map = newMap;
            this.toggleInput(true);
        }
        this.log.print(`Moved to map '${this.view.map.name}'`);
        // TODO: This should be derived from info.js or something
        // -(isn't that what it's doing already?)
        if (!position) { position = this.view.map.startPosition; }
        this.player.position = position;
        // Blank out surroundings in case we land OOB
        this.player.surroundings.clear();
        this.player.surroundings.update(this.player.position, this.view.map);

        this.#notifyListeners();
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