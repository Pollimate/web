import z from 'zod';
import { PasswordSchema, PublicUserSchema } from '../../../db';

export const UsersAuthSchemas = {
   register: {
      body: z.object({
         email: z.email().toLowerCase(),
         password: PasswordSchema,
         name: z.string()
      }),
      response: {
         200: z.object({
            message: z.string(),
            user: PublicUserSchema
         })
      }
   },
   login: {
      body: z.object({
         email: z.email().toLowerCase(),
         password: PasswordSchema
      }),
      response: {
         200: z.object({
            message: z.string(),
            user: PublicUserSchema
         })
      }
   },
   googleCallback: {
      body: z.object({
         credential: z.string()
      }),
      response: {
         200: z.object({
            message: z.string(),
            user: PublicUserSchema
         })
      }
   }
};

export * from './magic-code';
