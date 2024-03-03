export default class MessageLog {
    // A reference(?) to `document.getElementById(...)`
    #element;
    #isAppending; // bool
    
    constructor(element: HTMLElement, isAppending = false) {
        this.#element = element;
        // Below also works...
        // this.element = document.getElementById('message-log');
        this.#isAppending = isAppending;
    }
    
    print(msg: string) {
        if (this.#isAppending) {
            const msgHtml = document.createElement('div');
            msgHtml.textContent = `• ${msg}\n`;
            this.#element.appendChild(msgHtml);
            // Scroll to bottom automatically
            this.#element.scrollTop = this.#element.scrollHeight;
        } else {
            this.#element.textContent = msg;
        }
    }
}