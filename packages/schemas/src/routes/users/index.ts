import z from 'zod';
import { PublicUserSchema } from '../../db';

export const UsersSchemas = {
   edit: {
      body: z.object({
         user: PublicUserSchema.pick({
            name: true,
            settings: true,
            address: true
         })
      }),
      response: {
         200: z.object({
            message: z.string(),
            user: PublicUserSchema
         })
      }
   },
   get: {
      response: {
         200: z.object({
            message: z.string(),
            user: PublicUserSchema
         })
      }
   },
   'logged-in': {},
   logout: {
      response: {
         200: z.object({
            message: z.string()
         })
      }
   },
   editProfilePicture: {
      response: {
         200: z.object({
            message: z.string(),
            url: z.url().optional()
         })
      }
   }
};

export * from './auth';
export * from './passwords';
