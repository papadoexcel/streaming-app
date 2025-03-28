const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const RTMP_URL = 'rtmp://a.rtmp.youtube.com/live2/550u-qa5d-a0xv-gthd-f1qa';

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log('📲 Novo dispositivo conectado!');

  let ffmpeg = spawn('ffmpeg', [
    '-re',
    '-i', 'pipe:0',
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-tune', 'zerolatency',
    '-f', 'flv',
    RTMP_URL
  ]);

  ffmpeg.stderr.on('data', (data) => {
    console.log(`FFmpeg log: ${data}`);
  });

  ffmpeg.on('close', () => {
    console.log('FFmpeg finalizado');
  });

  socket.on('video', (data) => {
    ffmpeg.stdin.write(data);
  });

  socket.on('disconnect', () => {
    console.log('❌ Dispositivo desconectado');
    ffmpeg.stdin.end();
    ffmpeg.kill('SIGINT');
  });
});

server.listen(3000, () => {
  console.log('✅ Servidor rodando em http://localhost:3000');
});
