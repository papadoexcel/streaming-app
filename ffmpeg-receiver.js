
const https = require('https');
const { spawn } = require('child_process');

const YOUTUBE_URL = 'rtmp://a.rtmp.youtube.com/live2';
const STREAM_KEY = '550u-qa5d-a0xv-gthd-f1qa'; // substitua por sua chave real

setInterval(() => {
  https.get('https://streaming-app-xxxxx.onrender.com/buffer', res => {
    if (res.statusCode === 200) {
      const ffmpeg = spawn('ffmpeg', [
        '-re',
        '-i', '-',
        '-c:v', 'libx264',
        '-preset', 'veryfast',
        '-tune', 'zerolatency',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-f', 'flv', `${YOUTUBE_URL}/${STREAM_KEY}`
      ]);

      res.pipe(ffmpeg.stdin);

      ffmpeg.stderr.on('data', data => {
        console.log('[FFmpeg]', data.toString());
      });

      ffmpeg.on('close', code => {
        console.log('FFmpeg finalizado com código', code);
      });
    }
  });
}, 3000);