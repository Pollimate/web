import { UsersSchemas } from '@pollimate/schemas/routes';
import { randomUUID } from 'node:crypto';
import { createWriteStream } from 'node:fs';
import { users } from '../../db';
import { makeController } from '../../lib/controller-handler';
import env from '../../lib/env';
import { createHttpError } from '../../lib/errors';
import { pump } from '../../lib/files';
import { flattenObject } from '../../lib/index';
import { authorized } from '../../lib/user';
import { COOKIE_NAME } from '../../plugins/passport';

export * from './auth';
export * from './passwords';

export const UsersControllers = {
   edit: makeController(async (request, reply) => {
      let user = authorized(request.user);
      const body = request.body.user;
      let updatedUser;
      try {
         updatedUser = await users.findOneAndUpdate(
            { _id: user._id },
            { $set: flattenObject(body) },
            { returnDocument: 'after' }
         );
      } catch (error) {
         throw createHttpError({
            error: 'User update failed',
            message: (error as Error).message,
            statusCode: 500
         });
      }
      if (!updatedUser) {
         throw createHttpError({
            error: 'User not found',
            message: 'This user does not exist.',
            statusCode: 404
         });
      }
      return {
         message: 'Successfully updated the user.',
         user: updatedUser
      };
   }, UsersSchemas.edit),
   get: makeController(async (request, reply) => {
      // No risky operations, so no try/catch needed
      const user = authorized(request.user);
      return {
         message: 'Successfully retrieved the user.',
         user
      };
   }, UsersSchemas.get),
   'logged-in': makeController(async (request, reply) => {
      if (request?.user) return {};
      reply.code(401);
      return;
   }, UsersSchemas['logged-in']),
   logout: makeController(async (request, reply) => {
      void authorized(request?.user);
      reply.clearCookie(COOKIE_NAME);
      return {
         message: 'Successfully logged out.'
      };
   }, UsersSchemas.logout),
   editProfilePicture: makeController(async (request, reply) => {
      const user = authorized(request.user);
      const parts = await request.files();

      let filepath: string | undefined = '';

      for await (const part of parts) {
         if (part.fieldname === 'profilePicture' && part.file) {
            filepath = `${env.FILE_LOCATION}/${user.id}-${randomUUID()}.${part.filename.split('.').pop()}`;
            await pump(part.file, createWriteStream(filepath));
         }
      }
      const updatedUser = await users.findOneAndUpdate(
         { _id: user._id },
         { $set: { profilePicture: filepath || undefined } },
         { returnDocument: 'after' }
      );

      if (!updatedUser) {
         throw createHttpError({
            error: 'User not found',
            message: 'This user does not exist.',
            statusCode: 404
         });
      }
      return {
         message: 'Successfully uploaded the file.',
         url: filepath,
         user: updatedUser
      };
   }, UsersSchemas.editProfilePicture)
};
