import { verify } from 'jsonwebtoken';
import env from '../env';

export const verifyJwt = (payload: string): unknown | undefined => {
   let result: unknown;
   if (!payload || typeof payload !== 'string') return {};
   try {
      result = verify(payload, env.JWT_SECRET_KEY, {});
   } catch (e) {
      throw e;
   }
   return result || {};
};
