import { z } from 'zod';

/* IMPORTANT ORDER! THE FIRST ONE OF THOSE IS THE DEFAULT ROLE. DO NOT CHANGE */
export const OrganizationRoles = ['member', 'owner', 'manager'] as const;

export const OrganizationRoleSchema = z
   .enum(OrganizationRoles)
   .default(OrganizationRoles[0]); // Visitor is basically a user that is not paying

export const OrganizationProfileSchema = z.object({
   name: z.string(),
   description: z.string().default('').optional(),
   color: z.string().optional(),
   logo: z.url().optional()
});

export const MemberSettingsSchema = z.object({}).partial();

export const MemberSchema = z.object({
   uid: z.uuid(),
   role: OrganizationRoleSchema,
   settings: MemberSettingsSchema.default({}).optional(),
   seat: z.boolean().default(true),
   requestSeatMessage: z.string().optional(),
   requestedSeat: z.boolean().optional()
});

export const OrganizationSettingsSchema = z.object({});

export const OrganizationSchema = z.object({
   id: z.string(),

   members: MemberSchema.array().default([]),

   profile: OrganizationProfileSchema,
   settings: OrganizationSettingsSchema,

   createdAt: z.date().default(new Date()),
   updatedAt: z.date().optional()
});

// Add sensitive keys here in the future
export const PublicOrganizationSchema = OrganizationSchema.omit({});

export type Member = z.infer<typeof MemberSchema>;
export type OrganizationRole = z.infer<typeof OrganizationRoleSchema>;
export type OrganizationSettings = z.infer<typeof OrganizationSettingsSchema>;
export type Organization = z.infer<typeof OrganizationSchema>;
