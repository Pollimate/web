import { AdminSchemas } from '@pollimate/schemas/routes';
import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { AdminControllers } from '../../controllers/admin';

const root: FastifyPluginAsyncZod = async (fastify, opts) => {
   fastify.route({
      url: '/roles/:email',
      method: 'PUT',
      schema: AdminSchemas.editRole,
      handler: AdminControllers.editRole
   });
};

export default root;
