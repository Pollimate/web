import cors, { FastifyCorsOptions } from '@fastify/cors';
import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import env from '../lib/env';

/**
 * This plugins adds cookie session functionality
 *
 * @see https://github.com/fastify/fastify-cors
 */

export default fp<FastifyCorsOptions>(async (fastify: FastifyInstance) => {
   fastify.register(cors, {
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'], // Include DELETE here

      origin: (origin, cb) => {
         if (!origin) {
            cb(null, true);

            return;
         }

         const hostname = new URL(origin).hostname;

         if (env.NODE_ENV !== 'production')
            if (hostname === 'localhost') {
               //  Request from localhost will pass
               cb(null, true);
               return;
            }

         /*     if (hostname === "enjautomation.com") {
          cb(null, true);
          return;
        }

        if (hostname.endsWith(".enjautomation.com")) {
          cb(null, true);
          return;
        } */

         cb(null, true);
      },

      credentials: true
   });
});
