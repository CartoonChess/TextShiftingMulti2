export class RandomBytes {
    random(base = 2, length = 1) {
        // https://stackoverflow.com/a/58326357/141032
        return [...Array(length)].map(() => Math.floor(Math.random() * base).toString(base)).join('');
    }
    alphanumeric(length) {
        return this.random(36, length);
    }
    hex(length) {
        return this.random(16, length);
    }
    decimal(length) {
        return this.random(10, length);
    }
    binary(length) {
        return this.random(2, length);
    }
}
