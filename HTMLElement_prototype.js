// Add methods on HTMLElement
// -> was Element
HTMLElement.prototype.show = function (display = 'block') {
    this.style.display = display;
};
HTMLElement.prototype.hide = function () {
    this.style.display = 'none';
};
export {};
