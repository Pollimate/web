import { UsersPasswordsSchemas } from '@pollimate/schemas/routes';
import { hash, verify } from 'argon2';
import { UserDoc, users } from '../../db';
import { makeController } from '../../lib/controller-handler';
import { createHttpError } from '../../lib/errors';
import { authorized } from '../../lib/user';

export const UsersPasswordsControllers = {
   edit: makeController(async (request, reply) => {
      let user = authorized(request.user);
      const { password, confirmPassword, existingPassword } = request.body;
      if (password !== confirmPassword) {
         throw createHttpError({
            error: 'Passwords do not match',
            message: 'The passwords do not match.',
            statusCode: 400
         });
      }
      if (
         typeof existingPassword !== 'undefined' &&
         typeof user.password !== 'undefined' &&
         (await verify(user.password, existingPassword)) === false
      ) {
         throw createHttpError({
            error: 'Invalid password',
            message: 'The existing password is invalid.',
            statusCode: 401
         });
      }
      user = (await users.findOneAndUpdate(
         { id: user.id },
         { password: await hash(password) },
         { returnDocument: 'after' }
      )) as UserDoc;

      return {
         message: 'Successfully changed the password.',
         user
      };
   }, UsersPasswordsSchemas.edit)
};
