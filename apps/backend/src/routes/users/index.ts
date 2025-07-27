import { UsersSchemas } from '@pollimate/schemas/routes';
import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { UsersControllers } from '../../controllers';

const root: FastifyPluginAsyncZod = async (fastify, opts) => {
   fastify.route({
      url: '/',
      method: 'PUT',
      schema: UsersSchemas.edit,
      handler: UsersControllers.edit
   });
   fastify.route({
      url: '/',
      method: 'GET',
      schema: UsersSchemas.get,
      handler: UsersControllers.get
   });
   fastify.route({
      method: 'GET',
      url: '/logout',
      schema: UsersSchemas.logout,
      handler: UsersControllers.logout
   });
   fastify.route({
      url: '/profile-picture',
      method: 'PUT',
      schema: UsersSchemas.edit,
      handler: UsersControllers.edit
   });
   fastify.route({
      url: '/logged-in',
      method: 'GET',
      schema: UsersSchemas['logged-in'],
      handler: UsersControllers['logged-in']
   });
};

export default root;
