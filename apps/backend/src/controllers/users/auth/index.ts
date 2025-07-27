import { UsersAuthSchemas } from '@pollimate/schemas/routes';
import { hash, verify } from 'argon2';
import { randomUUID } from 'crypto';
import { FastifyInstance } from 'fastify';
import { LoginTicket, OAuth2Client, TokenPayload } from 'google-auth-library';
import { users } from '../../../db';
import { makeController } from '../../../lib/controller-handler';
import env from '../../../lib/env';
import { createHttpError } from '../../../lib/errors';
import { createOrg } from '../../../lib/organizations';

export * from './magic-code';

const client = new OAuth2Client();

export const UsersAuthControllers = {
   register: makeController(async function (
      this: FastifyInstance,
      request,
      reply
   ) {
      const { email, password, name } = request.body;
      if (await users.exists({ email })) {
         throw createHttpError({
            error: 'User already exists',
            message:
               'The specified email address is already associated with an existing account.',
            statusCode: 400
         });
      }
      let user;
      try {
         user = await users.create({
            id: randomUUID(),
            email,
            password: await hash(password),
            name,
            createdAt: new Date()
         });
         await createOrg({
            uid: user.id,
            id: 'personal',
            profile: {
               description:
                  'Personal organization that you can use straight out of the box!',
               name: 'Personal'
            }
         });
      } catch (error) {
         throw createHttpError({
            error: 'User registration failed',
            message: (error as Error).message,
            statusCode: 500
         });
      }

      this?.issueJWT(reply, user);
      return {
         message: 'Successfully created an account.',
         user
      };
   }, UsersAuthSchemas.register),

   login: makeController(async function (
      this: FastifyInstance,
      request,
      reply
   ) {
      const { email, password } = request.body;
      let user;
      try {
         user = await users.findOne({ email });
      } catch (error) {
         throw createHttpError({
            error: 'Database error',
            message: (error as Error).message,
            statusCode: 500
         });
      }
      if (!user || !user.password || !(await verify(user.password, password))) {
         throw createHttpError({
            error: 'Incorrect password or email',
            message: 'Either the email or password does not exist.',
            statusCode: 400
         });
      }
      this.issueJWT(reply, user);
      return {
         message: 'Successfully logged into your account.',
         user
      };
   }, UsersAuthSchemas.login),
   googleCallback: makeController(async function (
      this: FastifyInstance,
      request,
      reply
   ) {
      let ticket: LoginTicket | undefined;
      let payload: TokenPayload | undefined;

      try {
         ticket = await client.verifyIdToken({
            idToken: request.body.credential,
            audience: [env.GOOGLE_CLIENT_ID]
         });
         payload = ticket?.getPayload();
      } catch (err) {
         throw createHttpError({
            error: 'Google ID token verification failed',
            message: 'An error occurred while verifying the Google ID token.',
            statusCode: 500
         });
      }
      if (!ticket || !payload) {
         throw createHttpError({
            error: 'Invalid Google ID token',
            message: 'The provided Google ID token is invalid or expired.',
            statusCode: 400
         });
      }
      let user = await users.findOne({ email: payload.email });
      if (!user) {
         try {
            user = await users.create({
               id: randomUUID(),
               email: payload.email,
               name: payload.name,
               profilePicture: payload.picture,
               createdAt: new Date()
            });
            await createOrg({
               uid: user.id,
               id: 'personal',
               profile: {
                  description:
                     'Personal organization that you can use straight out of the box!',
                  name: 'Personal'
               }
            });
         } catch (error) {
            throw createHttpError({
               error: 'User creation failed',
               message: (error as Error).message,
               statusCode: 500
            });
         }
      }
      if (!user) {
         throw createHttpError({
            error: 'User not found',
            message: 'No user found after Google authentication.',
            statusCode: 401
         });
      }
      this.issueJWT(reply, user);
      return {
         message: 'User authenticated successfully',
         user
      };
   }, UsersAuthSchemas.googleCallback)
};
