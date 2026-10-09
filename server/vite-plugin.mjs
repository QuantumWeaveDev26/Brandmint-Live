import { createVoiceHandler } from './voice-proxy.mjs';
import { attachRealtimeInput } from './realtime-input.mjs';
import { createNodeListener } from './node-adapter.mjs';
import { loadServerEnvironment } from './environment.mjs';
import { readReplies, replySource } from '../scripts/voice-replies.mjs';
import { fileURLToPath } from 'node:url';

export function voiceProxyPlugin() {
  return {
    name: 'brandmint-server-only-voice',
    async configureServer(server) {
      const replies = new Set(await readReplies());
      const env = loadServerEnvironment(server.config.root);
      const listener = createNodeListener(createVoiceHandler({ env, replies, realtimeAvailable: true }));
      if (server.httpServer) attachRealtimeInput(server.httpServer, { env });
      const source = fileURLToPath(replySource);
      const refresh = async (file) => {
        if (file !== source) return;
        try {
          const next = await readReplies();
          replies.clear();
          for (const reply of next) replies.add(reply);
        } catch {
          replies.clear(); // Never keep a stale allowlist after an invalid edit.
          server.config.logger.error('Voice reply extraction failed. Text chat still works; check static reply structure.');
        }
      };
      server.watcher.on('change', refresh);
      server.httpServer?.once('close', () => server.watcher.off('change', refresh));
      server.middlewares.use((request, response, next) => {
        if (request.url?.split('?')[0].startsWith('/api/voice/')) void listener(request, response);
        else next();
      });
    },
  };
}
