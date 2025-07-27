import { UserDoc } from '../db';
import { Environment } from '../lib/env';

export interface IProcessEnv {}

declare global {
   namespace NodeJS {
      interface ProcessEnv extends Environment {}
   }
}
declare module 'fastify' {
   interface FastifyRequest {
      user?: UserDoc | undefined;
   }
   interface FastifyInstance {
      issueJWT(reply: FastifyReply, user: UserDoc): void;
   }
}

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export {};
