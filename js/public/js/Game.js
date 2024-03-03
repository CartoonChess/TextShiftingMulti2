var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Game_instances, _a, _Game_listeners, _Game_notifyListeners, _Game_getMapPackageInfo;
import '../../ConsoleColor.js';
import { Coordinate, GameMap } from './GameMap.js';
class Game {
    constructor() {
        _Game_instances.add(this);
        _Game_listeners.set(this, new Set());
    }
    addListener(listener) {
        __classPrivateFieldGet(this, _Game_listeners, "f").add(listener);
    }
    // Returns [Object], NOT json string
    static async getDefaultStartPositionJson() {
        const info = await __classPrivateFieldGet(this, _a, "m", _Game_getMapPackageInfo).call(this, _a.defaultMapPackage);
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
        }
        else {
            // Assume it's a map package name (string)
            // Disable movement until await is finished
            this.toggleInput(false);
            let newMap;
            try {
                newMap = await GameMap.loadFromPackage(map);
            }
            catch (err) {
                return console.error(`Couldn't load map package "${map}".`);
            }
            this.view.map = newMap;
            this.toggleInput(true);
        }
        this.log.print(`Moved to map '${this.view.map.name}'`);
        // TODO: This should be derived from info.js or something
        // -(isn't that what it's doing already?)
        if (!position) {
            position = this.view.map.startPosition;
        }
        this.player.position = position;
        // Blank out surroundings in case we land OOB
        this.player.surroundings.clear();
        this.player.surroundings.update(this.player.position, this.view.map);
        __classPrivateFieldGet(this, _Game_instances, "m", _Game_notifyListeners).call(this);
    }
    toggleInput(isEnabled) {
        if (isEnabled) {
            document.addEventListener('keydown', this.inputController);
            this.log.print('Keyboard input enabled.');
        }
        else {
            document.removeEventListener('keydown', this.inputController);
            this.log.print('Keyboard input disabled.');
        }
    }
}
_a = Game, _Game_listeners = new WeakMap(), _Game_instances = new WeakSet(), _Game_notifyListeners = function _Game_notifyListeners() {
    for (const listener of __classPrivateFieldGet(this, _Game_listeners, "f")) {
        listener.listen();
    }
}, _Game_getMapPackageInfo = async function _Game_getMapPackageInfo(pkgName) {
    if (!pkgName || typeof pkgName === 'object') {
        return console.error(`Can't call Game.#getMapPackageInfo() without providing a package name as string.`);
    }
    try {
        return await GameMap.loadInfoFromPackage(pkgName);
    }
    catch (err) {
        return console.error(`Couldn't load map package "${pkgMap}".`);
    }
};
Game.defaultMapPackage = '0';
export default Game;
