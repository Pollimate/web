import { JwtPayload, sign, SignOptions } from 'jsonwebtoken';
import env from '../env';

export const signJwt = async (
   payload: JwtPayload,
   options: SignOptions
): Promise<string> => {
   return sign({ payload }, env.JWT_SECRET_KEY, {
      expiresIn: '20 days',
      ...options
   }) satisfies string;
};
