const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const porta = process.env.PORT || 3000;
const dispositivos = new Map();
let dispositivoSelecionado = null;

// Serve arquivos estáticos
app.use(express.static('public'));

// Envia o último buffer para o ffmpeg-receiver
let ultimoBuffer = null;
app.get('/buffer', (req, res) => {
  if (ultimoBuffer) {
    res.writeHead(200, { 'Content-Type': 'video/webm' });
    res.end(ultimoBuffer);
  } else {
    res.status(204).end();
  }
});

io.on('connection', socket => {
  console.log('🔌 Novo cliente conectado:', socket.id);

  socket.on('set-nome', nome => {
    dispositivos.set(socket.id, { id: socket.id, nome });
    console.log(`📱 Novo dispositivo: ${nome} (${socket.id})`);
    atualizarLista();
  });

  socket.on('join-operador', () => {
    socket.emit('lista-dispositivos', Array.from(dispositivos.values()));
  });

  socket.on('video', buffer => {
    if (socket.id === dispositivoSelecionado) {
      ultimoBuffer = buffer;
    }

    io.emit('preview', {
      id: socket.id,
      nome: dispositivos.get(socket.id)?.nome || 'Desconhecido',
      buffer,
    });
  });

  socket.on('selecionar-dispositivo', id => {
    dispositivoSelecionado = id;
    console.log('🎯 Dispositivo selecionado para transmissão:', id);
  });

  socket.on('disconnect', () => {
    dispositivos.delete(socket.id);
    if (dispositivoSelecionado === socket.id) {
      dispositivoSelecionado = null;
      ultimoBuffer = null;
    }
    io.emit('remover-dispositivo', socket.id);
    atualizarLista();
  });

  function atualizarLista() {
    io.emit('lista-dispositivos', Array.from(dispositivos.values()));
  }
});

server.listen(porta, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${porta}`);
});
