export class Coordinate {
    constructor(column, line) {
        this.column = column;
        this.line = line;
    }
    static fromObject(obj) {
        return Object.assign(new this, obj);
    }
    static fromJson(json) {
        return Object.assign(new this, JSON.parse(json));
    }
    toJson() {
        return JSON.stringify(this);
    }
    toString() {
        return `(x: ${this.column}, y: ${this.line})`;
    }
    // possibly provide some func/prop that provides .leftOfMe
}

// import fs from 'node:fs';
// fs.readFile('../maps/29x29', 'utf8', function (err, data) {
//     if (err) { return console.log(err); }
//     console.log(data);
// });
export class Map {
    #center;
    lines = [];
    
    constructor(width, height) {
        this.width = width;
        this.height = height;

        this.#center = new Coordinate(
            Math.floor(this.width / 2),
            Math.floor(this.height / 2)
        );
    }
    
    get center() {
        return this.#center;
    }

    async loadFromFile() {
        // try {
        //     const response = await import('../maps/1x1.js');
        //     console.log(response.map);
        // } catch(err) {
        //     console.log(err);
        // }
        let data;
        try {
            const response = await fetch('../maps/29x29');
            data = await response.text();
        } catch (err) {
            return console.error(`Map.loadFromFile failed with error: ${err}`);
        }

        // this.lines = data.split('\n');
        const lines = data.split('\n');
        for (let i = 0; i < lines.length; i++) {
            lines[i] = lines[i].split('');
        }
        console.log(lines);
        this.lines = lines;
    }

    generateTestMap(viewWidth, viewHeight, boundCharacter) {
        // Build walls around player acessible area
        // TODO: Someday we'll provide for when the map is smaller than the view
        if (!boundCharacter) { boundCharacter = '#'; }

        const leftBound = Math.floor(viewWidth / 2) - 1;
        const rightBound = this.width - leftBound - 1;
        const topBound = Math.floor(viewHeight / 2) - 1;
        const bottomBound = this.height - topBound - 1;
    
        for (let y = 0; y < this.height; y++) {
            if (y === topBound || y === bottomBound) {
                this.lines.push(Array(this.width).fill(boundCharacter));
                continue;
            }
            const line = [];
            for (let x = 0; x < this.width; x++) {
                if (x === leftBound || x === rightBound) {
                    line.push(boundCharacter);
                    continue;
                }
                const randomNumber = Math.random();
                let character;
    
                if (randomNumber < 0.65) {
                    character = ' ';
                } else if (randomNumber < 0.8) {
                    character = '.';
                } else if (randomNumber < 0.95) {
                    character = ',';
                } else if (randomNumber < 0.99) {
                    // character = solidCharacter;
                    character = boundCharacter;
                } else {
                    character = '~';
                }
    
                line.push(character);
            }
            this.lines.push(line);
        }
    }
}

import '/String_prototype.js';

export class View {
    // half the width and height of the view
    staticCenter;
    map;
    // the current corresponding map coordinate directly under the static center
    mapCoordinateAtViewCenter;
    // the column/row of map at the bounds of the view
    #left;
    #right;
    #top;
    #bottom;

    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.staticCenter = new Coordinate(
            Math.floor(this.width / 2),
            Math.floor(this.height / 2)
        );
    }

    set map(map) {
        this.map = map;
        this.mapCoordinateAtViewCenter = map.center;
    }

    // TODO: rename these ... mapColumnAtViewLeft?
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
        if (mapCenter) { this.mapCoordinateAtViewCenter = mapCenter; }
        const isInXView = tile.position.column >= this.left && tile.position.column <= this.right;
        const isInYView = tile.position.line >= this.top && tile.position.line <= this.bottom;
        return isInXView && isInYView;
    }

    // function updateText() {
    // TODO: Have this use map ref var instead, after map obj has lines
    update(player, remotePlayers) {
        this.mapCoordinateAtViewCenter = player.position;
        const lines = [];
        // Generate map lines and local player
        for (let i = 0; i < this.height; i++) {
            var lineIndex = this.top + i;
            // lines[i] = this.arrays[lineIndex].slice(this.left, this.left + this.width).join('');
            lines[i] = this.map.lines[lineIndex].slice(this.left, this.left + this.width).join('');
            // Show @char at centre of both axes
            if (i === this.staticCenter.line) {
                lines[i] = lines[i].replaceCharAt(this.staticCenter.column, '@');
            }
        }
        // Add in remote players
        for (const remotePlayer of remotePlayers) {
            if (this.isVisible(remotePlayer)) {
                lineIndex = remotePlayer.position.line - this.top;
                const columnIndex = remotePlayer.position.column - this.left;
                lines[lineIndex] = lines[lineIndex].replaceCharAt(columnIndex, '%');
            }
        }
        // Print to screen
        for (let i = 0; i < this.height; i++) {
            document.getElementById(`line${i}`).textContent = lines[i];
        }
        // Used to determine whether player can move again
        // TODO: We should do this at time of move instead
        // player.surroundings.update(player.position, this.arrays);
        player.surroundings.update(player.position, this.map.lines);
    }
}