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

export class WarpTileScript {
    constructor(destinationCoordinate, destinationMap) {
        if (typeof destinationCoordinate === 'string') {
            return console.error('WarpTileScript must take at least one of two arguments, in order: a Coordinate and a string representing a map package name.');
        }
        this.destinationCoordinate = destinationCoordinate;
        this.destinationMap = destinationMap;
    }

    // TODO: Should some warping logic be handled here?
}

export default class Tile {
    //parent/derivedFrom?/"name/type/class"? for resuable tiles...?
    //id = Symbol(); // prob shouldn't do random, or else we can't refer to it in map design scripts
    symbol = ' '; //if type needed: GameSymbol
    isVisible = true;
    isSolid = false;
    //type = new Character(); //(collectable) item, (furniture-like) foreground?, background/solid...
    color = 0xff0000;
    backgroundColor = 0x00ff00; //can be null (transparent)
    // alpha/transparency (0.00 ~ 1?)
    image;
    //position = new Coordinate(0, 0);
    layer = 0; //or add Z to Coordinate
    // [facing]Direction = Direction.Down;
    // "action/trigger/script" -> for example, as an NPC, or a warp point

    constructor(json) {
        if (!json) { return; }
        if (json.symbol) { this.symbol = json.symbol };
        if (json.isSolid) { this.isSolid = json.isSolid };
        if (json.color) { this.color = json.color };
        if (json.backgroundColor) { this.backgroundColor = json.backgroundColor };
        this.scripts = json.scripts;
    }
}