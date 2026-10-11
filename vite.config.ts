import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, Plugin } from 'vite';
import { handleAiChatRequest } from './src/server/aiHandler.ts';

function aiDevServerPlugin(): Plugin {
  return {
    name: 'firstsalary-ai-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url) return next();
        const urlPath = req.url.split('?')[0];

        // 1. AI Status endpoint
        if (urlPath === '/api/ai/status' && req.method === 'GET') {
          const hasGemini = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '');
          const hasOpenAI = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== '');
          const hasGroq = Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim() !== '');

          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              isConfigured: hasGemini || hasOpenAI || hasGroq,
              provider: hasGemini ? 'gemini' : hasOpenAI ? 'openai' : hasGroq ? 'groq' : 'none',
              availableModels: [
                hasGemini ? 'Google Gemini 1.5 Flash' : null,
                hasOpenAI ? 'OpenAI GPT-4o Mini' : null,
                hasGroq ? 'Groq Llama 3.1 8B' : null,
              ].filter(Boolean),
            })
          );
          return;
        }

        // 2. AI Chat endpoint
        if (urlPath === '/api/ai/chat' && req.method === 'POST') {
          let bodyStr = '';
          req.on('data', (chunk) => {
            bodyStr += chunk;
          });
          req.on('end', async () => {
            try {
              const body = JSON.parse(bodyStr);
              const result = await handleAiChatRequest(body);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result));
            } catch (err: unknown) {
              const errMsg = err instanceof Error ? err.message : 'Unknown server error';
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: errMsg }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Populate process.env for server-side AI handlers
  Object.assign(process.env, env);

  return {
    base: './',
    plugins: [react(), tailwindcss(), aiDevServerPlugin()],
    server: {
      port: 5173,
      host: true,
      strictPort: false,
    },
    preview: {
      port: 5173,
      host: true,
    },
  };
});
