// Add methods on Element
Element.prototype.show = function(display = 'block') {
    this.style.display = display;
}

Element.prototype.hide = function() {
    this.style.display = 'none';
}