import { Direction } from './Direction.js';

export default class InputController {
    move;
    
    handleEvent(event) {
        if (['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'].includes(event.key)) {
            // remove 'Arrow' from keypress to get corresponding direction enum
            // moveIfAble(player, Direction[event.key.slice(5)]);
            this.move(Direction[event.key.slice(5)]);
            // this.moveDirection = Direction[event.key.slice(5);
        }
    }
}