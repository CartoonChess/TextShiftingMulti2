var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _MessageLog_element, _MessageLog_isAppending;
class MessageLog {
    constructor(element, isAppending = false) {
        // A reference(?) to `document.getElementById(...)`
        _MessageLog_element.set(this, void 0);
        _MessageLog_isAppending.set(this, void 0); // bool
        __classPrivateFieldSet(this, _MessageLog_element, element, "f");
        // Below also works...
        // this.element = document.getElementById('message-log');
        __classPrivateFieldSet(this, _MessageLog_isAppending, isAppending, "f");
    }
    print(msg) {
        if (__classPrivateFieldGet(this, _MessageLog_isAppending, "f")) {
            const msgHtml = document.createElement('div');
            msgHtml.textContent = `• ${msg}\n`;
            __classPrivateFieldGet(this, _MessageLog_element, "f").appendChild(msgHtml);
            // Scroll to bottom automatically
            __classPrivateFieldGet(this, _MessageLog_element, "f").scrollTop = __classPrivateFieldGet(this, _MessageLog_element, "f").scrollHeight;
        }
        else {
            __classPrivateFieldGet(this, _MessageLog_element, "f").textContent = msg;
        }
    }
}
_MessageLog_element = new WeakMap(), _MessageLog_isAppending = new WeakMap();
export default MessageLog;
