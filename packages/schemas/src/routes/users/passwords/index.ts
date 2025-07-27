import z from 'zod';
import { PasswordSchema, UserSchema } from '../../../db';

export const UsersPasswordsSchemas = {
   edit: {
      body: z.object({
         password: PasswordSchema,
         confirmPassword: PasswordSchema,
         existingPassword: PasswordSchema.optional()
      }),
      response: {
         200: z.object({
            message: z.string(),
            user: UserSchema.omit({ password: true })
         })
      }
   }
};
