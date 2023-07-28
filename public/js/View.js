import '../../ConsoleColor.js';
import { Coordinate } from './GameMap.js';
// import Tile from './Tile.js';

export class View {
    // half the width and height of the view
    staticCenter;
    #map;
    // the current corresponding map coordinate directly under the static center
    mapCoordinateAtViewCenter;
    // the column/row of map at the bounds of the view
    #left;
    #right;
    #top;
    #bottom;
    #selfHtml;

    constructor(width, height, htmlId) {
        this.width = width > 0 ? width : 1;
        this.height = height > 0 ? height : 1;
        this.#selfHtml = document.getElementById(htmlId);

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
        
        this.#updateStaticCenter();
        this.#updateHtml();
    }

    #updateStaticCenter() {
        this.staticCenter = new Coordinate(
            Math.floor(this.width / 2),
            Math.floor(this.height / 2)
        );
    }

    // TODO: Move HTML logic into something like ViewHTML class?

    #addHtmlLayers(layers) {
        for (let z = 0; z < layers; z++) {
            const layer = document.createElement('div');
            this.#selfHtml.appendChild(layer);
            
            for (let y = 0; y < this.height; y++) {
                const line = document.createElement('pre');
                layer.appendChild(line);
    
                for (let x = 0; x < this.width; x++) {
                    const tile = document.createElement('span');
                    // TODO: Should this be ''? Don't we overwrite it anyway?
                    tile.textContent = ' ';
                    line.appendChild(tile);
                }
            }
        }
    }
    
    #removeHtmlLayers(layers) {
        for (let z = layers; z < 0; z++) {
            this.#selfHtml.removeChild(this.#selfHtml.firstChild);
        }
    }

    #increaseHtmlHeight(difference) {
        for (const layer of this.#selfHtml.children) {
            for (let y = 0; y < difference / 2; y++) {
                const topLine = document.createElement('pre');
                layer.insertBefore(topLine, layer.firstChild);
                const bottomLine = topLine.cloneNode();
                layer.appendChild(bottomLine);

                for (let x = 0; x < this.width; x++) {
                    const topTile = document.createElement('span');
                    topTile.textContent = ' ';
                    topLine.appendChild(topTile);
                    const bottomTile = topTile.cloneNode(true);
                    bottomLine.appendChild(bottomTile);
                }
            }
        }
    }

    #decreaseHtmlHeight(difference) {
        // TODO: Account with attempting to shrink below minimum (1? 3?)
        for (const layer of this.#selfHtml.children) {
            for (let y = difference / 2; y < 0; y++) {
                layer.removeChild(layer.firstChild);
                layer.removeChild(layer.lastChild);
            }
        }
    }

    #increaseHtmlWidth(difference) {
        for (const layer of this.#selfHtml.children) {
            for (const line of layer.children) {
                for (let x = 0; x < difference / 2; x++) {
                    const leftTile = document.createElement('span');
                    leftTile.textContent = ' ';
                    // line.appendChild(leftTile);
                    line.insertBefore(leftTile, line.firstChild);
                    const rightTile = leftTile.cloneNode(true);
                    line.appendChild(rightTile);
                }
            }
        }
    }
    
    #decreaseHtmlWidth(difference) {
        // TODO: Account with attempting to shrink below minimum (1? 3?)
        for (const layer of this.#selfHtml.children) {
            for (const line of layer.children) {
                for (let x = difference / 2; x < 0; x++) {
                    line.removeChild(line.firstChild);
                    line.removeChild(line.lastChild);
                }
            }
        }
    }

    // Adjust view size by an even number of rows/columns
    #adjustResizeDifference(size) {
        if (Math.abs(size) === 1) {
            // Minimum of (-)2
            size = size * 2;
        } else {
            // Must be even; round down
            size -= size % 2;
        }
        return size;
    }

    // Make sure caller also calls updateView(...) after!
    resize(widthDifference, heightDifference) {
        heightDifference = this.#adjustResizeDifference(heightDifference);
        this.height += heightDifference;

        if (heightDifference > 0) {
            this.#increaseHtmlHeight(heightDifference);
        } else if (heightDifference < 0) {
            this.#decreaseHtmlHeight(heightDifference)
        }

        widthDifference = this.#adjustResizeDifference(widthDifference);
        this.width += widthDifference;
        
        if (widthDifference > 0) {
            this.#increaseHtmlWidth(widthDifference);
        } else if (widthDifference < 0) {
            this.#decreaseHtmlWidth(widthDifference);
        }

        this.#updateStaticCenter();
    }

    #updateHtml() {
        // If creating for the first time (before map is loaded), just make one layer
        let depth = 1;
        if (this.map?.depth) { depth = this.map.depth; }
        
        const currentNumberOfHtmlLayers = this.#selfHtml.children.length;
        const difference = depth - currentNumberOfHtmlLayers;
        
        if (difference > 0) {
            this.#addHtmlLayers(difference, this.#selfHtml);
        } else if (difference < 0) {
            this.#removeHtmlLayers(difference, this.#selfHtml);
        }
        
        // If same number of layers as before, no need to make a change
        // - (This func only ever called when updating # of layers)
        // - Should we refactor to call when resizing as well?
    }

    set map(map) {
        this.#map = map;
        // Must set this here for e.g. asking about isVisible before updateView has ever been called
        this.mapCoordinateAtViewCenter = map.center;
        // Update HTML based on number of layers
        this.#updateHtml();
    }

    get map() {
        return this.#map;
    }

    // TODO: rename these ... mapColumnAtViewLeft? leftmostVisibleMapColumn?
    get left() {
        return this.mapCoordinateAtViewCenter.column - Math.floor(this.width / 2);
    }
    get right() {
        return this.mapCoordinateAtViewCenter.column + Math.floor(this.width / 2);
    }
    get top() {
        return this.mapCoordinateAtViewCenter.line - Math.floor(this.height / 2);
    }
    get bottom() {
        return this.mapCoordinateAtViewCenter.line + Math.floor(this.height / 2);
    }

    isVisible(tile, mapCenter) {
        // This isn't currently in use
        if (mapCenter) { this.mapCoordinateAtViewCenter = mapCenter; }
        
        if (tile.mapName !== this.#map.name) { return false; }
        
        const isInXView = tile.position.column >= this.left && tile.position.column <= this.right;
        const isInYView = tile.position.line >= this.top && tile.position.line <= this.bottom;
        return isInXView && isInYView;
    }

    #getTileFromBorder(x, y) {
        // Width and height of the repeating border block
        const width = this.#map.border.width;
        const height = this.#map.border.height;

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

        return this.#map.border.lines[line][column];
    }

    // Builds line, using border for negative indexes
    // TODO: Should all instances of `#map` be `map` (also in getTileFromBorder)? Or do reverse in update()?
    #getLine(lineIndex, layerIndex) {
        const line = [];
        for (let x = this.left; x < this.left + this.width; x++) {
            if (x >= 0 && lineIndex >= 0
               && x < this.#map.width && lineIndex < this.#map.height) {
                // If within map bounds, grab from there
                // line.push(this.#map.lines[lineIndex][x]);
                line.push(this.#map.lines[layerIndex][lineIndex][x]);
            } else {
                // If outside map bounds, generate from border
                line.push(this.#getTileFromBorder(x, lineIndex));
            }
        }
        return line;
    }

    update(player, remotePlayers) {
        // Sanity check
        if (!player.position) { return; }
        
        this.mapCoordinateAtViewCenter = player.position;
        const lines = [];
        
        for (let z = 0; z < this.map.depth; z++) {
            // Must explicitly define parent dimension of array (`lines[z]`), or else can't assign to child (`lines[z][y]`)
            lines[z] = [];
            for (let y = 0; y < this.height; y++) {
                lines[z][y] = this.#getLine(this.top + y, z);
            }
        }
        
        // Add in remote players
        for (const remotePlayer of remotePlayers.values()) {
            if (this.isVisible(remotePlayer)) {
                const lineIndex = remotePlayer.position.line - this.top;
                const columnIndex = remotePlayer.position.column - this.left;
                lines[this.map.depth - 1][lineIndex][columnIndex] = { symbol: '%', color: 'red' };
            }
        }
        
        // Show player at centre of both axes
        lines[this.map.depth - 1][this.staticCenter.line][this.staticCenter.column] = { symbol: '@', color: 'red' };
        
        // Print to screen
        const allLayersHtml = this.#selfHtml.children;
        for (let z = 0; z < this.map.depth; z++) {
            const allLinesHtml = allLayersHtml.item(z).children;
            for (let y = 0; y < this.height; y++) {
                const allTilesHtml = allLinesHtml.item(y).children;
                for (let x = 0; x < this.width; x++) {
                    allTilesHtml.item(x).textContent = lines[z][y][x].symbol;
                    // shows grid properly but causes ghosting/bleeding
                    // allTilesHtml.item(x).textContent = lines[z][y][x].symbol ? lines[z][y][x].symbol : ' ';
                    allTilesHtml.item(x).style.color = lines[z][y][x].color;
                    allTilesHtml.item(x).style.backgroundColor = lines[z][y][x].backgroundColor;
                }
            }
        }
    }
}