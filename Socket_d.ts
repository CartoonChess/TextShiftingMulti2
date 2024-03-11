// Extend the Socket class to include custom properties
// TODO: Do we not have to explicitly import this where we use it?

// import { Socket } from 'socket.io'

import SessionlessPlayer from "./SessionlessPlayer.js"

declare module 'socket.io' {
    // export interface Socket {
    // interface Socket {
    interface Socket extends SessionlessPlayer {
        sessionId: string
        // Corresponds to Session class
        // userId: string
        // gameMap: string
        // positionOnMap: string
    }
}

// Do the same for the client version
declare module 'socket.io-client' {
    interface Socket extends SessionlessPlayer {
        sessionId: string
    }
}

// Treat as module (prevents overwrite)
export {}