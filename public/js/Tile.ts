// TODO: If we're using json anyway, do we even need this?
// Maybe more for archtypes, like ogres and chairs?
// - Perhaps func/construct/etc. for mapping directly to element...style(.color) props
// --or maybe that's just the view's responsibility

// export class TileScript {}

// export class TileScripts {
//     constructor(scripts = []) {
//         this.scripts = scripts;
//     }
// }

import { Coordinate } from "./GameMap.js"

interface TileScript {}

export class WarpTileScript implements TileScript {
    destinationCoordinate: Coordinate
    destinationMap?: string

    constructor(destinationCoordinate: Coordinate, destinationMap?: string) {
        if (typeof destinationCoordinate === 'string') {
            throw new Error('WarpTileScript must take at least one of two arguments, in order: a Coordinate and a string representing a map package name.')
        }
        this.destinationCoordinate = destinationCoordinate
        this.destinationMap = destinationMap
    }

    // TODO: Should some warping logic be handled here?
}

export default class Tile {
    //parent/derivedFrom?/"name/type/class"? for resuable tiles...?
    //id = Symbol(); // prob shouldn't do random, or else we can't refer to it in map design scripts
    symbol = ' ' //if type needed: GameSymbol
    isVisible? = true
    isSolid? = false
    //type = new Character(); //(collectable) item, (furniture-like) foreground?, background/solid...
    color? = 'inherit' // default (like black)
    // TODO: Better just to have View.updateView() strip `.style` properties when undefined?
    // backgroundColor = 0x00ff00; //can be null (transparent)
    backgroundColor? = 'inherit'
    // alpha/transparency (0.00 ~ 1?)
    // image
    //position = new Coordinate(0, 0);
    layer? = 0 //or add Z to Coordinate
    // [facing]Direction = Direction.Down;
    // "action/trigger/script" -> for example, as an NPC, or a warp point

    // TODO: TileScript interface?
    scripts?: TileScript[]
    // #scripts;
    // _scripts;

    constructor(json: { symbol: string; isSolid: boolean | undefined; color: string | undefined; backgroundColor: string | undefined; scripts: TileScript[] | undefined }) {
        if (!json) { return }
        if (json.symbol) { this.symbol = json.symbol }
        if (json.isSolid) { this.isSolid = json.isSolid }
        if (json.color) { this.color = json.color }
        if (json.backgroundColor) { this.backgroundColor = json.backgroundColor }
        this.scripts = json.scripts
    }

    // get scripts() {
    //     // if (arr.length > 0) {
    //         return this.#scripts;
    //     // }
    // }

    // // Remove scripts altogether if array becomes empty
    // set scripts(arr) {
    //     // if (arr.length === 0) {
    //     //     delete this.#scripts;
    //     // } else {
    //         this.#scripts = arr;
    //     // }
    // }



    // get scripts() {
    //     if (arr.length > 0) {
    //         return this._scripts;
        // }
    // }

    // Remove scripts altogether if array becomes empty
    // set scripts(arr) {
    //     if (arr.length === 0) {
    //         delete this._scripts;
    //     } else {
    //         this._scripts = arr;
    //     }
    // }
}