import { Direction } from './Direction.js'

type DirectionString = 'Up' | 'Right' | 'Down' | 'Left'

export default class InputController {
    // move: (direction: Direction) => void
    // WARN: Overriding this will make `this` have a confusing reference
    move(direction: Direction): void {
        console.warn('Provide an implementation for move() when instantiating InputController.')
    }
    
    handleEvent(event: KeyboardEvent) {
        if (['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'].includes(event.key)) {
            // remove 'Arrow' from keypress to get corresponding direction enum
            // moveIfAble(player, Direction[event.key.slice(5)])

            // const dir: DirectionString = event.key.slice(5)!

            // if (dir === 'Up' || 'Right' || 'Down') {
            // const dir = 'Up'
            // const foo = dir
            // Force an assertion, as TypeScript can't intuit this from [].includes() above
            const dir: DirectionString = event.key.slice(5) as DirectionString
            this.move(Direction[dir])
            // }

            // this.move(Direction[event.key.slice(5)])
            
            // this.moveDirection = Direction[event.key.slice(5)
        }
    }
}