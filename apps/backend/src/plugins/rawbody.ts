import fp from 'fastify-plugin';
import rawbody from 'fastify-raw-body';

/**
 * This plugins adds support for raw body
 *
 * @see https://github.com/fastify/fastify-raw-body
 */
export default fp(async (fastify) => {
   fastify.register(rawbody, {
      field: 'rawBody',
      global: false, // add the rawBody to every request. **Default true**
      encoding: 'utf8', // set it to false to set rawBody as a Buffer **Default utf8**
      runFirst: true, // get the body before any preParsing hook change/uncompress it. **Default false**
      routes: [], // array of routes, **`global`** will be ignored, wildcard routes not supported
      jsonContentTypes: [] // array of content-types to handle as JSON. **Default ['application/json']**
   });
});
