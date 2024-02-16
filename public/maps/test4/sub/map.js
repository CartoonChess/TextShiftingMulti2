import Tile, { WarpTileScript } from '/js/Tile.js';
import { Coordinate } from '/js/GameMap.js';
export const tiles = [
    [
        [
            new Tile({ symbol: '+', color: 'red', backgroundColor: 'blue' }),
            new Tile({ symbol: ',', color: 'red', backgroundColor: 'green', isSolid: true })
        ],
        [
            new Tile({ symbol: ' ', backgroundColor: 'green' }),
            new Tile({ symbol: ' ', backgroundColor: 'blue' })
        ]
    ],
    [
        [
            new Tile({ symbol: 's', color: 'yellow' }),
            new Tile({ symbol: 'u', color: 'yellow', isSolid: true })
        ],
        [
            new Tile({ symbol: 'u', color: 'yellow' }),
            new Tile({ symbol: 'b', color: 'yellow', scripts: [
                new WarpTileScript(new Coordinate(-2, -2), 'test5')
            ] })
        ]
    ]
];