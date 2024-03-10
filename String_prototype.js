// NOTE: Not currently using this function?
String.prototype.replaceCharAt = function replaceCharAt(index, char) {
    // Make sure char is actually a single char
    if (char.length !== 1) {
        throw new Error('char argument of String.replaceCharAt must be a single character of length 1.');
    }
    // Return copy of self if index out of range
    if (index > this.length - 1)
        return this.toString();
    return this.substring(0, index) + char + this.substring(index + 1);
};
String.replaceCharAt = function replaceCharAt(index, char, str) {
    return str.replaceCharAt(index, char);
};
export {};
