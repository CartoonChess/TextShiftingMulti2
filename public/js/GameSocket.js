var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _GameSocket_instances, _GameSocket_socket, _GameSocket_connectCount, _GameSocket_disconnectCount, _GameSocket_log, _GameSocket_view, _GameSocket_player, _GameSocket_remotePlayers, _GameSocket__didReceiveSession, _GameSocket__didReceiveAllPlayers, _GameSocket_isReadyForView, _GameSocket_checkIfReadyForView, _GameSocket_didReceiveSession_set, _GameSocket_didReceiveSession_get, _GameSocket_didReceiveAllPlayers_set, _GameSocket_didReceiveAllPlayers_get, _GameSocket_updateView;
import '../../ConsoleColor.js';
import { Coordinate } from './GameMap.js';
import { RemotePlayer } from './Character.js';
// import { Socket } from 'socket.io';
import { io } from 'socket.io-client';
// import { Session } from 'inspector';
class GameSocket {
    // constructor(game, remotePlayers) {
    constructor(game) {
        var _a;
        _GameSocket_instances.add(this);
        _GameSocket_socket.set(this, void 0);
        // #sessionId;
        _GameSocket_connectCount.set(this, 0);
        _GameSocket_disconnectCount.set(this, 0);
        _GameSocket_log.set(this, void 0);
        _GameSocket_view.set(this, void 0);
        _GameSocket_player.set(this, void 0);
        _GameSocket_remotePlayers.set(this, void 0);
        // To make sure we have enough data from the server to update the view
        _GameSocket__didReceiveSession.set(this, false);
        _GameSocket__didReceiveAllPlayers.set(this, false);
        _GameSocket_isReadyForView.set(this, false);
        this.game = game;
        __classPrivateFieldSet(this, _GameSocket_log, game.log, "f");
        __classPrivateFieldSet(this, _GameSocket_view, game.view, "f");
        __classPrivateFieldSet(this, _GameSocket_player, game.player, "f");
        __classPrivateFieldSet(this, _GameSocket_remotePlayers, game.remotePlayers, "f");
        // Get player set up for remote connection
        // Using default URL param
        __classPrivateFieldSet(this, _GameSocket_socket, io(window.location.host, { autoConnect: false }), "f");
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
            __classPrivateFieldGet(this, _GameSocket_socket, "f").auth = { sessionId };
            // this.#socket.auth.sessionId = sessionId;
            (_a = __classPrivateFieldGet(this, _GameSocket_log, "f")) === null || _a === void 0 ? void 0 : _a.print(`had seshId ${sessionId}.`);
        }
        __classPrivateFieldGet(this, _GameSocket_socket, "f").connect();
    }
    // For outside use
    get isReadyForView() {
        return __classPrivateFieldGet(this, _GameSocket_isReadyForView, "f");
    }
    broadcastMove() {
        var _a, _b;
        __classPrivateFieldGet(this, _GameSocket_socket, "f").emit('move', (_a = __classPrivateFieldGet(this, _GameSocket_view, "f")) === null || _a === void 0 ? void 0 : _a.map.name, (_b = __classPrivateFieldGet(this, _GameSocket_player, "f")) === null || _b === void 0 ? void 0 : _b.position.toJson());
    }
    pingServer() {
        const start = Date.now();
        __classPrivateFieldGet(this, _GameSocket_socket, "f").emit('latency', () => {
            const duration = Date.now() - start;
            return duration;
        });
    }
    listen() {
        // Get session ID, whether new or returning
        // this.#socket.on('session', async ({ sessionId, userId, gameMap, positionOnMap }) => {
        __classPrivateFieldGet(this, _GameSocket_socket, "f").on('session', async (socket) => {
            var _a, _b;
            // 'attach sessionId to next reconnection attempts'
            // this.#socket.auth = { sessionId };
            __classPrivateFieldGet(this, _GameSocket_socket, "f").auth = { sessionId: socket.sessionId };
            // TODO: map/position should keep being updated...
            // Store in browser's localStorage
            localStorage.setItem('sessionId', socket.sessionId);
            // Save (public) userId
            __classPrivateFieldGet(this, _GameSocket_socket, "f").userId = socket.userId;
            // TODO: Seems this triggers even with hiccup reconnects
            // - Will this be a problem? Will it cause warping?
            // - Actually, will this ALWAYS be true?
            if (socket.gameMap && socket.positionOnMap) {
                (_a = __classPrivateFieldGet(this, _GameSocket_log, "f")) === null || _a === void 0 ? void 0 : _a.print('Welcome back.');
                await this.game.changeMap(socket.gameMap, Coordinate.fromJson(socket.positionOnMap));
            }
            (_b = __classPrivateFieldGet(this, _GameSocket_log, "f")) === null || _b === void 0 ? void 0 : _b.print(`got userId ${__classPrivateFieldGet(this, _GameSocket_socket, "f").userId}.`);
            // View will only update if everything else is ready
            __classPrivateFieldSet(this, _GameSocket_instances, true, "a", _GameSocket_didReceiveSession_set);
            __classPrivateFieldGet(this, _GameSocket_instances, "m", _GameSocket_updateView).call(this);
        });
        __classPrivateFieldGet(this, _GameSocket_socket, "f").on('connect_error', (err) => {
            var _a;
            let errorMessage = '(unknown error)';
            if (err.message) {
                errorMessage = err.message;
            }
            (_a = __classPrivateFieldGet(this, _GameSocket_log, "f")) === null || _a === void 0 ? void 0 : _a.print(`ERROR: [Socket.io]: ${errorMessage}.`);
        });
        // this.#socket.on('self connected', (id) => {
        //     this.#log.print(`You're in (ID: ${id}).`);
        // });
        __classPrivateFieldGet(this, _GameSocket_socket, "f").on('connect', () => {
            var _a;
            var _b;
            __classPrivateFieldSet(this, _GameSocket_connectCount, (_b = __classPrivateFieldGet(this, _GameSocket_connectCount, "f"), _b++, _b), "f");
            (_a = __classPrivateFieldGet(this, _GameSocket_log, "f")) === null || _a === void 0 ? void 0 : _a.print(`Socket connect count: ${__classPrivateFieldGet(this, _GameSocket_connectCount, "f")}.`);
        });
        __classPrivateFieldGet(this, _GameSocket_socket, "f").on('disconnect', (reason) => {
            var _a;
            var _b;
            __classPrivateFieldSet(this, _GameSocket_disconnectCount, (_b = __classPrivateFieldGet(this, _GameSocket_disconnectCount, "f"), _b++, _b), "f");
            (_a = __classPrivateFieldGet(this, _GameSocket_log, "f")) === null || _a === void 0 ? void 0 : _a.print(`Socket disconnect count: ${__classPrivateFieldGet(this, _GameSocket_disconnectCount, "f")}. Reason: ${reason}.`);
        });
        // Get already-connected users when joining
        // Also get updates whenever changing map
        __classPrivateFieldGet(this, _GameSocket_socket, "f").on('all players', (allPlayers) => {
            var _a, _b, _c;
            // Let's flush old data when refreshing so we don't see ghosts
            // (optimize someeday by e.g. just removing players in same room/map)
            (_a = __classPrivateFieldGet(this, _GameSocket_remotePlayers, "f")) === null || _a === void 0 ? void 0 : _a.clear();
            allPlayers.forEach((json) => {
                var _a, _b;
                // Skip any players who don't provide a map and position
                if (!json.gameMap || !json.positionOnMap) {
                    return;
                } // forEach's 'continue'
                const remotePlayer = RemotePlayer.fromJson(json);
                (_a = __classPrivateFieldGet(this, _GameSocket_log, "f")) === null || _a === void 0 ? void 0 : _a.print(`found player (id ${remotePlayer.id}, map '${remotePlayer.mapName}', position ${remotePlayer.position}`);
                // Only add if it's not ourself
                if (remotePlayer.id !== __classPrivateFieldGet(this, _GameSocket_socket, "f").userId) {
                    (_b = __classPrivateFieldGet(this, _GameSocket_remotePlayers, "f")) === null || _b === void 0 ? void 0 : _b.set(remotePlayer.id, remotePlayer);
                }
            });
            (_b = __classPrivateFieldGet(this, _GameSocket_log, "f")) === null || _b === void 0 ? void 0 : _b.print(`number of remote players: ${(_c = __classPrivateFieldGet(this, _GameSocket_remotePlayers, "f")) === null || _c === void 0 ? void 0 : _c.size}`);
            __classPrivateFieldSet(this, _GameSocket_instances, true, "a", _GameSocket_didReceiveAllPlayers_set);
            __classPrivateFieldGet(this, _GameSocket_instances, "m", _GameSocket_updateView).call(this);
        });
        // Get new users who join after you
        // socket.on('other connected', ({ userId, positionOnMap }) => {
        __classPrivateFieldGet(this, _GameSocket_socket, "f").on('other connected', (remotePlayerJson) => {
            var _a, _b;
            const remotePlayer = RemotePlayer.fromJson(remotePlayerJson);
            (_a = __classPrivateFieldGet(this, _GameSocket_log, "f")) === null || _a === void 0 ? void 0 : _a.print(`Friend's in (ID: ${remotePlayer.id}).`);
            if (remotePlayer.id === __classPrivateFieldGet(this, _GameSocket_socket, "f").userId) {
                return;
            }
            (_b = __classPrivateFieldGet(this, _GameSocket_remotePlayers, "f")) === null || _b === void 0 ? void 0 : _b.set(remotePlayer.id, remotePlayer);
            // TODO: Did we not need this before? This is new...
            // -should we do a map check first? maybe "updateViewIfNeeded," can recycle
            __classPrivateFieldGet(this, _GameSocket_instances, "m", _GameSocket_updateView).call(this);
        });
        // Only happens when remote user ends all sessions
        __classPrivateFieldGet(this, _GameSocket_socket, "f").on('other disconnected', (userId) => {
            var _a, _b;
            (_a = __classPrivateFieldGet(this, _GameSocket_log, "f")) === null || _a === void 0 ? void 0 : _a.print(`userId ${userId} left.`);
            (_b = __classPrivateFieldGet(this, _GameSocket_remotePlayers, "f")) === null || _b === void 0 ? void 0 : _b.delete(userId);
            __classPrivateFieldGet(this, _GameSocket_instances, "m", _GameSocket_updateView).call(this);
        });
        // socket.on('private message'...
        // this.#socket.on('move', async ({ userId, gameMap, positionOnMap }) => {
        __classPrivateFieldGet(this, _GameSocket_socket, "f").on('move', async (socket) => {
            var _a, _b, _c;
            const position = Coordinate.fromJson(socket.positionOnMap);
            // If you moved in one tab, update all your tabs
            if (socket.userId === __classPrivateFieldGet(this, _GameSocket_socket, "f").userId) {
                // Update map if you moved
                if (socket.gameMap !== ((_a = this.game.view) === null || _a === void 0 ? void 0 : _a.map.name)) {
                    await this.game.changeMap(socket.gameMap, Coordinate.fromJson(socket.positionOnMap));
                    // } else {
                }
                else if (__classPrivateFieldGet(this, _GameSocket_player, "f")) {
                    __classPrivateFieldGet(this, _GameSocket_player, "f").position = position;
                }
                return __classPrivateFieldGet(this, _GameSocket_instances, "m", _GameSocket_updateView).call(this);
            }
            // Reference, not value
            const remotePlayer = (_b = __classPrivateFieldGet(this, _GameSocket_remotePlayers, "f")) === null || _b === void 0 ? void 0 : _b.get(socket.userId);
            if (!remotePlayer) {
                return console.error(`Received move from player with ID#${socket.userId}, but GameSocket.#remotePlayers has no element with this ID.`);
            }
            remotePlayer.mapName = socket.gameMap;
            remotePlayer.position = position;
            const isInView = (_c = __classPrivateFieldGet(this, _GameSocket_view, "f")) === null || _c === void 0 ? void 0 : _c.isVisible(remotePlayer);
            if (remotePlayer.wasInView || isInView) {
                __classPrivateFieldGet(this, _GameSocket_instances, "m", _GameSocket_updateView).call(this);
            }
            remotePlayer.wasInView = isInView;
        });
    }
}
_GameSocket_socket = new WeakMap(), _GameSocket_connectCount = new WeakMap(), _GameSocket_disconnectCount = new WeakMap(), _GameSocket_log = new WeakMap(), _GameSocket_view = new WeakMap(), _GameSocket_player = new WeakMap(), _GameSocket_remotePlayers = new WeakMap(), _GameSocket__didReceiveSession = new WeakMap(), _GameSocket__didReceiveAllPlayers = new WeakMap(), _GameSocket_isReadyForView = new WeakMap(), _GameSocket_instances = new WeakSet(), _GameSocket_checkIfReadyForView = function _GameSocket_checkIfReadyForView() {
    var _a;
    if (__classPrivateFieldGet(this, _GameSocket_instances, "a", _GameSocket_didReceiveSession_get)
        && __classPrivateFieldGet(this, _GameSocket_instances, "a", _GameSocket_didReceiveAllPlayers_get)) {
        if (!__classPrivateFieldGet(this, _GameSocket_isReadyForView, "f")) {
            (_a = __classPrivateFieldGet(this, _GameSocket_log, "f")) === null || _a === void 0 ? void 0 : _a.print('Ready!');
        }
        __classPrivateFieldSet(this, _GameSocket_isReadyForView, true, "f");
    }
    else {
        __classPrivateFieldSet(this, _GameSocket_isReadyForView, false, "f");
    }
}, _GameSocket_didReceiveSession_set = function _GameSocket_didReceiveSession_set(bool) {
    __classPrivateFieldSet(this, _GameSocket__didReceiveSession, bool, "f");
    __classPrivateFieldGet(this, _GameSocket_instances, "m", _GameSocket_checkIfReadyForView).call(this);
}, _GameSocket_didReceiveSession_get = function _GameSocket_didReceiveSession_get() {
    return __classPrivateFieldGet(this, _GameSocket__didReceiveSession, "f");
}, _GameSocket_didReceiveAllPlayers_set = function _GameSocket_didReceiveAllPlayers_set(bool) {
    __classPrivateFieldSet(this, _GameSocket__didReceiveAllPlayers, bool, "f");
    __classPrivateFieldGet(this, _GameSocket_instances, "m", _GameSocket_checkIfReadyForView).call(this);
}, _GameSocket_didReceiveAllPlayers_get = function _GameSocket_didReceiveAllPlayers_get() {
    return __classPrivateFieldGet(this, _GameSocket__didReceiveAllPlayers, "f");
}, _GameSocket_updateView = function _GameSocket_updateView() {
    var _a;
    // TODO: Make sure all ready-requiring events trigger this, or possible that nothing will ever happen
    if (!__classPrivateFieldGet(this, _GameSocket_isReadyForView, "f")) {
        return;
    }
    (_a = __classPrivateFieldGet(this, _GameSocket_view, "f")) === null || _a === void 0 ? void 0 : _a.update(__classPrivateFieldGet(this, _GameSocket_player, "f"), __classPrivateFieldGet(this, _GameSocket_remotePlayers, "f"));
};
export default GameSocket;
