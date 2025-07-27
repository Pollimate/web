import { UsersAuthSchemas } from '@pollimate/schemas/routes';
import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { UsersAuthControllers } from '../../../controllers';

const plugin: FastifyPluginAsyncZod = async (fastify, _opts) => {
   fastify.route({
      method: 'POST',
      url: '/register',
      schema: UsersAuthSchemas.register,
      handler: UsersAuthControllers.register
   });
   fastify.route({
      method: 'POST',
      url: '/login',
      schema: UsersAuthSchemas.login,
      handler: UsersAuthControllers.login
   });
   fastify.route({
      method: 'POST',
      url: '/google/callback',
      schema: UsersAuthSchemas.googleCallback,
      handler: UsersAuthControllers.googleCallback
   });
};

export default plugin;
