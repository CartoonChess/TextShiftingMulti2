// export const tiles = [
//     [
//         '0',
//         'x',
//         'X'
//     ],
//     [
//         'y',
//         '1',
//         '*'
//     ],
//     [
//         'Y',
//         '*',
//         '2'
//     ]
// ];

// export const tiles = [
//     [
//         { symbol: '0', color: 'blue' },
//         { symbol: 'x', color: 'green' },
//         { symbol: 'X', color: 'blue' }
//     ],
//     [
//         { symbol: 'y', color: 'green' },
//         { symbol: '1', color: 'blue' },
//         { symbol: '*', color: 'green' }
//     ],
//     [
//         { symbol: 'Y', color: 'blue' },
//         { symbol: '*', color: 'green' },
//         { symbol: '2', color: 'blue' }
//     ]
// ];


// export const tiles = [
//     [
//         { symbol: '0', color: 'blue' },
//         { symbol: 'x', color: 'green' }
//     ],
//     [
//         { symbol: 'y', color: 'green' },
//         { symbol: '1', color: 'blue' }
//     ]
// ];

// import Tile from '../../js/Tile.js';
// export const tiles = [
//     [
//         new Tile({ symbol: '0', color: 'blue' }),
//         new Tile({ symbol: 'x', color: 'green', isSolid: true })
//     ],
//     [
//         new Tile({ symbol: 'y', color: 'green', backgroundColor: 'yellow' }),
//         new Tile({ symbol: '1', color: 'blue' })
//     ]
// ];

import Tile from '../../js/Tile.js';
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
            new Tile({ symbol: '0', color: 'yellow' }),
            new Tile({ symbol: 'x', color: 'yellow', isSolid: true })
        ],
        [
            new Tile({ symbol: 'y', color: 'yellow'}),
            new Tile({ symbol: '1', color: 'yellow' })
        ]
    ]
];

// import Tile from '../../js/Tile.js';
// export const tiles = [
//     [
//         [
//             new Tile({ symbol: '+', color: 'yellow', backgroundColor: 'blue' }),
//             new Tile({ symbol: ',', backgroundColor: 'green' })
//         ],
//         [
//             new Tile({ symbol: ' ', backgroundColor: 'green' }),
//             new Tile({ symbol: ' ', backgroundColor: 'blue' })
//         ]
//     ]
// ];