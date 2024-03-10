// NOTE: Not currently using this function?

// declare global {
//     interface String {
//         replaceCharAt(index: number, char: string, str?: string): string
//     }

//     interface StringConstructor {
//         replaceCharAt(index: number, char: string, str?: string): string
//     }
// }


// String.prototype.replaceCharAt = function replaceCharAt(index: number, char: string, str?: string): string {
//     // Make sure char is actually a single char
//     if (char.length !== 1) {
//         throw new Error('char argument of String.replaceCharAt must be a single character of length 1.')
//     }

//     // If called as a func of string, operate on copy of String itself
//     if (!str) { str = this.toString() }

//     if (index > str.length - 1) return str;
//     return str.substring(0, index) + char + str.substring(index + 1);
// }

// String.replaceCharAt = String.prototype.replaceCharAt


declare global {
    interface String {
        replaceCharAt(index: number, char: string): string
    }

    interface StringConstructor {
        replaceCharAt(index: number, char: string, str: string): string
    }
}


String.prototype.replaceCharAt = function replaceCharAt(index: number, char: string): string {
    // Make sure char is actually a single char
    if (char.length !== 1) {
        throw new Error('char argument of String.replaceCharAt must be a single character of length 1.')
    }

    // Return copy of self if index out of range
    if (index > this.length - 1) return this.toString();
    
    return this.substring(0, index) + char + this.substring(index + 1);
}

String.replaceCharAt = function replaceCharAt(index: number, char: string, str: string): string {
    return str.replaceCharAt(index, char)
}


export {}