import passport from '@fastify/passport';
import { UsersAuthMagicCodeSchemas } from '@pollimate/schemas/routes';
import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { UsersAuthMagicCodeControllers } from '../../../controllers';

const plugin: FastifyPluginAsyncZod = async (fastify, _opts) => {
   fastify.route({
      method: 'POST',
      url: '/magic-code/login',
      preHandler: passport.authenticate('magic-code', {
         /* @ts-ignore */
         action: 'login',
         session: false
      }),
      schema: UsersAuthMagicCodeSchemas.login,
      handler: UsersAuthMagicCodeControllers.login
   });
   fastify.route({
      method: 'POST',
      url: '/magic-code/register',
      preHandler: passport.authenticate('magic-code', {
         /* @ts-ignore */
         action: 'register',
         session: false
      }),
      schema: UsersAuthMagicCodeSchemas.register,
      handler: UsersAuthMagicCodeControllers.register
   });
   fastify.route({
      method: 'GET',
      url: '/magic-code/callback',
      preHandler: passport.authenticate('magic-code', {
         /* @ts-ignore */
         action: 'callback',
         session: false
      }),
      schema: UsersAuthMagicCodeSchemas.callback,
      handler: UsersAuthMagicCodeControllers.callback
   });
};

export default plugin;
