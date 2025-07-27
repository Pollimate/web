import multipart, { FastifyMultipartOptions } from '@fastify/multipart';
import fp from 'fastify-plugin';

/**
 * This plugins adds support for file uploads and multipart/form-data handling.
 *
 * @see https://github.com/fastify/fastify-multipart
 */
export default fp<FastifyMultipartOptions>(async (fastify) => {
   fastify.register(multipart);
});
