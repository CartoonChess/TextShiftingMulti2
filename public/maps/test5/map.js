import Tile, { WarpTileScript } from '/js/Tile.js';
import { Coordinate } from '/js/GameMap.js';
export const tiles = [
    [
        [
            new Tile({ symbol: '0' }),
            new Tile({ symbol: '1' }),
            new Tile({ symbol: '2' }),
            new Tile({ symbol: '3' }),
            new Tile({ symbol: '4', color: 'green', scripts: [
                new WarpTileScript(new Coordinate(-1, -1), 'test4')
            ] })
        ],
        [
            new Tile({ symbol: '1' }),
            new Tile({ symbol: '1' }),
            new Tile({ symbol: 'x', isSolid: true }),
            new Tile({ symbol: 'x', isSolid: true }),
            new Tile({ symbol: 'x', isSolid: true })
        ],
        [
            new Tile({ symbol: '2' }),
            new Tile({ symbol: 'x', isSolid: true }),
            new Tile({ symbol: '2', backgroundColor: 'cyan' }),
            new Tile({ symbol: 'x', isSolid: true }),
            new Tile({ symbol: 'x', isSolid: true })
        ],
        [
            new Tile({ symbol: '3' }),
            new Tile({ symbol: 'x', isSolid: true }),
            new Tile({ symbol: 'x', isSolid: true }),
            new Tile({ symbol: '3' }),
            new Tile({ symbol: 'x', isSolid: true })
        ],
        [
            new Tile({ symbol: '4' }),
            new Tile({ symbol: 'x', isSolid: true }),
            new Tile({ symbol: 'x', isSolid: true }),
            new Tile({ symbol: 'x', isSolid: true }),
            new Tile({ symbol: '4' })
        ]
    ]
];

// import Tile, { WarpTileScript } from '../../js/Tile.js';
// import { Coordinate } from '../../js/GameMap.js';
// export const tiles = [
//     [
//         [
//             new Tile({ symbol: '0' }),
//             new Tile({ symbol: '1' }),
//             new Tile({ symbol: '2' }),
//             new Tile({ symbol: '3' }),
//             new Tile({ symbol: '4', color: 'green', scripts: [
//                 new WarpTileScript(new Coordinate(-1, -1), 'test4')
//             ] })
//         ],
//         [
//             new Tile({ symbol: '1' }),
//             new Tile({ symbol: '1' }),
//             new Tile({ symbol: 'x', isSolid: true }),
//             new Tile({ symbol: 'x', isSolid: true }),
//             new Tile({ symbol: 'x', isSolid: true })
//         ],
//         [
//             new Tile({ symbol: '2' }),
//             new Tile({ symbol: 'x', isSolid: true }),
//             new Tile({ symbol: '2' }),
//             new Tile({ symbol: 'x', isSolid: true }),
//             new Tile({ symbol: 'x', isSolid: true })
//         ],
//         [
//             new Tile({ symbol: '3' }),
//             new Tile({ symbol: 'x', isSolid: true }),
//             new Tile({ symbol: 'x', isSolid: true }),
//             new Tile({ symbol: '3' }),
//             new Tile({ symbol: 'x', isSolid: true })
//         ],
//         [
//             new Tile({ symbol: '4' }),
//             new Tile({ symbol: 'x', isSolid: true }),
//             new Tile({ symbol: 'x', isSolid: true }),
//             new Tile({ symbol: 'x', isSolid: true }),
//             new Tile({ symbol: '4' })
//         ]
//     ],
//     [
//         [
//             new Tile({ symbol: '0' }),
//             new Tile({ symbol: '1' }),
//             new Tile({ symbol: '2' }),
//             new Tile({ symbol: '3' }),
//             new Tile({ symbol: '4', color: 'green' })
//         ],
//         [
//             new Tile({ symbol: '1' }),
//             new Tile({ symbol: '1' }),
//             new Tile({ symbol: 'x', isSolid: true }),
//             new Tile({ symbol: 'x' }),
//             new Tile({ symbol: '' })
//         ],
//         [
//             new Tile({ symbol: '2' }),
//             new Tile({ symbol: 'x', isSolid: true }),
//             new Tile({ symbol: '2' }),
//             new Tile({ symbol: 'x', isSolid: true }),
//             new Tile({ symbol: 'x', isSolid: true })
//         ],
//         [
//             new Tile({ symbol: '3' }),
//             new Tile({ symbol: 'x', isSolid: true }),
//             new Tile({ symbol: 'x', isSolid: true }),
//             new Tile({ symbol: '3' }),
//             new Tile({ symbol: 'x', isSolid: true })
//         ],
//         [
//             new Tile({ symbol: '4' }),
//             new Tile({ symbol: 'x', isSolid: true }),
//             new Tile({ symbol: 'x', isSolid: true }),
//             new Tile({ symbol: 'x', isSolid: true }),
//             new Tile({ symbol: '4' })
//         ]
//     ]
// ];