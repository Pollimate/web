import formbody, { FastifyFormbodyOptions } from '@fastify/formbody';
import fp from 'fastify-plugin';

/**
 * This plugins adds support for formbody www-url-encoded data
 *
 * @see https://github.com/fastify/fastify-formbody
 */
export default fp<FastifyFormbodyOptions>(async (fastify) => {
   fastify.register(formbody, {});
});
