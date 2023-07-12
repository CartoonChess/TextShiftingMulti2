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
io.use((socket, next) => {
    // Note we can attach any custom property we want here
    const sessionId = socket.handshake.auth.sessionId;
    if (sessionId) {
        // User's got a session locally in browser
        const session = sessionStore.findSession(sessionId);
        if (session) {
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
    socket.userId = randomId();
    socket.gameMap = socket.handshake.auth.defaultGameMap;
    socket.positionOnMap = socket.handshake.auth.defaultPositionOnMap;
    
    // When we're done
    next();
});

io.on('connection', (socket) => {
    // io.emit -> send to all
    // io.to(...).emit -> send to socket.id/room '...'
    // socket.emit -> return to sender
    // socket.broadcast.emit -> send to all but sender
    // socket.to(...).emit -> send to a room (excluding sender)

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
    console.log(`Joined room "${mapRoom(socket.gameMap)}".`);
    // socket.leave(...);

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
        const matchingSockets = await io.in(socket.userId).fetchSockets();
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

    // Tell your other tabs to change rooms, e.g. when map changes
    // socket.on('update rooms', (oldRoom, currentRoom) => {
    //     console.log(`Inside 'update rooms'...`);
    //     socket.leave(oldRoom);
    //     socket.join(currentRoom);
    //     console.log(`Left room "${oldRoom}" and joined "${currentRoom}".`);
    // });
    socket.on('abc', (gameMap, positionOnMap) => {
        console.log('...abc...');
    });

    socket.on('move', (gameMap, positionOnMap) => {
        // If changing maps, leave map room and join new one
        let currentRoom = mapRoom(gameMap);
        let oldRoom;
        // Changing maps
        if (socket.gameMap !== gameMap) {
            oldRoom = mapRoom(socket.gameMap);
            // socket.leave(oldRoom);
            // socket.join(currentRoom);
            const foo = {a: socket.userId};
            console.log('Entering room change...');
            // io.to(userRoom(socket.userId)).emit('update rooms', { oldRoom, currentRoom });
            // socket.to(userRoom(socket.userId)).emit('update rooms', { oldRoom, currentRoom });
            // socket.to(userRoom(socket.userId)).emit('update rooms', foo);
            
            // const moveInfo = {};
            // socket.to(oldRoom).to(currentRoom).emit('abc', moveInfo);

            
            const rooms = io.of("/").adapter.rooms;
            console.log(rooms);
            const socketIds = rooms.get(userRoom(socket.userId));
            console.log(socketIds);
            let sockets;
            for (const socketId of socketIds) {
                const theSocket = io.sockets.sockets.get(socketId);
                theSocket.leave(oldRoom);
                theSocket.join(currentRoom);
            }
            console.log(rooms);
            
            // const rooms = io.of("/").adapter.sids;
            
            // console.log(`Left room "${oldRoom}" and joined "${currentRoom}".`);
            console.log('...returned.');
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