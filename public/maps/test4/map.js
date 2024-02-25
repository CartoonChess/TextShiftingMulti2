import Tile, { WarpTileScript } from '/js/Tile.js';
import { Coordinate } from '/js/GameMap.js';
export const tiles = [
    [
        [
            new Tile({ symbol: '+', color: 'red', backgroundColor: 'blue' }),
            new Tile({ symbol: ',', color: 'red', backgroundColor: 'green' })
        ],
        [
            new Tile({ symbol: ' ', backgroundColor: 'green' }),
            new Tile({ symbol: ' ', backgroundColor: 'blue' })
        ]
    ],
    [
        [
            new Tile({ symbol: '4', color: 'yellow' }),
            new Tile({ symbol: '4', color: 'yellow', isSolid: true })
        ],
        [
            new Tile({ symbol: '4', color: 'yellow' }),
            new Tile({ symbol: '4', color: 'yellow', scripts: [
                new WarpTileScript(new Coordinate(-2, -2), 'test5')
            ] })
        ]
    ]
];