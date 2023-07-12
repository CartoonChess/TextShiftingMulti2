import { Coordinate } from './GameMap.js';
import { RemotePlayer } from './Character.js';

export default class GameSocket {
    #socket;
    // #sessionId;
    #connectCount = 0;
    #disconnectCount = 0;

    game;
    #log;
    #view;
    #player;
    #remotePlayers;

    // To make sure we have enough data from the server to update the view
    #_didReceiveSession = false;
    #_didReceiveAllPlayers = false;
    #isReadyForView = false;
    
    // constructor(log, view, player, remotePlayers) {
    //     this.#log = log;
    //     this.#view = view;
    //     this.#player = player;
    constructor(game, remotePlayers) {
        this.game = game;
        this.#log = game.log;
        this.#view = game.view;
        this.#player = game.player;
        this.#remotePlayers = game.remotePlayers;
        
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
            if (!this.#isReadyForView) { this.#log.print('Ready!'); }
            this.#isReadyForView = true;
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
        this.#socket.on('session', async ({ sessionId, userId, gameMap, positionOnMap }) => {
            // 'attach sessionId to next reconnection attempts'
            this.#socket.auth = { sessionId };
            // Store in browser's localStorage
            localStorage.setItem('sessionId', sessionId);
            // Save (public) userId
            this.#socket.userId = userId;

            // TODO: Seems this triggers even with hiccup reconnects
            // - Will this be a problem? Will it cause warping?
            if (gameMap && positionOnMap) {
                this.#log.print('welcome back');
                await this.game.changeMap(gameMap, Coordinate.fromJson(positionOnMap));
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
        
        this.#socket.on('connect', () => {
            this.#connectCount++;
            this.#log.print(`Socket connect count: ${this.#connectCount}.`);
        });
        
        this.#socket.on('disconnect', (reason) => {
            this.#disconnectCount++;
            this.#log.print(`Socket disconnect count: ${this.#disconnectCount}. Reason: ${reason}.`);
        });
        
        // Get already-connected users when joining
        this.#socket.on('all players', (allPlayers) => {
            // TODO: Is this line necessary? This should only happen once, when first joining
            // Let's just replace the old data and get in sync w/ server
            // this.#remotePlayers.length = 0;
            allPlayers.forEach((json) => {
                // Skip any players who don't provide a map and position
                if (!json.gameMap || !json.positionOnMap) { return; } // forEach's 'continue'
                
                const remotePlayer = RemotePlayer.fromJson(json);
                this.#log.print(`found player (id ${remotePlayer.id}, map '${remotePlayer.mapName}', position ${remotePlayer.position}`);
                // Only add if it's not ourself
                if (remotePlayer.id !== this.#socket.userId) {
                    // this.#remotePlayers.push(remotePlayer);
                    this.#remotePlayers.set(remotePlayer.id, remotePlayer);
                }
            });
            // this.#log.print(`number of remote players: ${this.#remotePlayers.length}`);
            this.#log.print(`number of remote players: ${this.#remotePlayers.size}`);
            this.#didReceiveAllPlayers = true;
            this.#updateView();
        });
        
        // Get new users who join after you
        // socket.on('other connected', ({ userId, positionOnMap }) => {
        this.#socket.on('other connected', (remotePlayerJson) => {
            const remotePlayer = RemotePlayer.fromJson(remotePlayerJson);
            this.#log.print(`Friend's in (ID: ${remotePlayer.id}).`);
            if (remotePlayer.id === this.#socket.userId) { return; }
            // Only add if it's a new player, not a second session
            // for (const existingPlayer of this.#remotePlayers) {
            //     if (remotePlayer.id === existingPlayer.id) { return; }
            // }
            // Using a map rather than array, so we can just overwrite if necessary
            // this.#remotePlayers.push(remotePlayer);
            this.#remotePlayers.set(remotePlayer.id, remotePlayer);
            // TODO: Did we not need this before? This is new...
            // -should we do a map check first? maybe "updateViewIfNeeded," can recycle
            this.#updateView();
        });
        
        // Only happens when remote user ends all sessions
        this.#socket.on('other disconnected', (userId) => {
            this.#log.print(`userId ${userId} left.`);
            // for (let i = 0; i < this.#remotePlayers.length; i++) {
            //     if (this.#remotePlayers[i].id === userId) {
            //         this.#remotePlayers.splice(i, 1);
            //     }
            // }
            this.#remotePlayers.delete(userId);
            this.#updateView();
        });
        
        // socket.on('private message'...
        this.#socket.on('move', async ({ userId, gameMap, positionOnMap }) => {
            const position = Coordinate.fromJson(positionOnMap);
            
            // If you moved in one tab, update all your tabs
            if (userId === this.#socket.userId) {
                // Update map if you moved
                if (gameMap !== this.game.view.map.name) {
                    await this.game.changeMap(gameMap, Coordinate.fromJson(positionOnMap));
                } else {
                    this.#player.position = position;
                }
                return this.#updateView();
            }
        
            // Otherwise, let's see which remote user moved
            // for (let i = 0; i < this.#remotePlayers.length; i++) {
            //     if (this.#remotePlayers[i].id === userId) {
            //         this.#remotePlayers[i].mapName = gameMap;
            //         this.#remotePlayers[i].position = position;
            //         const isInView = this.#view.isVisible(this.#remotePlayers[i]);
            //         if (this.#remotePlayers[i].wasInView || isInView) {
            //             this.#updateView();
            //         }
            //         this.#remotePlayers[i].wasInView = isInView;
            //     }
            // }
            
            // Reference, not value
            const remotePlayer = this.#remotePlayers.get(userId);
            
            if (!remotePlayer) { return console.error(`Received move from player with ID#${userId}, but GameSocket.#remotePlayers has no element with this ID.`); }
            
            remotePlayer.mapName = gameMap;
            remotePlayer.position = position;
            const isInView = this.#view.isVisible(remotePlayer);
            if (remotePlayer.wasInView || isInView) {
                this.#updateView();
            }
            remotePlayer.wasInView = isInView;
        });
    }

    #updateView() {
        // TODO: Make sure all ready-requiring events trigger this, or possible that nothing will ever happen
        if (!this.#isReadyForView) { return; }
        this.#view.update(this.#player, this.#remotePlayers);
    }
}