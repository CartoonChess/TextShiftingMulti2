// adding "type":"module" to package.json means commonjs (x), es6 (o)
// this changes some things:
// 1. we write `export class/function Foo {}` instead of `module.exports ...`
// 2. we use `import x from y` instead of require()
// 3. we have to use `import="module"` in html <script>

import express from 'express';
const app = express();
import http from 'http';
const httpServer = new http.Server(app);
// this is probably a lie
const port = process.env.PORT ?? 3000; // 443 is frontend tho

// import { Server } from 'socket.io';
import { Server, Socket } from 'socket.io';
const io = new Server(httpServer);

// For saving sessions and identifying users
import { InMemorySessionStore } from './sessionStore.js';
const sessionStore = new InMemorySessionStore();

import { RandomBytes } from './randomBytes.js';
const randomBytes = new RandomBytes();
// Generates new whenever referenced
const randomId = () => randomBytes.hex(16);

// Return formatted room names
const userRoom = (userId: string) => 'user:' + userId;
const mapRoom = (mapName: string) => 'map:' + mapName;

// app.get('/', (req, res) => {
//     res.sendFile(__dirname + '/index.html');
// });

// Make certain non-public files available clientside
// Feels like a hack lol
const exposedFiles = [
    '/randomBytes.js',
    '/ConsoleColor.js',
    '/String_prototype.js',
    '/HTMLElement_prototype.js',
    '/JSON_stringifyWithClasses.js'
];

for (const file of exposedFiles) {
    app.get(file, (req, res) => {
        res.sendFile(__dirname + file);
    });
}

// TODO: Remove?
// app.get('/fs_readdirRecursive.js', (req, res) => {
//     res.sendFile(__dirname + '/fs_readdirRecursive.js');
// });

// Serve up the /public folder as the root html folder
// Use `__dirname` in ES module: https://flaviocopes.com/fix-dirname-not-defined-es-module-scope/
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path according to generated js file, not base ts file
const publicDir = path.join(__dirname, 'public');
// const publicDir = path.join(__dirname, '../public');
app.use('/', express.static(publicDir));

// Let express parse json POSTs
// app.use(express.json());
// Increase acceptable filesize/URL encoded strings
// TODO: Use gzip (JS now has CompressionStreams for client side)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Provide maps directory listing for editor mode
// Gives name, or name with relative path if in subdirectory
// import fs from './fs_readdirRecursive.js';
import FsExt from './fs_readdirRecursive.js';
const mapsDir = publicDir + '/maps';
app.get('/maps', async (req, res) => {
    try {
        // const files = await fs.readdirRecursive(mapsDir, true, false);
        const files = await FsExt.readdirRecursive(mapsDir, true, false);
        // Strip leading directory info
        const maps = files.map(path => path.substring(mapsDir.length + 1));

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(maps));
    } catch (err) {
        const error = `Server cannot read maps directory: ${err}.`;
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error }));
        return console.error(error);
    }
});

// async function writeFileExclusive(file, data) {
//     await fs.writeFile(file, data, { flag: 'wx'});
// }

// app.post('/createMap', async (req, res) => {
//     try {
//         const { dir, info, map, border } = req.body;
//         const fullDir = path.join(mapsDir, dir);
//         // TODO: Should this and below be array + loop?
//         const infoPath = path.join(fullDir, 'info.js');
//         const mapPath = path.join(fullDir, 'map.js');
//         // TODO: Use new border format (.js)
//         const borderPath = path.join(fullDir, 'border');
//
//         // Create directories, including intermediate
//         await fs.mkdir(fullDir, { recursive: true });
//         // Create js files but throw error if any already exist
//         await writeFileExclusive(infoPath, info);
//         await writeFileExclusive(mapPath, map);
//         await writeFileExclusive(borderPath, border);
//
//         const message = `Created map package ${dir}.`;
//         console.log(message);
//         res.send(message);
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Failed to create one or more map files or directories on server.');
//     }
// });

import fs from 'fs/promises';
// TODO: We can make a create/update combo function by calling /..template if dir/files missing
app.post('/updateMap', async (req, res) => {
    try {
        const { name, tiles } = req.body;
        // TODO: Sanity check this so it isn't like /maps/../[root]/
        const dir = path.join(mapsDir, name);
        const mapPath = path.join(dir, 'map.js');

        const newData = JSON.stringify(tiles, null, 4);

        // Overwrite file
        await fs.writeFile(mapPath, newData);

        const message = `Saved ${name} to server.`;
        console.log(message);
        res.send(message);
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to save map to server.');
    }
});

app.get('/createMapFromTemplate', async (req, res) => {
    // Get path with random name
    const parentDir = req.query.parentDir;
    let mapName = randomBytes.alphanumeric(8);
    if (parentDir) {
        mapName = parentDir + '/' + mapName;
    }

    // Create new map directory
    const newDir = path.join(mapsDir, mapName);
    await fs.mkdir(newDir);

    // Copy over default map files
    try {
        const templateDir = 'map_template';
        const files = await fs.readdir('map_template');

        for (const file of files) {
            const source = path.resolve(templateDir, file);
            const destination = path.join(newDir, path.basename(source));
            console.log(`Copying from ${source} to ${destination}.`);
            await fs.copyFile(source, destination);
        }
    } catch (err) {
        res.status(500).send(`Server failed to make new map from template: ${err}.`);
        console.error(err);
        return;
    }
    
    // Return new name to client
    res.send(mapName);
});

// TODO: Did we need this line?
// import './JSON_stringifyWithClasses.js';

// TODO: Redundancy with template creation above, probably
app.get('/fetchMap', async (req, res) => {
    const mapFile = req.query.name + '/map.js';
    const mapPath = path.join(mapsDir, mapFile);
    
    try {
        const data = await fs.readFile(mapPath);
        res.send(data);
    } catch(err) {
        console.error(`Couldn't fetch map data: ${err}.`);
        return;
    }
});

import Game from './public/js/Game.js';
const defaultGameMap = Game.defaultMapPackage;
// Had to set `"target": "es2017" in `tsconfig` for this `await` to work; 
// TODO: move all this logic into separate module
const defaultPositionOnMapJson = await Game.getDefaultStartPositionJson();
const defaultPositionOnMap = JSON.stringify(defaultPositionOnMapJson);

// Send data on all other users back to caller
// TODO: Can we make 'move' await this, so players don't flash into view?
// function emitAllPlayers(socket, sameMapOnly) {
// function emitAllPlayers(socket: Socket) {
//     const allPlayers = [];
//     sessionStore.findAllSessions().forEach((session) => {
//         if (session.isOnline) {
//         // TODO: Fix ghosting when we only send users on current map
//         // A, B on map 1
//         // A, B -> 2
//         // B -> 1 -> 3
//         // A -> 1 => ghost of B where they came in
//         // if (session.isOnline
//         //    && session.gameMap === socket.gameMap) {
//             allPlayers.push({
//                 userId: session.userId,
//                 gameMap: session.gameMap,
//                 positionOnMap: session.positionOnMap
//             });
//         }
//     });
//     socket.emit('all players', allPlayers);
// }

// interface SessionlessPlayer {
//     userId: string;
//     gameMap: string;
//     positionOnMap: string
// }
import SessionlessPlayer from "./SessionlessPlayer.js"
function emitAllPlayers(socket: Socket) {
    const allPlayers: SessionlessPlayer[] = [];
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
    // Doesn't apply if server restarts
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
        if (oldRoom) { emitAllPlayers(socket); }
    });
});

httpServer.listen(port, () => {
    console.log(`Socket.IO server running at http://localhost:${port}/`);
});