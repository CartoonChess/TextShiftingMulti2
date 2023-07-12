import { Coordinate } from './GameMap.js';
import { RemotePlayer } from './Character.js';

export default class GameSocket {
    #socket;
    // #sessionId;
    #connectCount = 0;
    #disconnectCount = 0;

    #log;
    #view;
    #player;
    #remotePlayers;

    // To make sure we have enough data from the server to update the view
    #_didReceiveSession = false;
    #_didReceiveAllPlayers = false;
    #isReadyForView = false;
    
    constructor(log, view, player, remotePlayers) {
        this.#log = log;
        this.#view = view;
        this.#player = player;
        this.#remotePlayers = remotePlayers;
        
        // Get player set up for remote connection
        // Using default URL param
        // this.#socket = io(window.location.host, {
        //     autoConnect: false,
        //     query: {
        //         defaultPositionOnMap: this.#player.position.toJson()
        //     }
        // });
        this.#socket = io(window.location.host, { autoConnect: false });
        //socket.auth = { username: "joe" };

        // auth obj will also send local player position/map in case no previous data found on server
        // - which is fine for connecting player, but sends undefined to remote players
        const defaultGameMap = this.#view.map.name;
        const defaultPositionOnMap = this.#player.position.toJson();
        this.#socket.auth = {
            defaultGameMap,
            defaultPositionOnMap
        };
        
        // `localStorage` is a property of browser `window`
        const sessionId = localStorage.getItem('sessionId');
        if (sessionId) {
            // this.#socket.auth = { sessionId };
            // this.#socket.auth = {
            //     sessionId,
            //     defaultPositionOnMap
            // };
            this.#socket.auth.sessionId = sessionId;
            this.#log.print(`had seshId ${sessionId}.`)
        }
        
        // Not in the tutorial but
        // let's just try connecting down here instead
        this.#socket.connect();
    }

    #checkIfReadyForView() {
        if (this.#didReceiveSession
           && this.#didReceiveAllPlayers) {
            this.#isReadyForView = true;
            this.#log.print('Ready!');
        } else {
            this.#isReadyForView = false;
        }
    }

    set #didReceiveSession(bool) {
        this.#_didReceiveSession = bool;
        this.#checkIfReadyForView();
    }

    get #didReceiveSession() {
        return this.#_didReceiveSession;
    }

    set #didReceiveAllPlayers(bool) {
        this.#_didReceiveAllPlayers = bool;
        this.#checkIfReadyForView();
    }

    get #didReceiveAllPlayers() {
        return this.#_didReceiveAllPlayers;
    }

    // For outside use
    get isReadyForView() {
        return this.#isReadyForView;
    }

    broadcastMove() {
        // Should this be broadcast/other instead? Can it be?
        this.#socket.emit(
            'move',
            this.#view.map.name,
            this.#player.position.toJson()
        );
    }

    pingServer() {
        const start = Date.now();
        this.#socket.emit('latency', () => {
            const duration = Date.now() - start;
            return duration;
        });
    }

    listen() {
        // Get session ID, whether new or returning
        this.#socket.on('session', ({ sessionId, userId, gameMap, positionOnMap }) => {
            // 'attach sessionId to next reconnection attempts'
            this.#socket.auth = { sessionId };
            // Store in browser's localStorage
            localStorage.setItem('sessionId', sessionId);
            // Save (public) userId
            this.#socket.userId = userId;
            
            if (gameMap && positionOnMap) {
                this.#log.print('welcome back');
                // TODO: How do we change the game map? Move index.js func to View..?
                // ...
                this.#player.position = Coordinate.fromJson(positionOnMap);
            }
            this.#log.print(`got userId ${this.#socket.userId}.`);
            
            // View will only update if everything else is ready
            this.#didReceiveSession = true;
            this.#updateView();
        });
        
        this.#socket.on('connect_error', (err) => {
            var errorMessage = '(unknown error)';
            if (err.message) { errorMessage = err.message; }
            this.#log.print(`ERROR: [Socket.io]: ${errorMessage}.`);
        });
        
        // this.#socket.on('self connected', (id) => {
        //     this.#log.print(`You're in (ID: ${id}).`);
        // });
        
        // let connectCount = 0;
        this.#socket.on('connect', () => {
            // connectCount++;
            this.#connectCount++;
            this.#log.print(`Socket connect count: ${this.#connectCount}.`);
        });
        
        // let disconnectCount = 0;
        this.#socket.on('disconnect', (reason) => {
            this.#disconnectCount++;
            this.#log.print(`Socket disconnect count: ${this.#disconnectCount}. Reason: ${reason}.`);
        });
        
        // Get already-connected users when joining
        // socket.on('users'...
        this.#socket.on('all players', (allPlayers) => {
            // Let's just replace the old data and get in sync w/ server
            // TODO: Is this line necessary? This should only happen once, when first joining
            // this.#remotePlayers.length = 0;
            allPlayers.forEach((json) => {
                // Skip any players who don't provide a position
                if (!json.positionOnMap) { return; } // forEach's 'continue'
                
                const remotePlayer = RemotePlayer.fromJson(json);
                this.#log.print(`found player (id ${remotePlayer.id}, map '${remotePlayer.mapName}', position ${remotePlayer.position}`);
                // Only add if it's not ourself
                if (remotePlayer.id !== this.#socket.userId) {
                    this.#remotePlayers.push(remotePlayer);
                }
            });
            this.#log.print(`number of remote players: ${this.#remotePlayers.length}`);
            this.#didReceiveAllPlayers = true;
            this.#updateView();
        });
        
        // Get new users who join after you
        // socket.on('user connected'...
        // socket.on('other connected', ({ userId, positionOnMap }) => {
        this.#socket.on('other connected', (remotePlayerJson) => {
            const remotePlayer = RemotePlayer.fromJson(remotePlayerJson);
            this.#log.print(`Friend's in (ID: ${remotePlayer.id}).`);
            if (remotePlayer.id === this.#socket.userId) { return; }
            // Only add if it's a new player, not a second session
            for (const existingPlayer of this.#remotePlayers) {
                if (remotePlayer.id === existingPlayer.id) { return; }
            }
            this.#remotePlayers.push(remotePlayer);
            // TODO: Did we not need this before? This is new...
            this.#updateView();
        });
        
        // Only happens when remote user ends all sessions
        this.#socket.on('other disconnected', (userId) => {
            this.#log.print(`userId ${userId} left.`);
            for (let i = 0; i < this.#remotePlayers.length; i++) {
                if (this.#remotePlayers[i].id === userId) {
                    this.#remotePlayers.splice(i, 1);
                }
            }
            this.#updateView();
        });
        
        // socket.on('private message'...
        this.#socket.on('move', ({ userId, mapName, positionOnMap }) => {
            const position = Coordinate.fromJson(positionOnMap);
            
            // If you moved in one tab, update all your tabs
            if (userId === this.#socket.userId) {
                // TODO: How do we update the map across tabs???
                this.#player.position = position;
                return this.#updateView();
            }
        
            // Otherwise, let's see which remote user moved
            for (let i = 0; i < this.#remotePlayers.length; i++) {
                if (this.#remotePlayers[i].id === userId) {
                    this.#remotePlayers[i].position = position;
                    const isInView = this.#view.isVisible(this.#remotePlayers[i]);
                    if (this.#remotePlayers[i].wasInView || isInView) {
                        this.#updateView();
                    }
                    this.#remotePlayers[i].wasInView = isInView;
                }
            }
        });
    }

    #updateView() {
        // TODO: Make sure all ready-requiring events trigger this, or possible that nothing will ever happen
        if (!this.#isReadyForView) { return; }
        this.#view.update(this.#player, this.#remotePlayers);
    }
}