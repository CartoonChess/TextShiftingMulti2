import { Direction } from './Direction.js';
export default class InputController {
    // move: (direction: Direction) => void
    // WARN: Overriding this will make `this` have a confusing reference
    move(direction) {
        console.warn('Provide an implementation for move() when instantiating InputController.');
    }
    handleEvent(event) {
        if (['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'].includes(event.key)) {
            // remove 'Arrow' from keypress to get corresponding direction enum
            // moveIfAble(player, Direction[event.key.slice(5)])
            // const dir: DirectionString = event.key.slice(5)!
            // if (dir === 'Up' || 'Right' || 'Down') {
            // const dir = 'Up'
            // const foo = dir
            // Force an assertion, as TypeScript can't intuit this from [].includes() above
            const dir = event.key.slice(5);
            this.move(Direction[dir]);
            // }
            // this.move(Direction[event.key.slice(5)])
            // this.moveDirection = Direction[event.key.slice(5)
        }
    }
}
