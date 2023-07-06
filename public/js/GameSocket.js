import { Coordinate } from './Map.js';
import { RemotePlayer } from './Character.js';

export default class GameSocket {
    #socket;
    // #sessionId;
    // #connectCount = 0;
    // #disconnectCount = 0;

    #log;
    #view;
    #player;
    #remotePlayers;
    
    // constructor(window, log, player, remotePlayers, view) {
    constructor(log, view, player, remotePlayers) {
        // NEW: refs to other vars
        this.log = log;
        this.view = view;
        this.player = player;
        this.remotePlayers = remotePlayers;
        
        // Get player set up for remote connection
        // Using default URL param
        this.socket = io(window.location.host, { autoConnect: false });
        //socket.auth = { username: "joe" };
        
        // `localStorage` is a property of browser `window`
        const sessionId = localStorage.getItem('sessionId');
        if (sessionId) {
            this.socket.auth = { sessionId };
            this.log.print(`had seshId ${sessionId}.`)
        }
        
        // Not in the tutorial but
        // let's just try connecting down here instead
        this.socket.connect();
    }

    broadcastMove() {
        // Should this be broadcast/other instead? Can it be?
        this.socket.emit('move', this.player.position.toJson());
    }

    pingServer() {
        const start = Date.now();
        this.socket.emit('latency', () => {
            const duration = Date.now() - start;
            return duration;
        });
    }

    listen() {
        // Get session ID, whether new or returning
        this.socket.on('session', ({ sessionId, userId }) => {
            // 'attach sessionId to next reconnection attempts'
            this.socket.auth = { sessionId };
            // Store in browser's localStorage
            localStorage.setItem('sessionId', sessionId);
            // Save (public) userId
            this.socket.userId = userId;
            // socket.positionOnMap = positionOnMap;
            this.log.print(`got userId ${this.socket.userId}.`);
        });
        
        this.socket.on('connect_error', (err) => {
            var errorMessage = '(unknown error)';
            if (err.message) { errorMessage = err.message; }
            this.log.print(`ERROR: [Socket.io]: ${errorMessage}.`);
        });
        
        // this.socket.on('self connected', (id) => {
        //     this.log.print(`You're in (ID: ${id}).`);
        // });
        
        // var socketConnectCount = 0;
        let connectCount = 0;
        this.socket.on('connect', () => {
            connectCount++;
            this.log.print(`Socket connect count: ${connectCount}.`);
        });
        
        // var socketDisonnectCount = 0;
        let disconnectCount = 0;
        this.socket.on('disconnect', (reason) => {
            disconnectCount++;
            this.log.print(`Socket disconnect count: ${disconnectCount}. Reason: ${reason}.`);
        });
        
        // Get already-connected users when joining
        // socket.on('users'...
        this.socket.on('all players', (allPlayers) => {
            // Let's just replace the old data and get in sync w/ server
            this.remotePlayers.length = 0;
            allPlayers.forEach((json) => {
                const remotePlayer = RemotePlayer.fromJson(json);
                this.log.print(`found player (id ${remotePlayer.id}, position ${remotePlayer.position}`);
                // Only add if it's not ourself
                if (remotePlayer.id !== this.socket.userId) {
                    this.remotePlayers.push(remotePlayer);
                }
            });
            this.log.print(`number of remote players: ${this.remotePlayers.length}`);
            updateText();
        });
        
        // Get new users who join after you
        // socket.on('user connected'...
        // socket.on('other connected', ({ userId, positionOnMap }) => {
        this.socket.on('other connected', (remotePlayerJson) => {
            const remotePlayer = RemotePlayer.fromJson(remotePlayerJson);
            this.log.print(`Friend's in (ID: ${remotePlayer.id}).`);
            if (remotePlayer.id === this.socket.userId) { return; }
            // Only add if it's a new player, not a second session
            for (const existingPlayer of this.remotePlayers) {
                if (remotePlayer.id === existingPlayer.id) { return; }
            }
            this.remotePlayers.push(remotePlayer);
        });
        
        // Only happens when remote user ends all sessions
        this.socket.on('other disconnected', (userId) => {
            this.log.print(`userId ${userId} left.`);
            for (let i = 0; i < this.remotePlayers.length; i++) {
                if (this.remotePlayers[i].id === userId) {
                    this.remotePlayers.splice(i, 1);
                }
            }
            updateText();
        });
        
        // socket.on('private message'...
        this.socket.on('move', ({ userId, positionOnMap }) => {
            const position = Coordinate.fromJson(positionOnMap);
            
            // If you moved in one tab, update all your tabs
            if (userId === this.socket.userId) {
                this.player.position = position;
                return updateText();
            }
        
            // Otherwise, let's see which remote user moved
            for (let i = 0; i < this.remotePlayers.length; i++) {
                if (this.remotePlayers[i].id === userId) {
                    this.remotePlayers[i].position = position;
                    const isInView = this.view.isVisible(this.remotePlayers[i]);
                    if (this.remotePlayers[i].wasInView || isInView) {
                        updateText();
                    }
                    this.remotePlayers[i].wasInView = isInView;
                }
            }
        });
    }
}