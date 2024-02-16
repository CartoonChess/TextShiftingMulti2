import '../../ConsoleColor.js';
import { Coordinate } from './GameMap.js';
// import Tile from './Tile.js';

class ViewHtml {
    #container;

    #width;
    #height;
    #depth;

    constructor(htmlId, width, height) {
        this.#container = document.getElementById(htmlId);
        this.updateDepth(1, height, width);
    }

    get container() {
        return this.#container;
    }

    get depth() {
        return this.#container.children.length;
    }

    get height() {
        return this.#container.firstChild.children.length;
    }

    get width() {
        return this.#container.firstChild.firstChild.children.length;
    }

    #addLayers(layers, height, width) {
        if (!height) { height = this.height; }
        if (!width) { width = this.width; }
        if (!height || !width ) { return console.error(`ViewHtml.#addLayers() was called without passing height and width arguments while ViewHtml instance couldn't calculate these values implicitly.`); }
        
        for (let z = 0; z < layers; z++) {
            const layer = document.createElement('div');
            this.#container.appendChild(layer);

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
    }
    
    #removeLayers(layers) {
        for (let z = layers; z < 0; z++) {
            this.#container.removeChild(this.#container.firstChild);
        }
    }

    updateDepth(depth, height, width) {
        if (!depth) { return console.error('Must pass ViewHtml.updateDepth() a depth argument.'); }
        
        const currentNumberOfLayers = this.#container.children.length;
        const difference = depth - currentNumberOfLayers;
        
        if (difference > 0) {
            this.#addLayers(difference, height, width);
        } else if (difference < 0) {
            this.#removeLayers(difference, height, width);
        }
    }

    increaseHeight(difference) {
        // Get this before making any changes
        const width = this.width;
        
        for (const layer of this.#container.children) {
            for (let y = 0; y < difference / 2; y++) {
                const topLine = document.createElement('pre');
                layer.insertBefore(topLine, layer.firstChild);
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
        // TODO: Account with attempting to shrink below minimum (1? 3?)
        for (const layer of this.#container.children) {
            for (let y = difference / 2; y < 0; y++) {
                layer.removeChild(layer.firstChild);
                layer.removeChild(layer.lastChild);
            }
        }
    }

    increaseWidth(difference) {
        for (const layer of this.#container.children) {
            for (const line of layer.children) {
                for (let x = 0; x < difference / 2; x++) {
                    const leftTile = document.createElement('span');
                    leftTile.textContent = ' ';
                    line.insertBefore(leftTile, line.firstChild);
                    const rightTile = leftTile.cloneNode(true);
                    line.appendChild(rightTile);
                }
            }
        }
    }
    
    decreaseWidth(difference) {
        // TODO: Account with attempting to shrink below minimum (1? 3?)
        for (const layer of this.#container.children) {
            for (const line of layer.children) {
                for (let x = difference / 2; x < 0; x++) {
                    line.removeChild(line.firstChild);
                    line.removeChild(line.lastChild);
                }
            }
        }
    }

    // Update each tile
    refresh(lines, depth, height, width) {
        const allLayersHtml = this.#container.children;
        for (let z = 0; z < depth; z++) {
            const allLinesHtml = allLayersHtml.item(z).children;
            for (let y = 0; y < height; y++) {
                const allTilesHtml = allLinesHtml.item(y).children;
                for (let x = 0; x < width; x++) {
                    // Default values provided to prevent ghosting
                    allTilesHtml.item(x).textContent = lines[z][y][x].symbol ? lines[z][y][x].symbol : ' ';
                    allTilesHtml.item(x).style.backgroundColor = lines[z][y][x].backgroundColor ? lines[z][y][x].backgroundColor : 'inherit';
                    allTilesHtml.item(x).style.color = lines[z][y][x].color;
                }
            }
        }
    }
}


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
    #html;

    constructor(width, height, htmlId) {
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
        
        this.#updateStaticCenter();
        
        if (htmlId) {
            this.html = htmlId;
        }
    }

    set html(id) {
        this.#html = new ViewHtml(id, this.width, this.height);
    }

    get htmlById() {
        return this.#html.container;
    }

    #updateStaticCenter() {
        this.staticCenter = new Coordinate(
            Math.floor(this.width / 2),
            Math.floor(this.height / 2)
        );
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
    resizeBy(widthDifference, heightDifference) {
        heightDifference = this.#adjustResizeDifference(heightDifference);
        this.height += heightDifference;

        if (heightDifference > 0) {
            this.#html.increaseHeight(heightDifference);
        } else if (heightDifference < 0) {
            this.#html.decreaseHeight(heightDifference);
        }

        widthDifference = this.#adjustResizeDifference(widthDifference);
        this.width += widthDifference;
        
        if (widthDifference > 0) {
            this.#html.increaseWidth(widthDifference);
        } else if (widthDifference < 0) {
            this.#html.decreaseWidth(widthDifference);
        }

        this.#updateStaticCenter();
    }

    resizeTo(width, height) {
        const widthDifference = width - this.width;
        const heightDifference = height - this.height;
        this.resizeBy(widthDifference, heightDifference);
    }

    set map(map) {
        this.#map = map;
        // Must set this here for e.g. asking about isVisible before updateView has ever been called
        this.mapCoordinateAtViewCenter = map.center;
        // Update HTML based on number of layers
        // this.#html.updateDepth();
        this.#html.updateDepth(map.depth);
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

    #tileIsInBounds(rowIndex, lineIndex) {
        return rowIndex >= 0 && lineIndex >= 0
            && rowIndex < this.#map.width && lineIndex < this.#map.height;
    }

    getTile(rowIndex, lineIndex, layerIndex, includeBorder = true) {
        if (this.#tileIsInBounds(rowIndex, lineIndex)) {
            // If within map bounds, grab from there
            return this.#map.lines[layerIndex][lineIndex][rowIndex];
        } else if (includeBorder) {
            // If outside map bounds, generate from border
            return this.#getTileFromBorder(rowIndex, lineIndex);
        }
        // If OOB and we don't want border
        return null;
    }

    // Builds line, using border for negative indexes
    // TODO: Should all instances of `#map` be `map` (also in getTileFromBorder)? Or do reverse in update()?
    #getLine(lineIndex, layerIndex) {
        const line = [];
        for (let x = this.left; x < this.left + this.width; x++) {
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
        this.#html.refresh(
            lines,
            this.map.depth,
            this.height,
            this.width,
        );
    }
}