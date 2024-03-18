import '../../ConsoleColor.js'
import { Coordinate, GameMap, GameMapLines3D } from './GameMap.js'

class ViewHtml {
    #container

    #width?: number
    #height?: number
    // #depth

    constructor(htmlId: string, width: number, height: number) {
        const possibleElement = document.getElementById(htmlId)
        if (!possibleElement) {
            throw new Error(`Couldn't create ViewHtml: No element with ID ${htmlId}.`)
        }
        this.#container = possibleElement
        this.updateDepth(1, height, width)
    }

    get container() {
        return this.#container
    }

    get depth() {
        return this.#container.children.length
    }

    get height() {
        // return this.#container.firstChild.children.length
        return this.#container.firstElementChild?.children.length
    }

    get width() {
        // return this.#container.firstChild.firstChild.children.length
        return this.#container.firstElementChild?.firstElementChild?.children.length
    }

    #addLayers(layers: number, height: number | undefined, width: number | undefined) {
        if (!height) { height = this.#height }
        if (!width) { width = this.#width }
        if (!height || !width ) { throw new Error(`ViewHtml.#addLayers() was called without passing height and width arguments while ViewHtml instance couldn't calculate these values implicitly.`) }
        
        for (let z = 0; z < layers; z++) {
            const layer = document.createElement('div')
            this.#container.appendChild(layer)

            for (let y = 0; y < height; y++) {
                const line = document.createElement('pre')
                layer.appendChild(line)
    
                for (let x = 0; x < width; x++) {
                    const tile = document.createElement('span')
                    // TODO: Should this be ''? Don't we overwrite it anyway?
                    tile.textContent = ' '
                    line.appendChild(tile)
                }
            }
        }
    }
    
    #removeLayers(layers: number) {
        for (let z = layers; z < 0; z++) {
            if (!this.#container.firstElementChild) {
                throw new Error(`ViewHtml.#removeLayers() failed: #container property has no element children.`)
            }
            this.#container.removeChild(this.#container.firstElementChild)
        }
    }

    updateDepth(depth: number, height?: number, width?: number) {
        // if (!depth) { return console.error('Must pass ViewHtml.updateDepth() a depth argument.') }
        
        const currentNumberOfLayers = this.#container.children.length
        const difference = depth - currentNumberOfLayers
        
        if (difference > 0) {
            this.#addLayers(difference, height, width)
        } else if (difference < 0) {
            // this.#removeLayers(difference, height, width)
            this.#removeLayers(difference)
        }
    }

    increaseHeight(difference: number) {
        // Get this before making any changes
        const width = this.#width
        if (!width) {
            throw new Error(`Couldn't execute ViewHtml.increaseHeight(): Property #width is undefined.`)
        }
        
        for (const layer of this.#container.children) {
            for (let y = 0; y < difference / 2; y++) {
                const topLine = document.createElement('pre')
                layer.insertBefore(topLine, layer.firstElementChild)
                const bottomLine = topLine.cloneNode()
                layer.appendChild(bottomLine)

                for (let x = 0; x < width; x++) {
                    const topTile = document.createElement('span')
                    topTile.textContent = ' '
                    topLine.appendChild(topTile)
                    const bottomTile = topTile.cloneNode(true)
                    bottomLine.appendChild(bottomTile)
                }
            }
        }
    }

    decreaseHeight(difference: number) {
        for (const layer of this.#container.children) {
            for (let y = difference / 2; y < 0; y++) {
                // TODO: Handle this as an error instead?
                // Account with attempting to shrink below minimum (1? 3?)
                if (!layer.firstElementChild || !layer.lastElementChild) {
                    // throw new Error()
                    continue
                }

                layer.removeChild(layer.firstElementChild)
                layer.removeChild(layer.lastElementChild)
            }
        }
    }

    increaseWidth(difference: number) {
        for (const layer of this.#container.children) {
            for (const line of layer.children) {
                for (let x = 0; x < difference / 2; x++) {
                    const leftTile = document.createElement('span')
                    leftTile.textContent = ' '
                    line.insertBefore(leftTile, line.firstElementChild)
                    const rightTile = leftTile.cloneNode(true)
                    line.appendChild(rightTile)
                }
            }
        }
    }
    
    decreaseWidth(difference: number) {
        for (const layer of this.#container.children) {
            for (const line of layer.children) {
                for (let x = difference / 2; x < 0; x++) {
                    // TODO: Handle this as an error instead?
                    // Account with attempting to shrink below minimum (1? 3?)
                    if (!line.firstElementChild || !line.lastElementChild) {
                        // throw new Error()
                        continue
                    }
                    line.removeChild(line.firstElementChild)
                    line.removeChild(line.lastElementChild)
                }
            }
        }
    }

    // Update each tile
    refresh(lines: GameMapLines3D, depth: number, height: number, width: number) {
        const allLayersHtml = this.#container.children
        for (let z = 0; z < depth; z++) {
            // const allLinesHtml = allLayersHtml.item(z)?.children
            // if (!allLinesHtml) {
                //     throw new Error(`ViewHtml.refresh() failed: allLayersHtml.item(${z}) is null.`)
                // }
            const allLinesHtml = allLayersHtml[z].children
            for (let y = 0; y < height; y++) {
                // const allTilesHtml = allLinesHtml.item(y)?.children
                // if (!allTilesHtml) {
                //     throw new Error(`ViewHtml.refresh() failed: allTilesHtml.item(${z}) is null.`)
                // }
                // const allTilesHtml = allLinesHtml[y].children
                const allTilesHtml = allLinesHtml[y].children as HTMLCollectionOf<HTMLElement>
                for (let x = 0; x < width; x++) {
                    // Default values provided to prevent ghosting
                    // allTilesHtml.item(x).textContent = lines[z][y][x].symbol ? lines[z][y][x].symbol : ' '
                    // allTilesHtml.item(x).style.backgroundColor = lines[z][y][x].backgroundColor ? lines[z][y][x].backgroundColor : 'inherit'
                    // allTilesHtml.item(x).style.color = lines[z][y][x].color
                    allTilesHtml[x].textContent = lines[z][y][x].symbol ? lines[z][y][x].symbol : ' '
                    // allTilesHtml[x].style.backgroundColor = lines[z][y][x].backgroundColor ? lines[z][y][x].backgroundColor : 'inherit'
                    allTilesHtml[x].style.backgroundColor = lines[z][y][x].backgroundColor ?? 'inherit'
                    // allTilesHtml[x].style.color = lines[z][y][x].color
                    allTilesHtml[x].style.color = lines[z][y][x].color ?? 'inherit'
                }
            }
        }
    }
}


import Tile from './Tile.js'
import { Player, RemotePlayer } from './Character.js'

export class View {
    // half the width and height of the view
    // We assert this because TS doesn't pick up on #updateStaticCenter() in constructor
    staticCenter!: Coordinate
    #map: GameMap
    // the current corresponding map coordinate directly under the static center
    // mapCoordinateAtViewCenter: Coordinate
    mapCoordinateAtViewCenter = new Coordinate(0, 0)
    // the column/row of map at the bounds of the view
    // #left: number
    // #right: number
    // #top: number
    // #bottom: number
    #html?: ViewHtml

    width: number
    height: number

    // constructor(width: number, height: number, htmlId: string) {
    constructor(width: number, height: number, htmlId: string, map: GameMap) {
        this.width = width > 0 ? width : 1
        this.height = height > 0 ? height : 1

        // View should always be an odd number
        // If not, staticCenter will cause OBOE
        // TODO: Minimum 3?
        if (this.width % 2 === 0) {
            console.warn('View dimensions must be an odd number; shrinking width.')
            this.width--
        }
        if (this.height % 2 === 0) {
            console.warn('View dimensions must be an odd number; shrinking height.')
            this.height--
        }
        
        this.#updateStaticCenter()
        
        if (htmlId) {
            this.html = htmlId
        }

        this.#map = map
    }

    set html(id: string) {
        this.#html = new ViewHtml(id, this.width, this.height)
    }

    get htmlById() {
        return this.#html?.container
    }

    #updateStaticCenter() {
        this.staticCenter = new Coordinate(
            Math.floor(this.width / 2),
            Math.floor(this.height / 2)
        );
    }

    // Adjust view size by an even number of rows/columns
    #adjustResizeDifference(size: number): number {
        if (Math.abs(size) === 1) {
            // Minimum of (-)2
            size = size * 2
        } else {
            // Must be even; round down
            size -= size % 2
        }
        return size
    }

    // Make sure caller also calls updateView(...) after!
    resizeBy(widthDifference: number, heightDifference: number) {
        heightDifference = this.#adjustResizeDifference(heightDifference)
        this.height += heightDifference

        if (heightDifference > 0) {
            this.#html?.increaseHeight(heightDifference)
        } else if (heightDifference < 0) {
            this.#html?.decreaseHeight(heightDifference)
        }

        widthDifference = this.#adjustResizeDifference(widthDifference)
        this.width += widthDifference
        
        if (widthDifference > 0) {
            this.#html?.increaseWidth(widthDifference)
        } else if (widthDifference < 0) {
            this.#html?.decreaseWidth(widthDifference)
        }

        this.#updateStaticCenter()
    }

    resizeTo(width: number, height: number) {
        const widthDifference = width - this.width
        const heightDifference = height - this.height
        this.resizeBy(widthDifference, heightDifference)
    }

    set map(map: GameMap) {
        this.#map = map
        // Must set this here for e.g. asking about isVisible before updateView has ever been called
        this.mapCoordinateAtViewCenter = map.center
        // Update HTML based on number of layers
        // this.#html.updateDepth();
        this.#html?.updateDepth(map.depth)
    }

    get map() {
        return this.#map
    }

    // TODO: rename these ... mapColumnAtViewLeft? leftmostVisibleMapColumn?
    // get left() {
    get #left() {
        return this.mapCoordinateAtViewCenter.column - Math.floor(this.width / 2)
    }
    // get right() {
    get #right() {
        return this.mapCoordinateAtViewCenter.column + Math.floor(this.width / 2)
    }
    // get top() {
    get #top() {
        return this.mapCoordinateAtViewCenter.line - Math.floor(this.height / 2)
    }
    // get bottom() {
    get #bottom() {
        return this.mapCoordinateAtViewCenter.line + Math.floor(this.height / 2)
    }

    // TODO: Better typing on "tile"
    // Currently only used for RemotePlayer objects
    isVisible(tile: RemotePlayer, mapCenter?: Coordinate): boolean {
        // This isn't currently in use
        if (mapCenter) { this.mapCoordinateAtViewCenter = mapCenter }
        
        if (tile.mapName !== this.#map.name) { return false }
        
        const isInXView = tile.position.column >= this.#left && tile.position.column <= this.#right
        const isInYView = tile.position.line >= this.#top && tile.position.line <= this.#bottom
        return isInXView && isInYView
    }

    #getTileFromBorder(x: number, y: number): Tile {
        // Width and height of the repeating border block
        const width = this.#map.border.width
        const height = this.#map.border.height

        // The indexes within the border block
        let column = x % width
        let line = y % height

        // Negative values require a little counting backwards then forward
        if (x < 0) {
            column = (column + width) % width
        }
        if (y < 0) {
            line = (line + height) % height
        }

        // return this.#map.border.lines[line][column];
        const fakeLayer = 0
        return this.#map.border.lines[fakeLayer][line][column]
    }

    #tileIsInBounds(rowIndex: number, lineIndex: number): boolean {
        return rowIndex >= 0 && lineIndex >= 0
            && rowIndex < this.#map.width && lineIndex < this.#map.height
    }

    // getTile(rowIndex: number, lineIndex: number, layerIndex: number, includeBorder = true): Tile | null {
    getTile(rowIndex: number, lineIndex: number, layerIndex: number, includeBorder = true): Tile {
        if (this.#tileIsInBounds(rowIndex, lineIndex)) {
            // If within map bounds, grab from there
            return this.#map.lines[layerIndex][lineIndex][rowIndex]
        } else if (includeBorder) {
            // If outside map bounds, generate from border
            return this.#getTileFromBorder(rowIndex, lineIndex)
        }
        // If OOB and we don't want border
        // return null
        return new Tile({ symbol: ' '})
    }

    // Builds line, using border for negative indexes
    // TODO: Should all instances of `#map` be `map` (also in getTileFromBorder)? Or do reverse in update()?
    // #getLine(lineIndex: number, layerIndex: number): (Tile | null)[] {
    #getLine(lineIndex: number, layerIndex: number): Tile[] {
        const line = []
        for (let x = this.#left; x < this.#left + this.width; x++) {
            // if (x >= 0 && lineIndex >= 0
            //    && x < this.#map.width && lineIndex < this.#map.height) {
            //     // If within map bounds, grab from there
            //     line.push(this.#map.lines[layerIndex][lineIndex][x]);
            // } else {
            //     // If outside map bounds, generate from border
            //     line.push(this.#getTileFromBorder(x, lineIndex));
            // }
            line.push(this.getTile(x, lineIndex, layerIndex))
        }
        return line
    }

    #getLinesWithUpdatedRemotePlayers(remotePlayers: Map<string, RemotePlayer>, lines: GameMapLines3D): GameMapLines3D {
        for (const remotePlayer of remotePlayers.values()) {
            if (this.isVisible(remotePlayer)) {
                const lineIndex = remotePlayer.position.line - this.#top
                const columnIndex = remotePlayer.position.column - this.#left
                lines[this.map.depth - 1][lineIndex][columnIndex] = { symbol: '%', color: 'red' }
            }
        }
        
        return lines
    }

    // update(player: Player, remotePlayers: RemotePlayer[]) {
    update(player: Player, remotePlayers?: Map<string, RemotePlayer>) {
        // Sanity check
        // if (!player.position) { return }
        
        this.mapCoordinateAtViewCenter = player.position
        // const lines = []
        let lines: GameMapLines3D = [[[]]]
        
        for (let z = 0; z < this.map.depth; z++) {
            // Must explicitly define parent dimension of array (`lines[z]`), or else can't assign to child (`lines[z][y]`)
            lines[z] = [];
            for (let y = 0; y < this.height; y++) {
                lines[z][y] = this.#getLine(this.#top + y, z)
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
            lines = this.#getLinesWithUpdatedRemotePlayers(remotePlayers, lines)
        }
        
        // Show player at centre of both axes
        lines[this.map.depth - 1][this.staticCenter.line][this.staticCenter.column] = { symbol: '@', color: 'red' };
        
        // Print to screen
        this.#html?.refresh(
            lines,
            this.map.depth,
            this.height,
            this.width,
        );
    }
}