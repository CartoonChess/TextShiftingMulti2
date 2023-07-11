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

    console.log(socket.handshake.auth);

    // User had no sessionId or the server wasn't aware (maybe restarted)
    socket.sessionId = randomId();
    socket.userId = randomId();
    socket.gameMap = socket.handshake.auth.gameMap;
    socket.positionOnMap = socket.handshake.auth.defaultPositionOnMap;
    
    // When we're done
    next();
});

// io.on('connection', (socket) => {
io.on('connection', (socket) => {
    // io.emit -> send to all
    // io.to(...).emit -> send to socket.id '...'
    // socket.emit -> return to sender
    // socket.broadcast.emit -> send to all but sender
    // socket.to(...).emit -> send to a room, possibly to socket.id

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
    // (pretty sure we're not taking advantage of this yet though)
    socket.join(socket.userId);

    // Get data on all other users
    // TODO: Limit data we send if we're not on the same map
    const allPlayers = [];
    sessionStore.findAllSessions().forEach((session) => {
        if (session.isOnline) {
            allPlayers.push({
                userId: session.userId,
                gameMap: socket.gameMap,
                positionOnMap: session.positionOnMap
            });
        }
    });
    console.log(allPlayers);
    socket.emit('all players', allPlayers);

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
    
    socket.on('chat message', ({msg, user}) => {
        socket.broadcast.emit('chat message', ({msg: msg, username: user}));
    });

    socket.on('move', (gameMap, positionOnMap) => {
        socket.gameMap = gameMap;
        socket.positionOnMap = positionOnMap;
        socket.broadcast.emit('move', {
            userId: socket.userId,
            gameMap: gameMap,
            positionOnMap: positionOnMap
        });
        // Update session store as well so new players will see this
        sessionStore.updateSession(socket.sessionId, {
            gameMap: gameMap,
            positionOnMap: positionOnMap
        });
    });
});

httpServer.listen(port, () => {
    console.log(`Socket.IO server running at http://localhost:${port}/`);
});