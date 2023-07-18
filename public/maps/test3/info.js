export const data = {
    "name": "test3",
    "dimensions": {
        "width": 2,
        "height": 2,
        "depth": 1
    },
    "startPosition": {
        "column": 0,
        "line": 0
    }
}

// z { y { x { [overlapping tiles] } } } }
export const tiles = {
    "0": {
        "0": {
            "0": [
                {
                    "symbol": "A"
                }
            ],
            "1": [
                {
                    "symbol": "a"
                }
            ]
        },
        "1": {
            "0": [
                {
                    "symbol": "B"
                }
            ],
            "1": [
                {
                    "symbol": "b"
                }
            ]
        }
    }
}