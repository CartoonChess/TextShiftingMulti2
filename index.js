const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/chat.html', (req, res) => {
    res.sendFile(__dirname + '/chat.html');
});

app.get('/talk', (req, res) => {
    res.sendFile(__dirname + '/chat.html');
});

io.on('connection', (socket) => {
    // io.emit -> send to all
    // socket.broadcast.emit -> send to all but sender client

    // These happen constantly so we're disabling for now
    // console.log('A user has connected.');
    // socket.broadcast.emit('chat message', ({msg: 'A user has connected.', username: 'System'}));
    
    // socket.on('disconnect', () => {
    //     console.log('A user has disconnected.');
    //     socket.broadcast.emit('chat message', ({msg: 'A user has disconnected.', username: 'System'}));
    // });
    
    socket.on('chat message', ({msg, user}) => {
        socket.broadcast.emit('chat message', ({msg: msg, username: user}));
    });

    socket.on('move', (positionOnMap) => {
        socket.broadcast.emit('move', (positionOnMap));
    });
});

http.listen(port, () => {
    console.log(`Socket.IO server running at http://localhost:${port}/`);
});