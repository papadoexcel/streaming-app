const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000;

// Servir os arquivos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

let dispositivos = {};
let dispositivoSelecionado = null;

// Rota do buffer para o ffmpeg
let ultimoBuffer = null;
app.get('/buffer', (req, res) => {
  if (ultimoBuffer) {
    res.setHeader('Content-Type', 'video/webm');
    res.end(ultimoBuffer);
  } else {
    res.status(204).end();
  }
});

// Socket.io
io.on('connection', socket => {
  console.log('Novo socket conectado:', socket.id);

  socket.on('set-nome', nome => {
    dispositivos[socket.id] = { id: socket.id, nome };
    io.emit('lista-dispositivos', Object.values(dispositivos));
  });

  socket.on('video', buffer => {
    if (socket.id === dispositivoSelecionado) {
      ultimoBuffer = buffer;
    }

    io.emit('preview', {
      id: socket.id,
      nome: dispositivos[socket.id]?.nome || 'Desconhecido',
      buffer
    });
  });

  socket.on('join-operador', () => {
    socket.emit('lista-dispositivos', Object.values(dispositivos));
  });

  socket.on('selecionar-dispositivo', id => {
    dispositivoSelecionado = id;
    console.log('Dispositivo selecionado:', id);
  });

  socket.on('disconnect', () => {
    delete dispositivos[socket.id];
    io.emit('remover-dispositivo', socket.id);
  });
});

// Inicia o servidor
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
