import z from 'zod';
import { PublicUserSchema } from '../../../../db';

export const UsersAuthMagicCodeSchemas = {
   callback: {
      response: {
         200: z.object({
            message: z.string(),
            user: PublicUserSchema
         })
      }
   },
   login: {
      body: z.object({
         email: z.email().toLowerCase()
      })
   },
   register: {
      body: z.object({
         email: z.email().toLowerCase(),
         name: z.string()
      })
   }
};
