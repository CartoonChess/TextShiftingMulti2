const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    // io.emit -> send to all
    // socket.broadcast.emit -> send to all but sender client
    
    console.log('A user has connected.');
    //socket.broadcast.emit('chat message', 'A user has connected.');
    socket.broadcast.emit('chat message', ({msg: 'A user has connected.', username: 'System'}));
    
    socket.on('disconnect', () => {
        console.log('A user has disconnected.');
        socket.broadcast.emit('chat message', ({msg: 'A user has disconnected.', username: 'System'}));
    });
    
    // socket.on('chat message', msg => {
    socket.on('chat message', ({msg, user}) => {
        //io.emit('chat message', msg);
        socket.broadcast.emit('chat message', ({msg: msg, username: user}));
    });

    socket.on('move', ({surroundings}) => {
        socket.broadcast.emit('move', ({surroundings: surroundings}));
    });
});

http.listen(port, () => {
    console.log(`Socket.IO server running at http://localhost:${port}/`);
});