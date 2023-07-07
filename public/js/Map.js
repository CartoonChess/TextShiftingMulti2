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

class MapBorder {
    // constructor(width, height) {
        
    // }
    width = 4;
    height = 4;
    lines = [
        ['a', 'b', 'c', 'd'],
        ['b', 'c', 'd', 'e'],
        ['c', 'd', 'e', 'f'],
        ['d', 'e', 'f', 'g']
    ];
}

export class Map {
    #center;
    lines = [];
    border;
    
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

    async loadFromFile(filePath) {
        // try {
        //     const response = await import('../maps/1x1.js');
        //     console.log(response.map);
        // } catch(err) {
        //     console.log(err);
        // }
        let data;
        try {
            const response = await fetch(filePath);
            data = await response.text();
        } catch (err) {
            return console.error(`Map.loadFromFile(${`filePath`}) failed with error: ${err}`);
        }

        // Split into 2D array of lines and their tiles
        const lines = data.split('\n');
        for (let i = 0; i < lines.length; i++) {
            lines[i] = lines[i].split('');
        }
        this.lines = lines;

        // TODO: Import this from somewhere instead
        this.border = new MapBorder();
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
        this.#updateHTML();
    }

    // Create lines in HTML
    #updateHTML() {
        const gameView = document.getElementById('game-view');

        for (let i = 0; i < this.width; i++) {
            const line = document.createElement('code');
            line.id = 'line' + i;
            gameView.appendChild(line);
            // Need to add linebreaks now for some reason
            gameView.appendChild(document.createElement('br'));
        }
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

    #getTileFromBorder(x, y) {
        // Width and height of the repeating border block
        const width = this.map.border.width;
        const height = this.map.border.height;

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

        return this.map.border.lines[line][column];
    }

    // Builds line, using border for negative indexes
    #getLine(lineIndex) {
        const line = [];
        for (let x = this.left; x < this.left + this.width; x++) {
            if (x >= 0 && lineIndex >= 0
               && x < this.map.width && lineIndex < this.map.height) {
                // If within map bounds, grab from there
                line.push(this.map.lines[lineIndex][x]);
            } else {
                // If outside map bounds, generate from border
                line.push(this.#getTileFromBorder(x, lineIndex));
            }
        }
        return line;
    }

    update(player, remotePlayers) {
        this.mapCoordinateAtViewCenter = player.position;
        const lines = [];
        
        // Generate map lines and local player
        for (let i = 0; i < this.height; i++) {
            lines[i] = this.#getLine(this.top + i);
            
            // Show @char at centre of both axes
            if (i === this.staticCenter.line) {
                lines[i][this.staticCenter.column] = '@';
            }
        }
        // Add in remote players
        for (const remotePlayer of remotePlayers) {
            if (this.isVisible(remotePlayer)) {
                const lineIndex = remotePlayer.position.line - this.top;
                const columnIndex = remotePlayer.position.column - this.left;
                lines[lineIndex][columnIndex] = '%';
            }
        }
        // Print to screen
        for (let i = 0; i < this.height; i++) {
            document.getElementById(`line${i}`).textContent = lines[i].join('');
        }
        // Used to determine whether player can move again
        // TODO: We should do this at time of move instead
        player.surroundings.update(player.position, this.map.lines);
    }
}