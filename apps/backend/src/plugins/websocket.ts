import websocket, { WebsocketPluginOptions } from '@fastify/websocket';
import fp from 'fastify-plugin';
import { WebSocket } from 'ws/index';

/**
 * This plugins adds some utilities to handle http errors
 *
 * @see https://github.com/fastify/fastify-sensible
 */
export default fp<WebsocketPluginOptions>(async (fastify) => {
   fastify.register(websocket);

   fastify.decorate('sockets', new Map());
});

declare module 'fastify' {
   export interface FastifyInstance {
      sockets: Map<string, WebSocket>;
   }
}
