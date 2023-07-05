export default class MessageLog {
    // A reference to `document.getElementById(...)`
    #element;
    #debug; // bool
    
    constructor(element, debug) {
        this.element = element;
        this.debug = debug;
    }
    
    print(msg) {
        if (this.debug) {
            msg = this.element.textContent + `• ${msg}\n`;
        }
        this.element.textContent = msg;
        // Scroll to bottom automatically
        this.element.scrollTop = this.element.scrollHeight;
    }
}