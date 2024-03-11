import '../../ConsoleColor.js'
import MessageLog from './MessageLog.js'
import { Coordinate, GameMap } from './GameMap.js'
import Listener from '../../Listener.js'

import { Player, RemotePlayer } from './Character.js'
import InputController from './InputController.js'

export default class Game {
    log?: MessageLog
    // FIXME: view?: View
    view?: any
    player?: Player
    // remotePlayers?: [any]
    remotePlayers?: Map<string, RemotePlayer>
    inputController?: InputController

    #listeners = new Set<Listener>();

    addListener(listener: Listener) {
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

    static readonly defaultMapPackage = '0';

    static async #getMapPackageInfo(pkgName: string): Promise<GameMap> {
        // if (!pkgName || typeof pkgName === 'object') {
        //     return console.error(`Can't call Game.#getMapPackageInfo() without providing a package name as string.`);
        // }
        
        try {
            return await GameMap.loadInfoFromPackage(pkgName);
        } catch(err) {
            throw new Error(`Couldn't load map package "${pkgName}".`);
        }
    }

    // Returns [Object], NOT json string
    static async getDefaultStartPositionJson(): Promise<Coordinate | undefined> {
        const info = await this.#getMapPackageInfo(Game.defaultMapPackage);
        return info.startPosition;
    }

    static async getDefaultStartPosition(): Promise<Coordinate | undefined> {
        const startPositionJson = await this.getDefaultStartPositionJson();
        if (startPositionJson) {
            return Coordinate.fromObject(startPositionJson);
        }
    }

    // printToLog(msg: string) {

    // }

    async changeMap(map: string | GameMap, position: Coordinate) {
        if (!map) {
            return console.error(`Can't call Game.changeMap() without providing a package name or GameMap object.`);
        }
        // TODO: Should this be `=== GameMap`?
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
        this.log?.print(`Moved to map '${this.view.map.name}'`);
        // TODO: This should be derived from info.js or something
        // -(isn't that what it's doing already?)
        if (!position) { position = this.view.map.startPosition; }

        // Inelegant but whatever
        if (!this.player) { return }

        this.player.position = position;
        // Blank out surroundings in case we land OOB
        this.player.surroundings.clear();
        this.player.surroundings.update(this.player?.position, this.view.map);

        this.#notifyListeners();
    }
    
    toggleInput(isEnabled: boolean) {
        if (!this.inputController) { return }

        if (isEnabled) {
            document.addEventListener('keydown', this.inputController);
            this.log?.print('Keyboard input enabled.');
        } else {
            document.removeEventListener('keydown', this.inputController);
            this.log?.print('Keyboard input disabled.');
        }
    }
}