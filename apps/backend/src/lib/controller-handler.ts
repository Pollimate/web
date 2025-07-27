import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

type MaybeInfer<T> = T extends z.ZodTypeAny ? z.infer<T> : unknown;

type SchemaInput = {
   body?: z.ZodTypeAny;
   querystring?: z.ZodTypeAny;
   params?: z.ZodTypeAny;
   headers?: z.ZodTypeAny;
   response?: Record<number, z.ZodTypeAny>;
};

export type RouteTypes<T extends SchemaInput> = {
   request: FastifyRequest<{
      Body: MaybeInfer<T['body']>;
      Querystring: MaybeInfer<T['querystring']>;
      Params: MaybeInfer<T['params']>;
      Headers: MaybeInfer<T['headers']>;
   }>;
   reply: FastifyReply & {
      send(payload: InferReply<T>): FastifyReply;
   };
   response: InferReply<T>;
};

type InferReply<T extends SchemaInput> =
   T['response'] extends Record<number, z.ZodTypeAny>
      ? MaybeInfer<T['response'][200]>
      : unknown;
type ControllerHandler<T extends { request: any; reply: any; response: any }> =
   (
      request: T['request'],
      reply: T['reply'],
      fastify?: FastifyInstance
   ) => T['response'] | Promise<T['response']>;

export function makeController<TSchema extends SchemaInput>(
   handler: ControllerHandler<RouteTypes<TSchema>>,
   schema: TSchema
) {
   return handler;
}
