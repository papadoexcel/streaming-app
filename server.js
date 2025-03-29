const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public'))); // <<< ESSA LINHA É ESSENCIAL

// Resto do seu código socket e rotas aqui...

server.listen(process.env.PORT || 3000, () => {
  console.log('Servidor rodando');
});
