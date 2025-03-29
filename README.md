📡 Projeto de Transmissão ao Vivo com Vários Dispositivos para o YouTube

Este projeto permite que vários dispositivos (celulares, tablets, notebooks) transmitam vídeo e áudio em tempo real para uma central de controle, onde o operador escolhe qual transmissão vai ao ar no YouTube.

🎯 Funcionalidades

Transmissão de câmera e microfone em tempo real via navegador.

Permite alternar entre câmera frontal e traseira.

Envia áudio junto com o vídeo.

Interface simples para o operador escolher qual transmissão vai ao YouTube.

Envio para YouTube via FFmpeg local.

🧩 Estrutura do Projeto

transmissao/
├── public/
│   ├── index.html           # Interface do dispositivo
│   └── operador.html        # Interface da central de controle
├── server.js                # Servidor Express + WebSocket
├── ffmpeg-receiver.js       # Cliente local que envia para o YouTube
├── .gitignore
└── package.json

🚀 Como usar

1. Subir o servidor (Render ou local)

O server.js serve os arquivos e gerencia os WebSockets.

No Render, a pasta public/ é servida automaticamente.

2. Acessar as interfaces

Dispositivos: https://seuapp.onrender.com

Central do operador: https://seuapp.onrender.com/operador.html

3. Iniciar a transmissão

No dispositivo, digite seu nome e clique no botão ▶ para transmitir.

Na central, clique em "Selecionar para transmissão" para definir qual vídeo vai ao ar.

4. Rodar o ffmpeg-receiver.js localmente

node ffmpeg-receiver.js

Ele conecta na rota /buffer do servidor e envia para o YouTube Live usando sua Stream Key.

📺 Requisitos para o FFmpeg

FFmpeg precisa estar instalado e acessível no PATH.

Teste com ffmpeg -version no terminal.

🔐 Variáveis importantes

No ffmpeg-receiver.js:

const YOUTUBE_URL = 'rtmp://a.rtmp.youtube.com/live2';
const STREAM_KEY = 'SUA-STREAM-KEY-AQUI';

🛡️ .gitignore recomendado

node_modules/
.env
.DS_Store
*.log

🧠 Sugestões de melhoria futura

Interface do operador com destaque visual da transmissão selecionada.

Feedback de status do envio para o YouTube.

Gravação local das transmissões.

Controle de qualidade (resolução, bitrate, etc).

🙌 Créditos

Projeto desenvolvido por Rodrigo com apoio do ChatGPT para arquitetura, código e testes.

Feito com ❤️ e muito ódio de soluções complicadas.

