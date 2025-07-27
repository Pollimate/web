import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload';
import { FastifyPluginAsync, FastifyServerOptions } from 'fastify';
import {
   serializerCompiler,
   validatorCompiler
} from 'fastify-type-provider-zod';
import mongoose from 'mongoose';
import { join } from 'path';
import { createConnection } from './db';

import { config } from './app';
import env from './lib/env';
import './types';

process.on('unhandledRejection', (reason, promise) => {
   console.error('🔥 Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
   console.error('🔥 Uncaught Exception:', err);
});

export const log = require('pino')({
   level: 'info',
   transport: {
      target: 'pino-pretty',
      options: {
         ignore: 'hostname',
         colorize: true
      }
   }
});

/* App option types */

export interface AppOptions
   extends FastifyServerOptions,
      Partial<AutoloadPluginOptions> {}
// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {};

const app: FastifyPluginAsync<AppOptions> = async (
   fastify,
   opts
): Promise<void> => {
   /* Add zod validator and seralizer compiler, to be able to validate and change payload before handling the route */
   fastify
      .setValidatorCompiler(validatorCompiler)
      .setSerializerCompiler(serializerCompiler);

   fastify.addHook('onClose', async () => {
      await mongoose.disconnect();
   });

   // CONNECT TO DB
   void (await createConnection(
      env.NODE_ENV === 'production'
         ? (env.PRODUCTION_MONGODB_CONNECTION_URL as string)
         : env.MONGODB_CONNECTION_URL
   ));

   // This loads all plugins defined in routes
   // define your routes in one of these

   void fastify.register(AutoLoad, {
      dir: join(__dirname, 'plugins'),
      options: opts
   });

   void fastify.register(AutoLoad, {
      dir: join(__dirname, 'routes'),
      options: opts,
      indexPattern: /^.*routes(?:\.ts|\.js|\.cjs|\.mjs)$/
   });

   config();
};

process.on('uncaughtException', (err) => {
   console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
   console.error('Unhandled Rejection:', reason);
});

export default app;
export { app, options };
