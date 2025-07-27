import cookie, { FastifyCookieOptions } from '@fastify/cookie';
import fp from 'fastify-plugin';
import env from '../lib/env';

/**
 * This plugins adds cookie session functionality
 *
 * @see https://github.com/fastify/fastify-cookie
 */

export default fp<FastifyCookieOptions>(
   async (fastify) => {
      fastify.register(cookie, {
         secret: env.COOKIE_SECRET,
         parseOptions: {
            secure: true
         }
      });
   },
   {
      name: 'cookie'
   }
);
