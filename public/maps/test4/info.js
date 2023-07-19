// export const data = {
//     "name": "test4",
//     "dimensions": {
//         "width": 2,
//         "height": 2,
//         "depth": 1
//     },
//     "startPosition": {
//         "column": 0,
//         "line": 0
//     }
// }
export const data = {
    "name": "test4",
    "dimensions": {
        "width": 2,
        "height": 2,
        "depth": 2
    },
    "startPosition": {
        "column": 0,
        "line": 0
    }
}

// z { y { x { [overlapping tiles] } } } }
// export const tiles = {
//     "0": {
//         "0": {
//             "0": [
//                 {
//                     "symbol": "A"
//                 }
//             ],
//             "1": [
//                 {
//                     "symbol": "a"
//                 }
//             ]
//         },
//         "1": {
//             "0": [
//                 {
//                     "symbol": "B"
//                 }
//             ],
//             "1": [
//                 {
//                     "symbol": "b"
//                 }
//             ]
//         }
//     }
// };

// tiles[z][y][x][overlapping tiles]
// export const tiles = [
//     [
//         [
//             {
//                 'symbol': '0'
//             }
//         ],
//         [
//             {
//                 'symbol': 'x'
//             }
//         ]
//     ],
//     [
//         [
//             {
//                 'symbol': 'y'
//             }
//         ],
//         [
//             {
//                 'symbol': '1'
//             }
//         ]
//     ]
// ];

// strings, not objects
// export const tiles = [
//     [
//         ['0'],
//         ['x']
//     ],
//     [
//         ['y'],
//         ['1']
//     ]
// ];

// no overlapping tiles
// export const tiles = [
//     [
//         '0',
//         'x'
//     ],
//     [
//         'y',
//         '1'
//     ]
// ];