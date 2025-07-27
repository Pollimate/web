import { FastifyError } from 'fastify';

export interface AppError {
   error: string;
   message: string;
   statusCode: number;
}

export function createHttpError({
   error,
   message,
   statusCode
}: AppError): AppError & FastifyError {
   // This can be extended to use fastify.httpErrors if available in context
   const err: any = new Error(message);
   err.error = error;
   err.message = message;
   err.statusCode = statusCode;
   err.name = error;
   return err;
}
