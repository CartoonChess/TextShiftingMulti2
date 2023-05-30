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

app.get('/chat.html', (req, res) => {
    res.sendFile(__dirname + '/chat.html');
});

app.get('/talk', (req, res) => {
    res.sendFile(__dirname + '/chat.html');
});

// `.use` ("middleware"?) perhaps executed only once per socket when first connecting
io.use((socket, next) => {
    // Note we can attach any custom property we want here
    // socket.playerPosition = playerPosition;

    const sessionId = socket.handshake.auth.sessionId;
    if (sessionId) {
        // User's got a session locally in browser
        const session = sessionStore.findSession(sessionId);
        if (session) {
            // And the server remembers it
            socket.sessionId = sessionId;
            socket.userId = session.userId;
            return next();
        }
    }
    
    // User had no sessionId or the server wasn't aware (maybe restarted)
    socket.sessionId = randomId();
    socket.userId = randomId();
    // When we're done
    next();
});

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
        userId: socket.userId
    });

    // Send session details back to user
    socket.emit('session', {
        sessionId: socket.sessionId,
        userId: socket.userId
    });

    // Have all sockets in the same browser join a "room" together
    socket.join(socket.userId);
    
    // socket.on('disconnect', (reason) => {
    //     console.log(`User with ID ${socket.userId} has disconnected. Reason: ${reason}.`);
    // });

    // Get data on all other users
    const allPlayers = [];
    sessionStore.findAllSessions().forEach((session) => {
        allPlayers.push({
            userId: session.userId
        });
    });
    socket.emit('all players', allPlayers);

    // Tell other players about yourself
    socket.broadcast.emit('other connected', {
        userId: socket.userId
    });
    
    socket.on('disconnect', async (reason) => {
        console.log(`User with ID ${socket.userId} closed a session. Reason: ${reason}.`);
        const matchingSockets = await io.in(socket.userId).fetchSockets();
        const isDisconnected = matchingSockets.length === 0;
        if (isDisconnected) {
            socket.broadcast.emit('other disconnected', socket.userId);
            // We can save final details here; not needed for now?
            // sessionStore.saveSession(socket.sessionId, {
            //     userId: socket.userId,
            //     username: socket.username,
            //     connected: false
            // });
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
        socket.broadcast.emit('move', (positionOnMap));
    });

    socket.on('move2', ({ position }) => {
        socket.broadcast.emit('move2', {
            userId: socket.userId,
            position: position
        });
    });
});

httpServer.listen(port, () => {
    console.log(`Socket.IO server running at http://localhost:${port}/`);
});