import z from 'zod';
import { RoleSchema } from '../../db';

export const AdminSchemas = {
   editRole: {
      params: z.object({
         email: z.email()
      }),
      body: z.object({
         role: RoleSchema
      }),
      response: {
         200: z.object({
            message: z.string()
         })
      }
   }
};
