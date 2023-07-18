// adding "type":"module" to package.json means commonjs (x), es6 (o)
// this changes some things:
// 1. we write `export class/function Foo {}` instead of `module.exports ...`
// 2. we use `import x from y` instead of require()
// 3. we have to use `import="module"` in html <script>

import express from 'express';
const app = express();
import http from 'http';
const httpServer = http.Server(app);
// this is probably a lie
const port = process.env.PORT || 3000; // 443 is frontend tho

import { Server } from 'socket.io';
const io = new Server(httpServer);

// For saving sessions and identifying users
import { InMemorySessionStore } from './sessionStore.js';
const sessionStore = new InMemorySessionStore();

import { RandomBytes } from './randomBytes.js';
const randomBytes = new RandomBytes();
// Generates new whenever referenced
const randomId = () => randomBytes.hex(16);

// Return formatted room names
const userRoom = (userId) => 'user:' + userId;
const mapRoom = (mapName) => 'map:' + mapName;

// app.get('/', (req, res) => {
//     res.sendFile(__dirname + '/index.html');
// });

// Feels like a hack lol
app.get('/randomBytes.js', (req, res) => {
    res.sendFile(__dirname + '/randomBytes.js');
});

app.get('/String_prototype.js', (req, res) => {
    res.sendFile(__dirname + '/String_prototype.js');
});

app.get('/chat.html', (req, res) => {
    res.sendFile(__dirname + '/__old/chat.html');
});

// Serve up the /public folder as the root html folder
// Use `__dirname` in ES module: https://flaviocopes.com/fix-dirname-not-defined-es-module-scope/
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, 'public');
app.use('/', express.static(publicDir));

import Game from './public/js/Game.js';
const defaultGameMap = Game.defaultMapPackage;
const defaultPositionOnMapJson = await Game.getDefaultStartPositionJson();
const defaultPositionOnMap = JSON.stringify(defaultPositionOnMapJson);

// Send data on all other users back to caller
// TODO: Can we make 'move' await this, so players don't flash into view?
// function emitAllPlayers(socket, sameMapOnly) {
function emitAllPlayers(socket) {
    const allPlayers = [];
    sessionStore.findAllSessions().forEach((session) => {
        if (session.isOnline) {
        // TODO: Fix ghosting when we only send users on current map
        // A, B on map 1
        // A, B -> 2
        // B -> 1 -> 3
        // A -> 1 => ghost of B where they came in
        // if (session.isOnline
        //    && session.gameMap === socket.gameMap) {
            allPlayers.push({
                userId: session.userId,
                gameMap: session.gameMap,
                positionOnMap: session.positionOnMap
            });
        }
    });
    socket.emit('all players', allPlayers);
}

// `.use` ("middleware"?) perhaps executed only once per socket when first connecting
// Actually seems to run each time, even after ping hiccups...
io.use((socket, next) => {
    console.log(`Running middleware for socket.id ${socket.id}...`);

    // TODO: Load in Game and get default map + coords, set from there?
    // - and maybe do permastorage later (i.e. just reset all players when server resets)
    
    // Note we can attach any custom property we want here
    const sessionId = socket.handshake.auth.sessionId;
    if (sessionId) {
        console.log(`[${socket.id}] sessionId (client) = true`);
        // User's got a session locally in browser
        const session = sessionStore.findSession(sessionId);
        if (session) {
            console.log(`[${socket.id}] session (server) = true`);
            // And the server remembers it
            socket.sessionId = sessionId;
            socket.userId = session.userId;
            socket.gameMap = session.gameMap;
            socket.positionOnMap = session.positionOnMap;
            return next();
        }
    }

    // User had no sessionId or the server wasn't aware (maybe restarted)
    socket.sessionId = randomId();
    // TODO: This should be permanent maybe? Or do we need separate backend ("id") and frontfacing ("username") props?
    socket.userId = randomId();
    // TODO: When server restarts, session doesn't exist, but client doesn't pass one either, so these don't exist
    // console.log(`[${socket.id}] defaultGameMap (client) = ${socket.handshake.auth.defaultGameMap}`);
    // socket.gameMap = socket.handshake.auth.defaultGameMap;
    // socket.positionOnMap = socket.handshake.auth.defaultPositionOnMap;
    // console.log(`[${socket.id}] defaultPositionOnMap (client) = ${socket.handshake.auth.defaultPositionOnMap}`);
    socket.gameMap = defaultGameMap;
    socket.positionOnMap = defaultPositionOnMap;
    
    // When we're done
    next();
});

io.on('connection', (socket) => {
    // io.emit -> send to all
    // io.to(...).emit -> send to socket.id/room '...'
    // socket.emit -> return to sender
    // socket.broadcast.emit -> send to all but sender
    // socket.to(...).emit -> send to a room (excluding sender)m

    console.log(`A user has connected (userId ${socket.userId}, sessionId ${socket.sessionId}, socket.id ${socket.id}).`);
    // socket.emit('self connected', socket.id);
    

    // Save sessions so they persist across refreshes
    // Doesn't apply if repl restarts
    sessionStore.saveSession(socket.sessionId, {
        userId: socket.userId,
        isOnline: true,
        gameMap: socket.gameMap,
        positionOnMap: socket.positionOnMap
    });

    // Send session details back to user
    socket.emit('session', {
        sessionId: socket.sessionId,
        userId: socket.userId,
        gameMap: socket.gameMap,
        positionOnMap: socket.positionOnMap
    });

    // Have all sockets in the same browser join a "room" together
    // They'll be told when they should all switch map rooms
    socket.join(userRoom(socket.userId));
    
    // Use rooms to group together users on the same map
    // (sockets can join multiple rooms, i.e. userId and gameMap)
    socket.join(mapRoom(socket.gameMap));
    console.log(`User ${socket.userId} joined rooms "${userRoom(socket.userId)}" and "${mapRoom(socket.gameMap)}".`);

    // Get data on all other users
    emitAllPlayers(socket);

    // Tell other players about yourself
    socket.broadcast.emit('other connected', {
        userId: socket.userId,
        gameMap: socket.gameMap,
        positionOnMap: socket.positionOnMap
    });
    
    socket.on('disconnect', async (reason) => {
        console.log(`User with ID ${socket.userId} closed a session. Reason: ${reason}.`);
        const matchingSockets = await io.in(userRoom(socket.userId)).fetchSockets();
        console.log(`Matching sockets: ${matchingSockets}`);
        const isDisconnected = matchingSockets.length === 0;
        if (isDisconnected) {
            socket.broadcast.emit('other disconnected', socket.userId);
            // We can save final details here
            sessionStore.saveSession(socket.sessionId, {
                userId: socket.userId,
                isOnline: false,
                gameMap: socket.gameMap,
                positionOnMap: socket.positionOnMap
            });
        } else {
            console.log(`-> (but they still have ${matchingSockets.length} session(s) open.)`);
        }
    });

    socket.on('latency', (callback) => {
        callback();
    });

    // Just for debugging basically
    socket.onAny((event, ...args) => {
        console.log('[[socket]]', event, args);
    });
    
    // for (let [id] of io.of('/').sockets) {
    //     console.log(id);
    // }
    // console.log(`I am ${socket.id}.`);
    
    // socket.on('chat message', ({msg, user}) => {
    //     socket.broadcast.emit('chat message', ({msg: msg, username: user}));
    // });

    socket.on('move', (gameMap, positionOnMap) => {
        // If changing maps, leave map room and join new one in all tabs
        let currentRoom = mapRoom(gameMap);
        let oldRoom;
        if (socket.gameMap !== gameMap) {
            oldRoom = mapRoom(socket.gameMap);
            io.in(userRoom(socket.userId)).socketsLeave(oldRoom);
            io.in(userRoom(socket.userId)).socketsJoin(currentRoom);
            console.log(`User ${socket.userId} left room "${oldRoom}" and joined "${currentRoom}".`);
        }
        
        socket.gameMap = gameMap;
        socket.positionOnMap = positionOnMap;
        const moveInfo = {
            userId: socket.userId,
            gameMap: gameMap,
            positionOnMap: positionOnMap
        };
        
        // Broadcast only to room (and previous if changed map)
        // TODO: Can we set .to(currentRoom), conditionally add oldRoom, then .emit after?
        if (oldRoom) {
            socket.to(oldRoom).to(currentRoom).emit('move', moveInfo);
        } else {
            socket.to(currentRoom).emit('move', moveInfo);
        }
        
        // Update session store as well so players connecting later can see this
        sessionStore.updateSession(socket.sessionId, {
            gameMap: gameMap,
            positionOnMap: positionOnMap
        });

        // Get updated players and coords for the map if moving
        // if (oldRoom) { emitAllPlayers(socket, true); }
        if (oldRoom) { emitAllPlayers(socket); }
    });
});

httpServer.listen(port, () => {
    console.log(`Socket.IO server running at http://localhost:${port}/`);
});