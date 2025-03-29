const http = require('http');
const { spawn } = require('child_process');

const YOUTUBE_URL = 'rtmp://a.rtmp.youtube.com/live2';
const STREAM_KEY = '550u-qa5d-a0xv-gthd-f1qa'; // Substitua pela sua chave real

const INTERVALO_MS = 5000;
const STREAM_SOURCE = 'http://streaming-app-65vx.onrender.com/buffer';

setInterval(() => {
  http.get(STREAM_SOURCE, (res) => {
    if (res.statusCode === 200) {
      console.log('🎥 Iniciando nova transmissão com buffer');

      const ffmpeg = spawn('ffmpeg', [
        '-re',
        '-i', '-',
        '-c:v', 'libx264',
        '-preset', 'veryfast',
        '-tune', 'zerolatency',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-f', 'flv',
        `${YOUTUBE_URL}/${STREAM_KEY}`
      ]);

      res.pipe(ffmpeg.stdin);

      ffmpeg.stderr.on('data', (data) => {
        console.log('[FFmpeg]', data.toString());
      });

      ffmpeg.on('close', (code) => {
        console.log(`⛔ FFmpeg finalizado com código ${code}`);
      });
    } else {
      console.log(`⚠️ Sem conteúdo para transmitir (status ${res.statusCode})`);
    }
  }).on('error', (err) => {
    console.error('❌ Erro ao acessar /buffer:', err.message);
  });
}, INTERVALO_MS);
