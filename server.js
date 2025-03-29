const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const dispositivos = new Map();
let feedSelecionado = null;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/buffer', (req, res) => {
  if (feedSelecionado && dispositivos.has(feedSelecionado)) {
    res.setHeader('Content-Type', 'video/webm');
    dispositivos.get(feedSelecionado).previewStream.pipe(res);
  } else {
    res.status(204).end();
  }
});

io.on('connection', (socket) => {
  console.log(`📲 Novo socket conectado: ${socket.id}`);

  socket.on('join-dispositivo', (nome) => {
    console.log(`📱 Dispositivo conectado: ${nome}`);
    dispositivos.set(socket.id, { nome, previewStream: null });
    io.to('operadores').emit('lista-dispositivos', listarDispositivos());
  });

  socket.on('join-operador', () => {
    socket.join('operadores');
    socket.emit('lista-dispositivos', listarDispositivos());
  });

  socket.on('preview', (data) => {
    if (dispositivos.has(socket.id)) {
      const buffer = Buffer.from(data);
      dispositivos.get(socket.id).previewStream = require('stream').Readable.from([buffer]);
      io.to('operadores').emit('preview', {
        id: socket.id,
        nome: dispositivos.get(socket.id).nome,
        buffer
      });

      // 👇 Seleção automática do primeiro feed disponível
      if (!feedSelecionado) {
        console.log(`🎯 Selecionando automaticamente: ${socket.id}`);
        feedSelecionado = socket.id;
      }
    }
  });

  socket.on('selecionar-dispositivo', (id) => {
    feedSelecionado = id;
    console.log(`🎯 Dispositivo selecionado manualmente: ${id}`);
  });

  socket.on('disconnect', () => {
    dispositivos.delete(socket.id);
    if (feedSelecionado === socket.id) {
      feedSelecionado = null;
    }
    io.to('operadores').emit('remover-dispositivo', socket.id);
  });
});

function listarDispositivos() {
  return Array.from(dispositivos.entries()).map(([id, { nome }]) => ({ id, nome }));
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
