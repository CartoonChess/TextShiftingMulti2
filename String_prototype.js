function replaceCharAt(index, chr, str) {
    // If called as a func of string, operate on copy of String itself
    if (!str) { str = this; }
    if (index > str.length - 1) return str;
    return str.substring(0, index) + chr + str.substring(index + 1);
}
// Add this as a method on String
String.prototype.replaceCharAt = replaceCharAt;