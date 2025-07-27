import { z } from 'zod';
import {
   OrganizationProfileSchema,
   OrganizationRoleSchema
} from './organizations';

export const InviteSchema = z.object({
   email: z.email().toLowerCase(),
   message: z.string().optional(),
   // UUID of person inviting
   inviter: z.uuid(),
   organization: z.string(),
   role: OrganizationRoleSchema,

   createdAt: z.date().default(() => new Date()),
   updatedAt: z.date().default(() => new Date())
});

export type Invite = z.infer<typeof InviteSchema>;

export const ExtendedInviteSchema = InviteSchema.extend({
   inviterEmail: z.email(),
   inviterName: z.string(),
   orgProfile: OrganizationProfileSchema,
   memberAmount: z.number()
});
