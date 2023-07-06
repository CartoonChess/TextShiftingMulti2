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

// TODO: Work global logic in here
export class Map {
    #center;
    lines = [];
    
    constructor(width, height) {
        this.width = width;
        this.height = height;

        this.#generateArrays();
    }
    
    get center() {
        return new Coordinate(
            Math.floor(this.width / 2),
            Math.floor(this.height / 2)
        );
    }

    // #generateArrays(width, height) {
    #generateArrays() {
    // function generateArrays(width, height, topBound, bottomBound) {
        // Build walls around player acessible area
        // TODO: Someday we'll provide for when the map is smaller than the view
        const boundCharacter = '#';
        
        // const lines = [];

        // TODO: Don't use these
        // const leftBound = Math.floor(view.width / 2) - 1;
        const leftBound = Math.floor(9 / 2) - 1;
        const rightBound = this.width - leftBound - 1;
        // const topBound = Math.floor(view.height / 2) - 1;
        const topBound = Math.floor(9 / 2) - 1;
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
        
        // return lines;
    }
}

import '/String_prototype.js';

export class View {
    mapCenter;
    localCenter;
    #left;
    #right;
    #top;
    #bottom;

    // Currently this MUST be set separately for things to work
    arrays;

    // TODO: replace mapCenter and arrays with map object later
    constructor(width, height, mapCenter) {
        this.width = width;
        this.height = height;
        this.mapCenter = mapCenter;
        this.localCenter = new Coordinate(
            Math.floor(this.width / 2),
            Math.floor(this.height / 2)
        );

        // this.arrays = arrays;
    }

    get left() {
        return this.mapCenter.column - Math.floor(this.width / 2);
    }
    get right() {
        return this.mapCenter.column + Math.floor(this.width / 2);
    }
    get top() {
        return this.mapCenter.line - Math.floor(this.height / 2);
    }
    get bottom() {
        return this.mapCenter.line + Math.floor(this.height / 2);
    }
    
    isVisible(tile, mapCenter) {
        if (mapCenter) { this.mapCenter = mapCenter; }
        const isInXView = tile.position.column >= this.left && tile.position.column <= this.right;
        const isInYView = tile.position.line >= this.top && tile.position.line <= this.bottom;
        return isInXView && isInYView;
    }

    // function updateText() {
    // TODO: Have this use map ref var instead, after map obj has lines
    update(player, remotePlayers) {
        this.mapCenter = player.position;
        const lines = [];
        // Generate map lines and local player
        for (let i = 0; i < this.height; i++) {
            var lineIndex = this.top + i;
            lines[i] = this.arrays[lineIndex].slice(this.left, this.left + this.width).join('');
            // Show @char at centre of both axes
            if (i === this.localCenter.line) {
                lines[i] = lines[i].replaceCharAt(this.localCenter.column, '@');
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
        player.surroundings.update(player.position, this.arrays);
    }
}