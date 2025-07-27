import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import fp from 'fastify-plugin';
import { jsonSchemaTransform } from 'fastify-type-provider-zod';

/**
 * This plugins adds swagger
 *
 * @see https://github.com/fastify/fastify-swagger
 */

export default fp(async (fastify) => {
   fastify.register(fastifySwagger, {
      openapi: {
         info: {
            title: 'pollimate',
            description: 'pollimate',
            version: '1.0.0'
         },
         servers: [
            {
               url: 'http://localhost:8000',
               description: 'Development server'
            }
         ],
         components: {
            securitySchemes: {
               apikey: {
                  type: 'apiKey',
                  in: 'cookie',
                  name: 'session'
               }
            }
         }
      },
      transform: jsonSchemaTransform

      // You can also create transform with custom skiplist of endpoints that should not be included in the specification:
      //
      // transform: createJsonSchemaTransform({
      //   skipList: [ '/documentation/static/*' ]
      // })
   });

   fastify.register(fastifySwaggerUI, {
      routePrefix: '/documentation'
   });
});
