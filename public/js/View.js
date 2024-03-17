var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ViewHtml_instances, _ViewHtml_container, _ViewHtml_width, _ViewHtml_height, _ViewHtml_addLayers, _ViewHtml_removeLayers, _View_instances, _View_map, _View_html, _View_updateStaticCenter, _View_adjustResizeDifference, _View_left_get, _View_right_get, _View_top_get, _View_bottom_get, _View_getTileFromBorder, _View_tileIsInBounds, _View_getLine, _View_getLinesWithUpdatedRemotePlayers;
import '../../ConsoleColor.js';
import { Coordinate } from './GameMap.js';
class ViewHtml {
    // #depth
    constructor(htmlId, width, height) {
        _ViewHtml_instances.add(this);
        _ViewHtml_container.set(this, void 0);
        _ViewHtml_width.set(this, void 0);
        _ViewHtml_height.set(this, void 0);
        const possibleElement = document.getElementById(htmlId);
        if (!possibleElement) {
            throw new Error(`Couldn't create ViewHtml: No element with ID ${htmlId}.`);
        }
        __classPrivateFieldSet(this, _ViewHtml_container, possibleElement, "f");
        this.updateDepth(1, height, width);
    }
    get container() {
        return __classPrivateFieldGet(this, _ViewHtml_container, "f");
    }
    get depth() {
        return __classPrivateFieldGet(this, _ViewHtml_container, "f").children.length;
    }
    get height() {
        var _a;
        // return this.#container.firstChild.children.length
        return (_a = __classPrivateFieldGet(this, _ViewHtml_container, "f").firstElementChild) === null || _a === void 0 ? void 0 : _a.children.length;
    }
    get width() {
        var _a, _b;
        // return this.#container.firstChild.firstChild.children.length
        return (_b = (_a = __classPrivateFieldGet(this, _ViewHtml_container, "f").firstElementChild) === null || _a === void 0 ? void 0 : _a.firstElementChild) === null || _b === void 0 ? void 0 : _b.children.length;
    }
    updateDepth(depth, height, width) {
        // if (!depth) { return console.error('Must pass ViewHtml.updateDepth() a depth argument.') }
        const currentNumberOfLayers = __classPrivateFieldGet(this, _ViewHtml_container, "f").children.length;
        const difference = depth - currentNumberOfLayers;
        if (difference > 0) {
            __classPrivateFieldGet(this, _ViewHtml_instances, "m", _ViewHtml_addLayers).call(this, difference, height, width);
        }
        else if (difference < 0) {
            // this.#removeLayers(difference, height, width)
            __classPrivateFieldGet(this, _ViewHtml_instances, "m", _ViewHtml_removeLayers).call(this, difference);
        }
    }
    increaseHeight(difference) {
        // Get this before making any changes
        const width = __classPrivateFieldGet(this, _ViewHtml_width, "f");
        if (!width) {
            throw new Error(`Couldn't execute ViewHtml.increaseHeight(): Property #width is undefined.`);
        }
        for (const layer of __classPrivateFieldGet(this, _ViewHtml_container, "f").children) {
            for (let y = 0; y < difference / 2; y++) {
                const topLine = document.createElement('pre');
                layer.insertBefore(topLine, layer.firstElementChild);
                const bottomLine = topLine.cloneNode();
                layer.appendChild(bottomLine);
                for (let x = 0; x < width; x++) {
                    const topTile = document.createElement('span');
                    topTile.textContent = ' ';
                    topLine.appendChild(topTile);
                    const bottomTile = topTile.cloneNode(true);
                    bottomLine.appendChild(bottomTile);
                }
            }
        }
    }
    decreaseHeight(difference) {
        for (const layer of __classPrivateFieldGet(this, _ViewHtml_container, "f").children) {
            for (let y = difference / 2; y < 0; y++) {
                // TODO: Handle this as an error instead?
                // Account with attempting to shrink below minimum (1? 3?)
                if (!layer.firstElementChild || !layer.lastElementChild) {
                    // throw new Error()
                    continue;
                }
                layer.removeChild(layer.firstElementChild);
                layer.removeChild(layer.lastElementChild);
            }
        }
    }
    increaseWidth(difference) {
        for (const layer of __classPrivateFieldGet(this, _ViewHtml_container, "f").children) {
            for (const line of layer.children) {
                for (let x = 0; x < difference / 2; x++) {
                    const leftTile = document.createElement('span');
                    leftTile.textContent = ' ';
                    line.insertBefore(leftTile, line.firstElementChild);
                    const rightTile = leftTile.cloneNode(true);
                    line.appendChild(rightTile);
                }
            }
        }
    }
    decreaseWidth(difference) {
        for (const layer of __classPrivateFieldGet(this, _ViewHtml_container, "f").children) {
            for (const line of layer.children) {
                for (let x = difference / 2; x < 0; x++) {
                    // TODO: Handle this as an error instead?
                    // Account with attempting to shrink below minimum (1? 3?)
                    if (!line.firstElementChild || !line.lastElementChild) {
                        // throw new Error()
                        continue;
                    }
                    line.removeChild(line.firstElementChild);
                    line.removeChild(line.lastElementChild);
                }
            }
        }
    }
    // Update each tile
    refresh(lines, depth, height, width) {
        var _a, _b;
        const allLayersHtml = __classPrivateFieldGet(this, _ViewHtml_container, "f").children;
        for (let z = 0; z < depth; z++) {
            // const allLinesHtml = allLayersHtml.item(z)?.children
            // if (!allLinesHtml) {
            //     throw new Error(`ViewHtml.refresh() failed: allLayersHtml.item(${z}) is null.`)
            // }
            const allLinesHtml = allLayersHtml[z].children;
            for (let y = 0; y < height; y++) {
                // const allTilesHtml = allLinesHtml.item(y)?.children
                // if (!allTilesHtml) {
                //     throw new Error(`ViewHtml.refresh() failed: allTilesHtml.item(${z}) is null.`)
                // }
                // const allTilesHtml = allLinesHtml[y].children
                const allTilesHtml = allLinesHtml[y].children;
                for (let x = 0; x < width; x++) {
                    // Default values provided to prevent ghosting
                    // allTilesHtml.item(x).textContent = lines[z][y][x].symbol ? lines[z][y][x].symbol : ' '
                    // allTilesHtml.item(x).style.backgroundColor = lines[z][y][x].backgroundColor ? lines[z][y][x].backgroundColor : 'inherit'
                    // allTilesHtml.item(x).style.color = lines[z][y][x].color
                    allTilesHtml[x].textContent = lines[z][y][x].symbol ? lines[z][y][x].symbol : ' ';
                    // allTilesHtml[x].style.backgroundColor = lines[z][y][x].backgroundColor ? lines[z][y][x].backgroundColor : 'inherit'
                    allTilesHtml[x].style.backgroundColor = (_a = lines[z][y][x].backgroundColor) !== null && _a !== void 0 ? _a : 'inherit';
                    // allTilesHtml[x].style.color = lines[z][y][x].color
                    allTilesHtml[x].style.color = (_b = lines[z][y][x].color) !== null && _b !== void 0 ? _b : 'inherit';
                }
            }
        }
    }
}
_ViewHtml_container = new WeakMap(), _ViewHtml_width = new WeakMap(), _ViewHtml_height = new WeakMap(), _ViewHtml_instances = new WeakSet(), _ViewHtml_addLayers = function _ViewHtml_addLayers(layers, height, width) {
    if (!height) {
        height = __classPrivateFieldGet(this, _ViewHtml_height, "f");
    }
    if (!width) {
        width = __classPrivateFieldGet(this, _ViewHtml_width, "f");
    }
    if (!height || !width) {
        throw new Error(`ViewHtml.#addLayers() was called without passing height and width arguments while ViewHtml instance couldn't calculate these values implicitly.`);
    }
    for (let z = 0; z < layers; z++) {
        const layer = document.createElement('div');
        __classPrivateFieldGet(this, _ViewHtml_container, "f").appendChild(layer);
        for (let y = 0; y < height; y++) {
            const line = document.createElement('pre');
            layer.appendChild(line);
            for (let x = 0; x < width; x++) {
                const tile = document.createElement('span');
                // TODO: Should this be ''? Don't we overwrite it anyway?
                tile.textContent = ' ';
                line.appendChild(tile);
            }
        }
    }
}, _ViewHtml_removeLayers = function _ViewHtml_removeLayers(layers) {
    for (let z = layers; z < 0; z++) {
        if (!__classPrivateFieldGet(this, _ViewHtml_container, "f").firstElementChild) {
            throw new Error(`ViewHtml.#removeLayers() failed: #container property has no element children.`);
        }
        __classPrivateFieldGet(this, _ViewHtml_container, "f").removeChild(__classPrivateFieldGet(this, _ViewHtml_container, "f").firstElementChild);
    }
};
import Tile from './Tile.js';
export class View {
    // constructor(width: number, height: number, htmlId: string) {
    constructor(width, height, htmlId, map) {
        _View_instances.add(this);
        _View_map.set(this, void 0);
        // the current corresponding map coordinate directly under the static center
        // mapCoordinateAtViewCenter: Coordinate
        this.mapCoordinateAtViewCenter = new Coordinate(0, 0);
        // the column/row of map at the bounds of the view
        // #left: number
        // #right: number
        // #top: number
        // #bottom: number
        _View_html.set(this, void 0);
        this.width = width > 0 ? width : 1;
        this.height = height > 0 ? height : 1;
        // View should always be an odd number
        // If not, staticCenter will cause OBOE
        // TODO: Minimum 3?
        if (this.width % 2 === 0) {
            console.warn('View dimensions must be an odd number; shrinking width.');
            this.width--;
        }
        if (this.height % 2 === 0) {
            console.warn('View dimensions must be an odd number; shrinking height.');
            this.height--;
        }
        __classPrivateFieldGet(this, _View_instances, "m", _View_updateStaticCenter).call(this);
        if (htmlId) {
            this.html = htmlId;
        }
        __classPrivateFieldSet(this, _View_map, map, "f");
    }
    set html(id) {
        __classPrivateFieldSet(this, _View_html, new ViewHtml(id, this.width, this.height), "f");
    }
    get htmlById() {
        var _a;
        return (_a = __classPrivateFieldGet(this, _View_html, "f")) === null || _a === void 0 ? void 0 : _a.container;
    }
    // Make sure caller also calls updateView(...) after!
    resizeBy(widthDifference, heightDifference) {
        var _a, _b, _c, _d;
        heightDifference = __classPrivateFieldGet(this, _View_instances, "m", _View_adjustResizeDifference).call(this, heightDifference);
        this.height += heightDifference;
        if (heightDifference > 0) {
            (_a = __classPrivateFieldGet(this, _View_html, "f")) === null || _a === void 0 ? void 0 : _a.increaseHeight(heightDifference);
        }
        else if (heightDifference < 0) {
            (_b = __classPrivateFieldGet(this, _View_html, "f")) === null || _b === void 0 ? void 0 : _b.decreaseHeight(heightDifference);
        }
        widthDifference = __classPrivateFieldGet(this, _View_instances, "m", _View_adjustResizeDifference).call(this, widthDifference);
        this.width += widthDifference;
        if (widthDifference > 0) {
            (_c = __classPrivateFieldGet(this, _View_html, "f")) === null || _c === void 0 ? void 0 : _c.increaseWidth(widthDifference);
        }
        else if (widthDifference < 0) {
            (_d = __classPrivateFieldGet(this, _View_html, "f")) === null || _d === void 0 ? void 0 : _d.decreaseWidth(widthDifference);
        }
        __classPrivateFieldGet(this, _View_instances, "m", _View_updateStaticCenter).call(this);
    }
    resizeTo(width, height) {
        const widthDifference = width - this.width;
        const heightDifference = height - this.height;
        this.resizeBy(widthDifference, heightDifference);
    }
    set map(map) {
        var _a;
        __classPrivateFieldSet(this, _View_map, map, "f");
        // Must set this here for e.g. asking about isVisible before updateView has ever been called
        this.mapCoordinateAtViewCenter = map.center;
        // Update HTML based on number of layers
        // this.#html.updateDepth();
        (_a = __classPrivateFieldGet(this, _View_html, "f")) === null || _a === void 0 ? void 0 : _a.updateDepth(map.depth);
    }
    get map() {
        return __classPrivateFieldGet(this, _View_map, "f");
    }
    // TODO: Better typing on "tile"
    // Currently only used for RemotePlayer objects
    isVisible(tile, mapCenter) {
        // This isn't currently in use
        if (mapCenter) {
            this.mapCoordinateAtViewCenter = mapCenter;
        }
        if (tile.mapName !== __classPrivateFieldGet(this, _View_map, "f").name) {
            return false;
        }
        const isInXView = tile.position.column >= __classPrivateFieldGet(this, _View_instances, "a", _View_left_get) && tile.position.column <= __classPrivateFieldGet(this, _View_instances, "a", _View_right_get);
        const isInYView = tile.position.line >= __classPrivateFieldGet(this, _View_instances, "a", _View_top_get) && tile.position.line <= __classPrivateFieldGet(this, _View_instances, "a", _View_bottom_get);
        return isInXView && isInYView;
    }
    // getTile(rowIndex: number, lineIndex: number, layerIndex: number, includeBorder = true): Tile | null {
    getTile(rowIndex, lineIndex, layerIndex, includeBorder = true) {
        if (__classPrivateFieldGet(this, _View_instances, "m", _View_tileIsInBounds).call(this, rowIndex, lineIndex)) {
            // If within map bounds, grab from there
            return __classPrivateFieldGet(this, _View_map, "f").lines[layerIndex][lineIndex][rowIndex];
        }
        else if (includeBorder) {
            // If outside map bounds, generate from border
            return __classPrivateFieldGet(this, _View_instances, "m", _View_getTileFromBorder).call(this, rowIndex, lineIndex);
        }
        // If OOB and we don't want border
        // return null
        return new Tile({ symbol: ' ' });
    }
    // update(player: Player, remotePlayers: RemotePlayer[]) {
    update(player, remotePlayers) {
        // Sanity check
        // if (!player.position) { return }
        var _a;
        this.mapCoordinateAtViewCenter = player.position;
        // const lines = []
        let lines = [[[]]];
        for (let z = 0; z < this.map.depth; z++) {
            // Must explicitly define parent dimension of array (`lines[z]`), or else can't assign to child (`lines[z][y]`)
            lines[z] = [];
            for (let y = 0; y < this.height; y++) {
                lines[z][y] = __classPrivateFieldGet(this, _View_instances, "m", _View_getLine).call(this, __classPrivateFieldGet(this, _View_instances, "a", _View_top_get) + y, z);
            }
        }
        // Add in remote players
        // for (const remotePlayer of remotePlayers.values()) {
        //     if (this.isVisible(remotePlayer)) {
        //         const lineIndex = remotePlayer.position.line - this.#top;
        //         const columnIndex = remotePlayer.position.column - this.#left;
        //         lines[this.map.depth - 1][lineIndex][columnIndex] = { symbol: '%', color: 'red' };
        //     }
        // }
        if (remotePlayers) {
            lines = __classPrivateFieldGet(this, _View_instances, "m", _View_getLinesWithUpdatedRemotePlayers).call(this, remotePlayers, lines);
        }
        // Show player at centre of both axes
        lines[this.map.depth - 1][this.staticCenter.line][this.staticCenter.column] = { symbol: '@', color: 'red' };
        // Print to screen
        (_a = __classPrivateFieldGet(this, _View_html, "f")) === null || _a === void 0 ? void 0 : _a.refresh(lines, this.map.depth, this.height, this.width);
    }
}
_View_map = new WeakMap(), _View_html = new WeakMap(), _View_instances = new WeakSet(), _View_updateStaticCenter = function _View_updateStaticCenter() {
    this.staticCenter = new Coordinate(Math.floor(this.width / 2), Math.floor(this.height / 2));
}, _View_adjustResizeDifference = function _View_adjustResizeDifference(size) {
    if (Math.abs(size) === 1) {
        // Minimum of (-)2
        size = size * 2;
    }
    else {
        // Must be even; round down
        size -= size % 2;
    }
    return size;
}, _View_left_get = function _View_left_get() {
    return this.mapCoordinateAtViewCenter.column - Math.floor(this.width / 2);
}, _View_right_get = function _View_right_get() {
    return this.mapCoordinateAtViewCenter.column + Math.floor(this.width / 2);
}, _View_top_get = function _View_top_get() {
    return this.mapCoordinateAtViewCenter.line - Math.floor(this.height / 2);
}, _View_bottom_get = function _View_bottom_get() {
    return this.mapCoordinateAtViewCenter.line + Math.floor(this.height / 2);
}, _View_getTileFromBorder = function _View_getTileFromBorder(x, y) {
    // Width and height of the repeating border block
    const width = __classPrivateFieldGet(this, _View_map, "f").border.width;
    const height = __classPrivateFieldGet(this, _View_map, "f").border.height;
    // The indexes within the border block
    let column = x % width;
    let line = y % height;
    // Negative values require a little counting backwards then forward
    if (x < 0) {
        column = (column + width) % width;
    }
    if (y < 0) {
        line = (line + height) % height;
    }
    // return this.#map.border.lines[line][column];
    const fakeLayer = 0;
    return __classPrivateFieldGet(this, _View_map, "f").border.lines[fakeLayer][line][column];
}, _View_tileIsInBounds = function _View_tileIsInBounds(rowIndex, lineIndex) {
    return rowIndex >= 0 && lineIndex >= 0
        && rowIndex < __classPrivateFieldGet(this, _View_map, "f").width && lineIndex < __classPrivateFieldGet(this, _View_map, "f").height;
}, _View_getLine = function _View_getLine(lineIndex, layerIndex) {
    const line = [];
    for (let x = __classPrivateFieldGet(this, _View_instances, "a", _View_left_get); x < __classPrivateFieldGet(this, _View_instances, "a", _View_left_get) + this.width; x++) {
        // if (x >= 0 && lineIndex >= 0
        //    && x < this.#map.width && lineIndex < this.#map.height) {
        //     // If within map bounds, grab from there
        //     line.push(this.#map.lines[layerIndex][lineIndex][x]);
        // } else {
        //     // If outside map bounds, generate from border
        //     line.push(this.#getTileFromBorder(x, lineIndex));
        // }
        line.push(this.getTile(x, lineIndex, layerIndex));
    }
    return line;
}, _View_getLinesWithUpdatedRemotePlayers = function _View_getLinesWithUpdatedRemotePlayers(remotePlayers, lines) {
    for (const remotePlayer of remotePlayers.values()) {
        if (this.isVisible(remotePlayer)) {
            const lineIndex = remotePlayer.position.line - __classPrivateFieldGet(this, _View_instances, "a", _View_top_get);
            const columnIndex = remotePlayer.position.column - __classPrivateFieldGet(this, _View_instances, "a", _View_left_get);
            lines[this.map.depth - 1][lineIndex][columnIndex] = { symbol: '%', color: 'red' };
        }
    }
    return lines;
};
