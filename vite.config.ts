import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

function kannadaTtsPlugin(): Plugin {
  const handleTts = async (req: any, res: any, next: any) => {
    if (req.url && req.url.startsWith('/api/tts')) {
      try {
        const urlObj = new URL(req.url, 'http://localhost');
        const text = urlObj.searchParams.get('text');
        const slow = urlObj.searchParams.get('slow') === 'true';

        if (!text) {
          res.statusCode = 400;
          res.end('Missing text parameter');
          return;
        }

        const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=kn&client=tw-ob&q=${encodeURIComponent(text)}${slow ? '&ttsspeed=0.3' : ''}`;
        const fetchRes = await fetch(ttsUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        });

        if (!fetchRes.ok) {
          res.statusCode = fetchRes.status;
          res.end('TTS fetch failed');
          return;
        }

        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        const buffer = await fetchRes.arrayBuffer();
        res.end(Buffer.from(buffer));
        return;
      } catch (err: any) {
        res.statusCode = 500;
        res.end(err.message || 'TTS error');
        return;
      }
    }
    next();
  };

  return {
    name: 'kannada-tts-plugin',
    configureServer(server) {
      server.middlewares.use(handleTts);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handleTts);
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    kannadaTtsPlugin(),
  ],
});
