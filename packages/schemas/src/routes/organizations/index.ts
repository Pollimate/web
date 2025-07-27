import z from 'zod';
import {
   MemberSchema,
   OrganizationProfileSchema,
   OrganizationRoleSchema,
   OrganizationSchema,
   OrganizationSettingsSchema,
   PublicOrganizationSchema,
   UserSchema
} from '../../db';

export * from './invites';
export * from './members';

export const OrganizationsSchemas = {
   create: {
      body: OrganizationSchema.pick({
         profile: true
      }).extend({
         id: z
            .string()
            .transform((val) => {
               const res = val
                  .trim()
                  .replace(/[^a-zA-Z0-9]/g, '-')
                  .toLowerCase();
               return res;
            })
            .optional()
      }),
      response: {
         200: z.object({
            message: z.string(),
            organization: PublicOrganizationSchema
         })
      }
   },
   delete: {
      body: z.object({
         id: OrganizationSchema.shape.id
      }),
      params: z.object({
         organization: z.string()
      }),

      response: {
         200: z.object({
            message: z.string()
         })
      }
   },
   edit: {
      body: z
         .object({
            profile: OrganizationProfileSchema.partial()
         })
         .partial(),

      params: z.object({
         organization: z.string()
      }),

      response: {
         200: z.object({
            message: z.string(),
            organization: PublicOrganizationSchema
         })
      }
   },
   list: {
      response: {
         200: z.object({
            message: z.string(),
            organizations: PublicOrganizationSchema.extend({
               role: OrganizationRoleSchema
            }).array()
         })
      }
   },
   get: {
      params: z.object({
         organization: z.string()
      }),

      response: {
         200: z.object({
            message: z.string(),
            organization: PublicOrganizationSchema.extend({
               members: UserSchema.pick({
                  id: true,
                  email: true,
                  name: true
               })
                  .extend({
                     ...MemberSchema.omit({
                        uid: true
                     }).shape
                  })
                  .array(),
               role: OrganizationRoleSchema,
               seats: z.object({
                  used: z.number()
               })
            })
         })
      }
   },
   preview: {
      params: z.object({
         organization: z.string()
      }),

      response: {
         200: z.object({
            message: z.string(),
            organization: PublicOrganizationSchema.extend({
               members: UserSchema.pick({
                  id: true,
                  email: true,
                  name: true
               })
                  .extend({
                     ...MemberSchema.omit({
                        uid: true
                     }).shape
                  })
                  .array()
            }).extend({
               seats: z.object({
                  used: z.number()
               }),
               hasSeat: z.boolean()
            })
         })
      }
   },
   quicklist: {
      response: {
         200: z.object({
            message: z.string(),
            organizations: OrganizationSchema.pick({
               id: true
            })
               .extend({
                  role: OrganizationRoleSchema,
                  name: z.string(),
                  memberAmount: z.number()
               })
               .array()
         })
      }
   },
   editSettings: {
      body: z
         .object({
            settings: OrganizationSettingsSchema
         })
         .partial(),

      params: z.object({
         organization: z.string()
      }),
      response: {
         200: z.object({
            message: z.string(),
            organization: PublicOrganizationSchema
         })
      }
   },
   requestSeat: {
      body: z.object({
         message: z.string().optional()
      }),
      params: z.object({
         organization: z.string()
      }),
      response: {
         200: z.object({
            message: z.string()
         })
      }
   }
};
