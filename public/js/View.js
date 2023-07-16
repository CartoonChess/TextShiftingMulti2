import { Coordinate } from './GameMap.js';
import Tile from './Tile.js';

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
        // TODO: Minimum 2?
        if (this.width % 2 === 0) {
            console.warn('View dimensions must be an odd number; shrinking width.');
            this.width--;
        }
        if (this.height % 2 === 0) {
            console.warn('View dimensions must be an odd number; shrinking height.');
            this.height--;
        }
        
        this.staticCenter = new Coordinate(
            Math.floor(this.width / 2),
            Math.floor(this.height / 2)
        );
        this.#updateHtml();
    }

    // Create lines in HTML
    #updateHtml() {
        const gameView = document.getElementById('game-view');

        for (let y = 0; y < this.height; y++) {
            // const line = document.createElement('code');
            const line = document.createElement('pre');
            // line.id = 'line' + y;
            gameView.appendChild(line);

            for (let x = 0; x < this.width; x++) {
                const tile = document.createElement('span');
                tile.textContent = ' ';
                line.appendChild(tile);
            }
            
            // Need to add linebreaks now for some reason
            // gameView.appendChild(document.createElement('br'));
        }
        // TODO: remove
        console.warn('!!! REMOVE DEBUG CODE FROM View.#updateHtml');
        const line = document.createElement('code');
        line.id = 'line' + 23;
        gameView.appendChild(line);
        gameView.appendChild(document.createElement('br'));
        const line2 = document.createElement('code');
        line2.id = 'line' + 24;
        gameView.appendChild(line2);
        gameView.appendChild(document.createElement('br'));
    }

    // TODO: definition throws a typescript warning
    set map(map) {
        this.#map = map;
        // Must set this here for e.g. asking about isVisible before updateView has ever been called
        this.mapCoordinateAtViewCenter = map.center;
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
    #getLine(lineIndex) {
        const line = [];
        for (let x = this.left; x < this.left + this.width; x++) {
            if (x >= 0 && lineIndex >= 0
               && x < this.#map.width && lineIndex < this.#map.height) {
                // If within map bounds, grab from there
                line.push(this.#map.lines[lineIndex][x]);
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
        
        // Generate map tiles
        for (let i = 0; i < this.height; i++) {
            lines[i] = this.#getLine(this.top + i);
        }
        // Add in remote players
        // for (const remotePlayer of remotePlayers) {
        for (const remotePlayer of remotePlayers.values()) {
            if (this.isVisible(remotePlayer)) {
                const lineIndex = remotePlayer.position.line - this.top;
                const columnIndex = remotePlayer.position.column - this.left;
                lines[lineIndex][columnIndex] = '%';
            }
        }
        // Show player at centre of both axes
        lines[this.staticCenter.line][this.staticCenter.column] = '@';
        
        // Print to screen
        const allLinesHtml = document.getElementById('game-view').children;
        console.log(allLinesHtml);
        for (let y = 0; y < this.height; y++) {
        // for (let line of lines) {
            // document.getElementById(`line${i}`).textContent = lines[i].join('');
            // const html = document.getElementById(`line${y}`);
            const allTilesHtml = allLinesHtml.item(y).children;
            // html.textContent = lines[i].join(' '); // corrects aspect ratio!
            for (let x = 0; x < this.width; x++) {
                // html.appendChild();
                allTilesHtml.item(x).textContent = lines[y][x];
            }
        }
        
        // TODO: remove
        console.warn('!!! REMOVE DEBUG CODE FROM View.update');
        const i = 23;
        const tile = new Tile();
        tile.symbol = '&';
        const debugLine = document.getElementById(`line${i}`);

        // for (let y)
        const span = document.createElement('span'); // 'code'?
        const span2 = document.createElement('span'); // 'code'?
        span.textContent = tile.symbol;
        span2.textContent = '*';
        // span.id = 'span' + y;
        debugLine.appendChild(span);
        debugLine.appendChild(span2);

        const debugLine2 = document.getElementById(`line${i+1}`);
        // for (let y)
        const span3 = document.createElement('span'); // 'code'?
        const span4 = document.createElement('span'); // 'code'?
        span3.textContent = tile.symbol;
        span4.textContent = '*';
        // span.id = 'span' + y;
        debugLine2.appendChild(span3);
        debugLine2.appendChild(span4);
    }
}