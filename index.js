const app = require('express')();
const httpServer = require('http').Server(app);
// this is probably a lie
const port = process.env.PORT || 3000; // 443 is frontend tho
// not sure we'll need the `, {/n...}` portion
// const io = require('socket.io')(httpServer, {
//     cors: {
//         origin: `http://localhost:${port}`,
//     },
// });
const io = require('socket.io')(httpServer);

// For saving sessions and identifying users
const { InMemorySessionStore } = require("./sessionStore");
const sessionStore = new InMemorySessionStore();

const { RandomBytes } = require("./randomBytes");
const randomBytes = new RandomBytes();
// Generates new whenever referenced
const randomId = () => randomBytes.hex(16);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Feels like a hack lol
app.get('/randomBytes.js', (req, res) => {
    res.sendFile(__dirname + '/randomBytes.js');
});

app.get('/chat.html', (req, res) => {
    res.sendFile(__dirname + '/__chat.html');
});

// `.use` ("middleware"?) perhaps executed only once per socket when first connecting
io.use((socket, next) => {
    // Note we can attach any custom property we want here
    // socket.playerPosition = playerPosition;
    console.log("to.use (middleware)");

    const sessionId = socket.handshake.auth.sessionId;
    if (sessionId) {
        // User's got a session locally in browser
        const session = sessionStore.findSession(sessionId);
        if (session) {
            // And the server remembers it
            socket.sessionId = sessionId;
            socket.userId = session.userId;
            socket.positionOnMap = session.positionOnMap;
            return next();
        }
    }
    
    // User had no sessionId or the server wasn't aware (maybe restarted)
    socket.sessionId = randomId();
    socket.userId = randomId();
    // TODO: Client should be providing this... or we warp them somehow
    // We should be able to warp players anyone for multiple tabs open...
    socket.positionOnMap = {
        column: 14,
        line: 14
    }
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
    socket.emit('self connected', socket.id);
    

    // Save sessions so they persist across refreshes
    // Doesn't apply if repl restarts
    sessionStore.saveSession(socket.sessionId, {
        userId: socket.userId,
        isOnline: true,
        positionOnMap: socket.positionOnMap
    });

    // Send session details back to user
    socket.emit('session', {
        sessionId: socket.sessionId,
        userId: socket.userId,
        positionOnMap: socket.positionOnMap // TODO: may cause obj/json errors
    });

    // Have all sockets in the same browser join a "room" together
    // (pretty sure we're not taking advantage of this yet though)
    socket.join(socket.userId);

    // Get data on all other users
    const allPlayers = [];
    sessionStore.findAllSessions().forEach((session) => {
        if (session.isOnline) {
            allPlayers.push({
                userId: session.userId,
                positionOnMap: session.positionOnMap
            });
        }
    });
    socket.emit('all players', allPlayers);

    // Tell other players about yourself
    socket.broadcast.emit('other connected', {
        userId: socket.userId,
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
                positionOnMap: JSON.parse(socket.positionOnMap) // TODO: no parse?
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
        console.log(event, args);
    });
    
    // for (let [id] of io.of('/').sockets) {
    //     console.log(id);
    // }
    // console.log(`I am ${socket.id}.`);
    
    socket.on('chat message', ({msg, user}) => {
        socket.broadcast.emit('chat message', ({msg: msg, username: user}));
    });

    socket.on('move', (positionOnMap) => {
        socket.positionOnMap = positionOnMap;
        socket.broadcast.emit('move', {
            userId: socket.userId,
            positionOnMap: positionOnMap
        });
        // Update session store as well so new players will see this
        // TODO: sockets of the same sessionId should sync to this
        sessionStore.updateSession(socket.sessionId, {
            positionOnMap: JSON.parse(positionOnMap)
        });
    });
});

httpServer.listen(port, () => {
    console.log(`Socket.IO server running at http://localhost:${port}/`);
});