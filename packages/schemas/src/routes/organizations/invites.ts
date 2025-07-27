import z from 'zod';
import { InviteSchema } from '../../db';

export const OrganizationsInvitesSchemas = {
   create: {
      body: z.object({
         invites: InviteSchema.omit({
            organization: true,
            inviter: true
         }).array()
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
   delete: {
      params: z.object({
         organization: z.string(),
         invite: z.email()
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
         invite: z.email()
      }),

      body: InviteSchema.pick({
         role: true
      }).partial(),

      response: {
         200: z.object({
            message: z.string(),
            invite: InviteSchema
         })
      }
   },
   get: {
      params: z.object({
         organization: z.string(),
         invite: z.email()
      }),

      response: {
         200: z.object({
            message: z.string(),
            invite: InviteSchema
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
            invites: InviteSchema.array().default([])
         })
      }
   }
};
