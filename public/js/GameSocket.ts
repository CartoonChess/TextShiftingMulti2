import '../../ConsoleColor.js';
import { Coordinate } from './GameMap.js';
import { RemotePlayer } from './Character.js';

import Game from './Game.js';

// import { Socket } from 'socket.io';
import { io, Socket } from 'socket.io-client';
// import { io, Socket } from '/Users/phil/Documents/GitHub/TextShiftingMulti2/node_modules/socket.io-client/build/esm/index.js';
import SessionlessPlayer from '../../SessionlessPlayer.js';
// import { Session } from 'inspector';

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
    
    // constructor(game, remotePlayers) {
    constructor(game: Game) {
        this.game = game;
        this.#log = game.log;
        this.#view = game.view;
        this.#player = game.player;
        this.#remotePlayers = game.remotePlayers;
        
        // Get player set up for remote connection
        // Using default URL param
        this.#socket = io(window.location.host, { autoConnect: false });

        // auth obj will also send local player position/map in case no previous data found on server
        // - which is fine for connecting player, but sends undefined to remote players
        // const defaultGameMap = this.#view.map.name;
        // const defaultPositionOnMap = this.#player.position.toJson();
        // this.#socket.auth = {
        //     defaultGameMap,
        //     defaultPositionOnMap
        // };
        
        // `localStorage` is a property of browser `window`
        const sessionId = localStorage.getItem('sessionId');
        if (sessionId) {
            // TODO: Should we be getting map/coords from localStorage?
            this.#socket.auth = { sessionId };
            // this.#socket.auth.sessionId = sessionId;
            this.#log?.print(`had seshId ${sessionId}.`)
        }
        
        this.#socket.connect();
    }

    #checkIfReadyForView() {
        if (this.#didReceiveSession
           && this.#didReceiveAllPlayers) {
            if (!this.#isReadyForView) { this.#log?.print('Ready!'); }
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
            this.#view?.map.name,
            this.#player?.position.toJson()
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
        // this.#socket.on('session', async ({ sessionId, userId, gameMap, positionOnMap }) => {
        this.#socket.on('session', async (socket: Socket) => {
            // 'attach sessionId to next reconnection attempts'
            // this.#socket.auth = { sessionId };
            this.#socket.auth = { sessionId: socket.sessionId };
            // TODO: map/position should keep being updated...
            
            // Store in browser's localStorage
            localStorage.setItem('sessionId', socket.sessionId);
            // Save (public) userId
            this.#socket.userId = socket.userId;

            // TODO: Seems this triggers even with hiccup reconnects
            // - Will this be a problem? Will it cause warping?
            // - Actually, will this ALWAYS be true?
            if (socket.gameMap && socket.positionOnMap) {
                this.#log?.print('Welcome back.');
                await this.game.changeMap(socket.gameMap, Coordinate.fromJson(socket.positionOnMap));
            }
            this.#log?.print(`got userId ${this.#socket.userId}.`);
            
            // View will only update if everything else is ready
            this.#didReceiveSession = true;
            this.#updateView();
        });
        
        this.#socket.on('connect_error', (err: Error) => {
            let errorMessage = '(unknown error)';
            if (err.message) { errorMessage = err.message; }
            this.#log?.print(`ERROR: [Socket.io]: ${errorMessage}.`);
        });
        
        // this.#socket.on('self connected', (id) => {
        //     this.#log.print(`You're in (ID: ${id}).`);
        // });
        
        this.#socket.on('connect', () => {
            this.#connectCount++;
            this.#log?.print(`Socket connect count: ${this.#connectCount}.`);
        });
        
        this.#socket.on('disconnect', (reason: Socket.DisconnectReason) => {
            this.#disconnectCount++;
            this.#log?.print(`Socket disconnect count: ${this.#disconnectCount}. Reason: ${reason}.`);
        });
        
        // Get already-connected users when joining
        // Also get updates whenever changing map
        this.#socket.on('all players', (allPlayers: SessionlessPlayer[]) => {
            // Let's flush old data when refreshing so we don't see ghosts
            // (optimize someeday by e.g. just removing players in same room/map)
            this.#remotePlayers?.clear();
            
            allPlayers.forEach((json) => {
                // Skip any players who don't provide a map and position
                if (!json.gameMap || !json.positionOnMap) { return; } // forEach's 'continue'
                
                const remotePlayer = RemotePlayer.fromJson(json);
                this.#log?.print(`found player (id ${remotePlayer.id}, map '${remotePlayer.mapName}', position ${remotePlayer.position}`);
                // Only add if it's not ourself
                if (remotePlayer.id !== this.#socket.userId) {
                    this.#remotePlayers?.set(remotePlayer.id, remotePlayer);
                }
            });
            this.#log?.print(`number of remote players: ${this.#remotePlayers?.size}`);
            this.#didReceiveAllPlayers = true;
            this.#updateView();
        });
        
        // Get new users who join after you
        // socket.on('other connected', ({ userId, positionOnMap }) => {
        this.#socket.on('other connected', (remotePlayerJson: SessionlessPlayer) => {
            const remotePlayer = RemotePlayer.fromJson(remotePlayerJson);
            this.#log?.print(`Friend's in (ID: ${remotePlayer.id}).`);
            if (remotePlayer.id === this.#socket.userId) { return; }
            this.#remotePlayers?.set(remotePlayer.id, remotePlayer);
            // TODO: Did we not need this before? This is new...
            // -should we do a map check first? maybe "updateViewIfNeeded," can recycle
            this.#updateView();
        });
        
        // Only happens when remote user ends all sessions
        this.#socket.on('other disconnected', (userId: string) => {
            this.#log?.print(`userId ${userId} left.`);
            this.#remotePlayers?.delete(userId);
            this.#updateView();
        });
        
        // socket.on('private message'...
        // this.#socket.on('move', async ({ userId, gameMap, positionOnMap }) => {
        this.#socket.on('move', async (socket: SessionlessPlayer) => {
            const position = Coordinate.fromJson(socket.positionOnMap);
            
            // If you moved in one tab, update all your tabs
            if (socket.userId === this.#socket.userId) {
                // Update map if you moved
                if (socket.gameMap !== this.game.view?.map.name) {
                    await this.game.changeMap(socket.gameMap, Coordinate.fromJson(socket.positionOnMap));
                // } else {
                } else if (this.#player) {
                    this.#player.position = position;
                }
                return this.#updateView();
            }
            
            // Reference, not value
            const remotePlayer = this.#remotePlayers?.get(socket.userId);
            
            if (!remotePlayer) { return console.error(`Received move from player with ID#${socket.userId}, but GameSocket.#remotePlayers has no element with this ID.`); }
            
            remotePlayer.mapName = socket.gameMap;
            remotePlayer.position = position;
            const isInView = this.#view?.isVisible(remotePlayer);
            if (remotePlayer.wasInView || isInView) {
                this.#updateView();
            }
            remotePlayer.wasInView = isInView;
        });
    }

    #updateView() {
        // TODO: Make sure all ready-requiring events trigger this, or possible that nothing will ever happen
        if (!this.#isReadyForView) { return; }
        this.#view?.update(this.#player, this.#remotePlayers);
    }
}