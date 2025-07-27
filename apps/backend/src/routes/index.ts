import { IndexSchemas } from '@pollimate/schemas/routes';
import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { IndexController } from '../controllers';

const root: FastifyPluginAsyncZod = async (fastify, opts) => {
   fastify.route({
      url: '/',
      method: 'GET',
      schema: IndexSchemas.get,
      handler: IndexController.get
   });
   fastify.route({
      url: '/example',
      method: 'GET',
      schema: IndexSchemas.example,
      handler: IndexController.example
   });
};

export default root;
