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

    constructor(width, height) {
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
        
        // this.staticCenter = new Coordinate(
        //     Math.floor(this.width / 2),
        //     Math.floor(this.height / 2)
        // );
        this.#updateStaticCenter();
        this.#updateHtml();
    }

    #updateStaticCenter() {
        this.staticCenter = new Coordinate(
            Math.floor(this.width / 2),
            Math.floor(this.height / 2)
        );
    }

    #addHtmlLayers(layers, gameView) {
        for (let z = 0; z < layers; z++) {
            const layer = document.createElement('div');
            gameView.appendChild(layer);
            
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

    resize(widthDifference, heightDifference) {
        this.width += widthDifference;
        this.height += heightDifference;
        this.#updateStaticCenter();
        
        const gameView = document.getElementById('game-view');
        this.#resizeHtml(gameView, widthDifference, heightDifference);
        this.update();
    }

    #resizeHtml(gameView, widthDifference, heightDifference) {
        // const allLayers = gameView.children;
        // const allLines = allLayers.item(z).children;
        
        // for (let z = 0; z < layers; z++) {
        for (const layer of gameView.children) {
            // const layer = document.createElement('div');
            // gameView.appendChild(layer);

            // TODO: Account for negative values too
            for (let y = 0; y < heightDifference; y++) {
                const line = document.createElement('pre');
                // const line2 = document.createElement('pre');
                layer.appendChild(line);
                // layer.appendChild(line2);

                // TODO: Account for widthDifference
                for (let x = 0; x < this.width; x++) {
                    const tile = document.createElement('span');
                    tile.textContent = ' ';
                    line.appendChild(tile);
                    // const tile2 = document.createElement('span');
                    // tile2.textContent = ' ';
                    // line2.appendChild(tile2);
                }
            }
        }

        // TODO: how do we get player back in center?
        // -note that currently their position does not visually match the computed one
    }

    #removeHtmlLayers(layers, gameView) {
        // TODO: probably going to need to do the same for x/y for changing view size later
        // while (allTilesHtml.item(x).firstChild) {
        //     allTilesHtml.item(x).removeChild(allTilesHtml.item(x).firstChild);
        // }
        for (let z = layers; z < 0; z++) {
            gameView.removeChild(gameView.firstChild);
        }
    }

    #updateHtml() {
        // If creating for the first time (before map is loaded), just make one layer
        let depth = 1;
        if (this.map?.depth) { depth = this.map.depth; }
        
        const gameView = document.getElementById('game-view');
        
        const currentNumberOfHtmlLayers = gameView.children.length;
        const difference = depth - currentNumberOfHtmlLayers;
        if (difference > 0) {
            this.#addHtmlLayers(difference, gameView);
        } else if (difference < 0) {
            this.#removeHtmlLayers(difference, gameView);
        } else {
            // Resizing x/y
            // Ideally we add equally one row to opposite sides so that map remains centered
            // const line = document.createElement('pre');
            // gameView[layer].insertBefore(div, gameView.firstChild);
            // this.#resizeHtml(gameView);
        }
        
        // If same number of layers as before, no need to make a change
        // TODO: This will probably change when we allow changing view dimensions
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
        const allLayersHtml = document.getElementById('game-view').children;
        for (let z = 0; z < this.map.depth; z++) {
            const allLinesHtml = allLayersHtml.item(z).children;
            for (let y = 0; y < this.height; y++) {
                const allTilesHtml = allLinesHtml.item(y).children;
                for (let x = 0; x < this.width; x++) {
                    allTilesHtml.item(x).textContent = lines[z][y][x].symbol;
                    allTilesHtml.item(x).style.color = lines[z][y][x].color;
                    allTilesHtml.item(x).style.backgroundColor = lines[z][y][x].backgroundColor;
                }
            }
        }
    }
}