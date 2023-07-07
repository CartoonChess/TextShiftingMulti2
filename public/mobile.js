// Mobile

// Ignore swipes so page won't move
// Except this doesn't actually work
// document.addEventListener("touchmove", function (event) {
//     event.codeventDefault();
// });

// Now the actual swipes
// Unfortunately Y isn't doing anything

var initialX = null;
var initialY = null;

document.addEventListener("touchstart", function (event) {
    initialX = event.touches[0].clientX;
    initialY = event.touches[0].clientY;
});

document.addEventListener("touchend", function (event) {
    if (initialX !== null) {
        var currentX = event.changedTouches[0].clientX;
        var deltaX = currentX - initialX;
        if (deltaX < 0) {
            // movePlayer(Direction.Left);
        } else if (deltaX > 0) {
            // movePlayer(Direction.Right);
        }
        initialX = null;
    }
    if (initialY !== null) {
        var currentY = event.changedTouches[0].clientY;
        var deltaY = currentY - initialY;
        if (deltaY < 0) {
            // movePlayer(Direction.Down);
        } else if (deltaY > 0) {
            // movePlayer(Direction.Up);
        }
        initialY = null;
    }
});