// TODO: If we're using json anyway, do we even need this?
// Maybe more for archtypes, like ogres and chairs?
// - Perhaps func/construct/etc. for mapping directly to element...style(.color) props
// --or maybe that's just the view's responsibility
export class WarpTileScript {
    constructor(destinationCoordinate, destinationMap) {
        if (typeof destinationCoordinate === 'string') {
            throw new Error('WarpTileScript must take at least one of two arguments, in order: a Coordinate and a string representing a map package name.');
        }
        this.destinationCoordinate = destinationCoordinate;
        this.destinationMap = destinationMap;
    }
}
export default class Tile {
    // #scripts;
    // _scripts;
    // constructor(json: { symbol: string; isSolid: boolean | undefined; color: string | undefined; backgroundColor: string | undefined; scripts: TileScript[] | undefined }) {
    constructor(json) {
        //parent/derivedFrom?/"name/type/class"? for resuable tiles...?
        //id = Symbol(); // prob shouldn't do random, or else we can't refer to it in map design scripts
        this.symbol = ' '; //if type needed: GameSymbol
        this.isVisible = true;
        this.isSolid = false;
        //type = new Character(); //(collectable) item, (furniture-like) foreground?, background/solid...
        this.color = 'inherit'; // default (like black)
        // TODO: Better just to have View.updateView() strip `.style` properties when undefined?
        // backgroundColor = 0x00ff00; //can be null (transparent)
        this.backgroundColor = 'inherit';
        // alpha/transparency (0.00 ~ 1?)
        // image
        //position = new Coordinate(0, 0);
        this.layer = 0; //or add Z to Coordinate
        // FIXME: Will undefineds overwrite defaults?
        // if (!json) { return }
        // if (json.symbol) { this.symbol = json.symbol }
        this.symbol = json.symbol;
        // if (json.isSolid) { this.isSolid = json.isSolid }
        this.isSolid = json.isSolid;
        // if (json.color) { this.color = json.color }
        this.color = json.color;
        // if (json.backgroundColor) { this.backgroundColor = json.backgroundColor }
        this.backgroundColor = json.backgroundColor;
        this.scripts = json.scripts;
    }
}
