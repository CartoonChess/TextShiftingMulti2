// abstract class
class SessionStore {
    findSession(id) {}
    saveSession(id, session) {}
    findAllSessions() {}
}

class InMemorySessionStore extends SessionStore {
    constructor() {
        super();
        this.sessions = new Map();
    }
    
    findSession(id) {
        return this.sessions.get(id);
    }

    updateSession(id, pairs) {
        const session = this.findSession(id);
        Object.assign(session, pairs);
    }
    
    saveSession(id, session) {
        this.sessions.set(id, session);
    }
    
    findAllSessions() {
        return [...this.sessions.values()];
    }
}

module.exports = {
    InMemorySessionStore
};