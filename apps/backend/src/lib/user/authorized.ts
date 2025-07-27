import { Role, UserDoc } from '../../db';
import { createHttpError } from '../errors';

export const authorized = (
   user: UserDoc | undefined | null,
   roles?: Role | Role[]
) => {
   if (!user)
      throw createHttpError({
         error: 'Unauthorized',
         message: 'The user is not logged in to the service.',
         statusCode: 401
      });

   if (
      (typeof roles === 'string' && user.role !== roles) ||
      (roles && !roles?.includes(user.role))
   ) {
      throw createHttpError({
         error: 'Unauthorized',
         message: 'You do not have permissions to access this route.',
         statusCode: 403
      });
   }

   return user;
};
