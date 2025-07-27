import { UsersAuthMagicCodeSchemas } from '@pollimate/schemas/routes';
import { FastifyInstance } from 'fastify';
import { makeController } from '../../../../lib/controller-handler';
import { createHttpError } from '../../../../lib/errors';

export const UsersAuthMagicCodeControllers = {
   register: makeController(async (request, reply) => {
      return {
         message: 'The code has been successfully sent to your email address.'
      };
   }, UsersAuthMagicCodeSchemas.register),
   login: makeController(async (request, reply) => {
      return {
         message: 'The code has been successfully sent to your email address.'
      };
   }, UsersAuthMagicCodeSchemas.login),
   callback: makeController(async function (
      this: FastifyInstance,
      request,
      reply
   ) {
      if (!request?.user) {
         throw createHttpError({
            error: 'User not found',
            message: 'No user found after authentication.',
            statusCode: 401
         });
      }
      this.issueJWT(reply, request.user);
      return {
         message: 'Successfully logged into your account.',
         user: request.user
      };
   }, UsersAuthMagicCodeSchemas.callback)
};
