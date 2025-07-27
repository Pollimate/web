import { z } from 'zod';

/* IMPORTANT ORDER! THE FIRST ONE OF THOSE IS THE DEFAULT ROLE. DO NOT CHANGE */
export const UserRoles = ['user', 'admin'] as const;

export const RoleSchema = z.enum(UserRoles).default(UserRoles[0]);
export type Role = z.infer<typeof RoleSchema>;

export const PasswordSchema = z.string().min(6);

export const UserSchema = z.object({
   id: z.uuid(),
   email: z.email(),

   name: z.string().optional(),
   username: z.string().optional(),
   birthyear: z.number().optional(),

   address: z
      .object({
         street: z.string(),
         city: z.string(),
         state: z.string(),
         zipCode: z.string(),
         country: z.string()
      })
      .partial()
      .optional(),
   settings: z
      .object({
         notifications: z
            .object({
               email: z.boolean().default(false)
            })
            .partial()
            .optional()
      })
      .partial()
      .optional(),

   password: PasswordSchema.optional(),

   // URL
   profilePicture: z.string().optional(),

   createdAt: z.date(),
   updatedAt: z.date().optional(),

   role: RoleSchema
});

export const PublicUserSchema = UserSchema.omit({ password: true });

export type User = z.infer<typeof UserSchema>;
