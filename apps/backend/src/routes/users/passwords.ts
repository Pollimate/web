import { UsersPasswordsSchemas } from '@pollimate/schemas/routes';
import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { UsersPasswordsControllers } from '../../controllers';

const root: FastifyPluginAsyncZod = async (fastify, opts) => {
   fastify.route({
      url: '/passwords',
      method: 'PUT',
      schema: UsersPasswordsSchemas.edit,
      handler: UsersPasswordsControllers.edit
   });
};

export default root;
