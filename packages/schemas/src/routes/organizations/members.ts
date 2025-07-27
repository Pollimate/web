import z from 'zod';
import {
   MemberSchema,
   MemberSettingsSchema,
   OrganizationRoleSchema,
   PublicOrganizationSchema,
   UserSchema
} from '../../db';

export const OrganizationsMembersSchemas = {
   delete: {
      params: z.object({
         organization: z.string(),
         user: z.email()
      }),

      response: {
         200: z.object({
            message: z.string()
         })
      }
   },
   edit: {
      params: z.object({
         organization: z.string(),
         user: z.uuid()
      }),

      body: z
         .object({
            role: OrganizationRoleSchema,
            seat: z.boolean().optional()
         })
         .partial(),

      response: {
         200: z.object({
            message: z.string(),
            organization: PublicOrganizationSchema
         })
      }
   },
   get: {
      params: z.object({
         organization: z.string(),
         user: z.uuid()
      }),

      response: {
         200: z.object({
            message: z.string(),
            member: UserSchema.pick({
               name: true,
               email: true,
               id: true
            }).extend({
               role: OrganizationRoleSchema
            })
         })
      }
   },
   leave: {
      params: z.object({
         organization: z.string()
      }),
      response: {
         200: z.object({
            message: z.string()
         })
      }
   },
   list: {
      params: z.object({
         organization: z.string()
      }),

      response: {
         200: z.object({
            message: z.string(),
            members: UserSchema.pick({
               name: true,
               email: true,
               id: true
            })
               .extend(
                  MemberSchema.pick({
                     role: true,
                     seat: true
                  }).shape
               )
               .array()
         })
      }
   },
   editSettings: {
      body: z.object({
         settings: MemberSettingsSchema.partial()
      }),
      params: z.object({
         organization: z.string()
      }),

      response: {
         200: z.object({
            message: z.string(),
            organization: PublicOrganizationSchema
         })
      }
   }
};
