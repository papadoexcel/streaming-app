const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const dispositivos = {};

app.use(express.static(path.join(__dirname, 'public')));

app.get('/buffer', (req, res) => {
  const selecionado = Object.values(dispositivos).find(d => d.selecionado);
  if (!selecionado || !selecionado.buffer) return res.status(204).end();
  res.setHeader('Content-Type', 'video/webm');
  res.send(selecionado.buffer);
});

io.on('connection', (socket) => {
  console.log('Novo socket conectado:', socket.id);

  socket.on('set-nome', (nome) => {
    dispositivos[socket.id] = { id: socket.id, nome, buffer: null, selecionado: false };
    atualizarLista();
  });

  socket.on('video', (buffer) => {
    if (dispositivos[socket.id]) {
      dispositivos[socket.id].buffer = buffer;
      io.to('operador').emit('preview', {
        id: socket.id,
        nome: dispositivos[socket.id].nome,
        buffer
      });
    }
  });

  socket.on('join-operador', () => {
    socket.join('operador');
    const lista = Object.values(dispositivos).map(({ id, nome }) => ({ id, nome }));
    socket.emit('lista-dispositivos', lista);
  });

  socket.on('selecionar-dispositivo', (idSelecionado) => {
    Object.keys(dispositivos).forEach(id => {
      dispositivos[id].selecionado = (id === idSelecionado);
    });
    console.log("Dispositivo selecionado:", idSelecionado);
  });

  socket.on('disconnect', () => {
    delete dispositivos[socket.id];
    io.to('operador').emit('remover-dispositivo', socket.id);
  });

  function atualizarLista() {
    const lista = Object.values(dispositivos).map(({ id, nome }) => ({ id, nome }));
    io.to('operador').emit('lista-dispositivos', lista);
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
