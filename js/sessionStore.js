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
// export class InMemorySessionStore extends SessionStore {
export class InMemorySessionStore {
    constructor() {
        // super();
        this.sessions = new Map();
        // this.sessions = new Map<string, Session>()
    }
    findSession(id) {
        return this.sessions.get(id);
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
    updateSession(id, properties) {
        const session = this.findSession(id);
        if (!session) {
            throw Error(`Can't update session with ID ${id}: No matching ID found in InMemorySessionStore.`);
        }
        Object.assign(session, properties);
    }
    saveSession(id, session) {
        this.sessions.set(id, session);
    }
    findAllSessions() {
        return [...this.sessions.values()];
    }
}
