export class RandomBytes {
    random(base: number = 2, length: number = 1) {
        // https://stackoverflow.com/a/58326357/141032
        return [...Array(length)].map(() => Math.floor(Math.random() * base).toString(base)).join('')
    }

    alphanumeric(length?: number) {
        return this.random(36, length)
    }

    hex(length?: number) {
        return this.random(16, length)
    }

    decimal(length?: number) {
        return this.random(10, length)
    }

    binary(length?: number) {
        return this.random(2, length)
    }
}