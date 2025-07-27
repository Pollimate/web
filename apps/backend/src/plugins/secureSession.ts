import secureSession, {
   SecureSessionPluginOptions
} from '@fastify/secure-session';
import fp from 'fastify-plugin';
import { readFileSync } from 'fs';
import env from '../lib/env';

/**
 * This plugins adds secure session functionality
 *
 * @see https://github.com/fastify/secure-session
 */

export const aMonthInMs = 1000 * 60 * 60 * 24 * 30 * 6;

export default fp<SecureSessionPluginOptions>(
   async (fastify) => {
      fastify.register(secureSession, {
         key: [
            // Any old key (session_secret_1) will be resigned to session_secret_2 after it has been read.
            readFileSync('session_secret')
         ],

         cookie: {
            path: '/',
            secure: true,
            domain:
               env.NODE_ENV === 'production' ? env.CLIENT_DOMAIN : undefined,
            sameSite: 'none',
            partitioned: true,
            maxAge: aMonthInMs / 1000
         }
      });
   },
   {
      name: 'secure-session',
      dependencies: ['cookie']
   }
);
