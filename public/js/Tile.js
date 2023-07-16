export default class Tile {
    //parent/derivedFrom?/"name/type/class"? for resuable tiles...?
    //id?
    symbol = ' ';
    visible = true;
    solid = false;
    type = new Character(); //(collectable) item, (furniture-like) foreground?, background/solid...
    color = 0xff0000;
    backgroundColor = 0x00ff00; //can be null (transparent)
    image;
    symbol; //if type needed: GameSymbol
    position: new Coordinate(0, 0);
    layer = 0; //or add Z to Coordinate
    // "action/trigger/script" -> for example, as an NPC, or a warp point

    constructor(foo) {
        this.foo = foo;
    }
    static baz(foo) {
        //
    }
}