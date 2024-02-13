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
                            new Tile({ symbol: 'n', color: 'yellow' }),
                            new Tile({ symbol: 'e', color: 'yellow', isSolid: true })
                        ],
                        [
                            new Tile({ symbol: 'e', color: 'yellow' }),
                            new Tile({ symbol: 'w', color: 'yellow', scripts: [
                                new WarpTileScript(new Coordinate(-2, -2), 'test5')
                            ] })
                        ]
                    ]
                ];