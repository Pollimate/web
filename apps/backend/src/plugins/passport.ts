// passport.ts
import passport from '@fastify/passport';
import { Strategy as MagicCodeStrategy } from 'passport-magic-code';

import { randomUUID } from 'crypto';
import fp from 'fastify-plugin';
import jwt from 'jsonwebtoken';

import { FastifyReply } from 'fastify';
import { otps, UserDoc, users } from '../db';
import env from '../lib/env';
import { sendEmail } from '../lib/mail';
import { otpLogin } from '../lib/mail/templatesOld';
import { createOrg } from '../lib/organizations';

export const COOKIE_NAME = 'auth_token';
const JWT_SECRET = env.JWT_SECRET_KEY!;
const aMonthInMs = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

/**
 * This plugins adds passport
 *
 * @see https://github.com/fastify/fastify-passport
 */

export default fp(
   async (fastify) => {
      // Register base passport
      fastify.register(passport.initialize());

      // Register strategies
      passport.use('magic-code', magicCode);

      // JWT Auth Middleware: Decode cookie on every request and attach `request.user`
      fastify.addHook('onRequest', async (request) => {
         const token = request.cookies?.[COOKIE_NAME];
         if (!token) return;

         try {
            const payload = jwt.verify(token, JWT_SECRET) as { id: string };
            const user = await users.findOne({ id: payload.id });

            if (user) {
               request.user = user;
            }
         } catch {
            console.log(token);
            // Invalid or expired token
         }
      });

      // Issue JWT token cookie after login
      const issueJWT = (reply: FastifyReply, user: UserDoc) => {
         const token = jwt.sign({ id: user.id }, JWT_SECRET, {
            expiresIn: '180d' // Token expires in 6 months
         });

         reply.setCookie(COOKIE_NAME, token, {
            path: '/',
            secure: true,
            domain:
               env.NODE_ENV === 'production' ? env.CLIENT_DOMAIN : undefined,
            sameSite: 'none',
            maxAge: aMonthInMs / 1000
         });
         return;
      };

      // Attach to fastify so routes can use it
      fastify.decorate('issueJWT', issueJWT);
   },
   {
      name: 'passport-jwt',
      dependencies: ['cookie', 'secure-session'] // make sure cookie plugin is registered
   }
);

// All strategies stay unchanged (except for minor improvements below)

export const magicCode = new MagicCodeStrategy(
   {
      secret: env.MAGIC_CODE_SECRET,
      codeLength: 8,
      userPrimaryKey: 'email',
      codeField: 'code',
      expiresIn: 23,
      storage: {
         codes: {},
         set: async (key, value) => {
            return void (await otps.create({
               code: key,
               value
            }));
         },
         get: async (key) => {
            return (
               await otps.findOne({
                  code: key
               })
            )?.value;
         },
         delete: async (key) => {
            return void otps.deleteOne({
               code: key
            });
         }
      }
   },
   async ({ email, ...user }: any, code: any, { action }: any) => {
      const dbUser = await users
         .findOne({
            email
         })
         .lean();
      const name = user.name || dbUser?.name;

      if (action === 'login' && !(await users.exists({ email }))) {
         /*       return {
        error: "User not found",
        message:
          "The specified email address is not associated with any existing account.",
        statusCode: 404,
      }; */

         return; // Do nothing for security reasons.
      }

      if (action === 'register' && (dbUser || Object.keys(user).length < 1)) {
         return {
            error: 'User already exists',
            message:
               'The specified email address is already associated with any existing account.',
            statusCode: 404
         };
      }

      console.log(code);

      void sendEmail({
         to: email,
         subject: `${env.NAME} - One time password`,
         html: otpLogin(code, name)
      }).catch((e) => console.log('Failed to send mail. '));

      return;
   },
   async ({ email, ...user }: any) => {
      const existingUser = await users.findOne({ email });

      if (!existingUser) {
         user = await users.create({
            createdAt: new Date(),
            email,
            id: randomUUID(),
            /* All of those are validated by the route in and of itself */
            ...user
         });

         void (await createOrg({
            uid: user.id,
            id: 'personal',
            profile: {
               description:
                  'Personal organization that you can use straight out of the box!',
               name: 'Personal'
            }
         }));
      } else {
         user = existingUser;
      }

      return user;
   }
);
