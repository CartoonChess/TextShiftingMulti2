// abstract class
// export class SessionStore {
//     findSession(id: string) {
//         throw new Error('SessionStore child class must implement findSession() method.');
//     }
//     // `session` is an Object that we create in `index.ts`
//     saveSession(id: string, session) {
//         throw new Error('SessionStore child class must implement saveSession() method.');
//     }
//     findAllSessions() {
//         throw new Error('SessionStore child class must implement findAllSessions() method.');
//     }
// }

import SessionlessPlayer from "./SessionlessPlayer.js"
// FIXME: Is `positionOnMap` truly string(ified json)? Or is it an Object? Coordinate?
// export interface Session {
    export interface Session extends SessionlessPlayer {
    // userId: string
    isOnline: boolean
//     gameMap: string
//     positionOnMap: string
}

interface SessionStore {
    findSession(id: string): Session | undefined
    saveSession(id: string, session: Session): void
    findAllSessions(): Session[]
}

// export class InMemorySessionStore extends SessionStore {
export class InMemorySessionStore implements SessionStore {
    sessions: Map<string, Session>

    constructor() {
        // super();
        this.sessions = new Map<string, Session>()
        // this.sessions = new Map<string, Session>()
    }
    
    findSession(id: string): Session | undefined {
        return this.sessions.get(id)
    }

    // Partial<> allows any properties to be undefined
    /**
     * 
     * Updates only the supplied `properties` of a `Session`.
     * 
     * @param id The ID of the `Session` to update.
     * @param properties Any properties of `Session` to modify.
     * 
     * @throws `Error` if no matching `id` is found.
     */
    updateSession(id: string, properties: Partial<Session>) {
        const session = this.findSession(id)
        if (!session) {
            throw Error(`Can't update session with ID ${id}: No matching ID found in InMemorySessionStore.`)
        }

        Object.assign(session, properties)
    }
    
    saveSession(id: string, session: Session) {
        this.sessions.set(id, session)
    }
    
    findAllSessions(): Session[] {
        return [...this.sessions.values()]
    }
}