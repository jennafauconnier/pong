const net = require('net');
const express = require('express');
const path = require('path');

const app = express();
const server = net.createServer();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'src')));

const players = {};

server.on('connection', (socket) => {
    console.log('Nouvelle connexion: ' + socket.remoteAddress);

    // Initialiser un nouveau joueur et lui envoyer son ID
    players[socket.remoteAddress] = {
        x: 50,
        y: 250,
        id: socket.remoteAddress,
    };

    // Informer les autres joueurs du nouveau joueur
    Object.keys(players).forEach((id) => {
        if (id !== socket.remoteAddress) {
            socket.write(JSON.stringify({ type: 'newPlayer', player: players[id] }));
        }
    });

    // Mettre à jour la position du joueur
    socket.on('data', (data) => {
        const { type, player } = JSON.parse(data);
        if (type === 'movement') {
            players[socket.remoteAddress].x = player.x;
            players[socket.remoteAddress].y = player.y;

            // Diffuser la mise à jour de la position du joueur à tous les autres joueurs
            Object.keys(players).forEach((id) => {
                if (id !== socket.remoteAddress) {
                    socket.write(JSON.stringify({ type: 'playerMoved', player: players[id] }));
                }
            });
        }
    });

    // Gérer la déconnexion d'un joueur
    socket.on('end', () => {
        console.log('Déconnexion: ' + socket.remoteAddress);
        delete players[socket.remoteAddress];

        // Informer les autres joueurs de la déconnexion
        Object.keys(players).forEach((id) => {
            socket.write(JSON.stringify({ type: 'playerDisconnected', playerId: socket.remoteAddress }));
        });
    });
});

server.listen(PORT, () => {
    console.log(`Serveur écoutant sur le port ${PORT}`);
});
