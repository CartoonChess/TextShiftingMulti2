// Add methods on HTMLElement
// -> was Element

declare global {
    interface HTMLElement {
        show(display: string): void
        hide(): void
    }
}


HTMLElement.prototype.show = function(display = 'block') {
    this.style.display = display;
}

HTMLElement.prototype.hide = function() {
    this.style.display = 'none';
}


export {}