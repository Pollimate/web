import { createHttpError } from '../errors';

export const exists = <T = any>(value: T): T => {
   if (typeof value === 'undefined' || value === null)
      throw createHttpError({
         error: 'Resource not found',
         message: 'The specified resource was not found.',
         statusCode: 404
      });

   return value as T;
};
