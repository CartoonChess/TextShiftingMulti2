// Extend the Socket class to include custom properties
// TODO: Do we not have to explicitly import this where we use it?

// import { Socket } from 'socket.io'

declare module 'socket.io' {
    // export interface Socket {
    interface Socket {
        sessionId: string
        // Corresponds to Session class
        userId: string
        // isOnline: boolean
        gameMap: string
        positionOnMap: string
    }
}

// Treat as module (prevents overwrite)
export {}