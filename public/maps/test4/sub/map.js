import Tile, { WarpTileScript } from '/js/Tile.js';
import { Coordinate } from '/js/GameMap.js';
export const tiles = [
    [
        [
            {
                "symbol": "+",
                "isVisible": true,
                "isSolid": false,
                "color": "red",
                "backgroundColor": "blue",
                "layer": 0
            },
            {
                "symbol": ",",
                "isVisible": true,
                "isSolid": true,
                "color": "red",
                "backgroundColor": "green",
                "layer": 0
            },
            {
                "symbol": "#"
            },
            {
                "symbol": "."
            }
        ],
        [
            {
                "symbol": "#",
                "isVisible": true,
                "isSolid": false,
                "color": "inherit",
                "backgroundColor": "green",
                "layer": 0
            },
            {
                "symbol": " ",
                "isVisible": true,
                "isSolid": false,
                "color": "inherit",
                "backgroundColor": "blue",
                "layer": 0
            },
            {
                "symbol": "."
            },
            {
                "symbol": "."
            }
        ]
    ],
    [
        [
            {
                "symbol": "s",
                "isVisible": true,
                "isSolid": false,
                "color": "yellow",
                "backgroundColor": "inherit",
                "layer": 0
            },
            {
                "symbol": "u",
                "isVisible": true,
                "isSolid": false,
                "color": "yellow",
                "backgroundColor": "inherit",
                "layer": 0
            },
            {
                "symbol": "."
            },
            {
                "symbol": "."
            }
        ],
        [
            {
                "symbol": "u",
                "isVisible": true,
                "isSolid": false,
                "color": "yellow",
                "backgroundColor": "inherit",
                "layer": 0
            },
            {
                "symbol": "b",
                "isVisible": true,
                "isSolid": false,
                "color": "yellow",
                "backgroundColor": "inherit",
                "layer": 0,
                "scripts": [
                    {
                        "destinationCoordinate": {
                            "column": -2,
                            "line": -2
                        },
                        "destinationMap": "test5"
                    }
                ]
            },
            {
                "symbol": "."
            },
            {
                "symbol": "."
            }
        ]
    ]
]