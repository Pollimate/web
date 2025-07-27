import z from 'zod';
import { ExtendedInviteSchema } from '../db';

export const InvitesSchemas = {
   get: {
      params: z.object({
         organization: z.string()
      }),
      response: {
         200: z.object({
            message: z.string(),
            invite: ExtendedInviteSchema
         })
      }
   },
   join: {
      params: z.object({
         organization: z.string()
      }),

      response: {
         200: z.object({
            message: z.string()
         })
      }
   },
   overview: {
      response: {
         200: z.object({
            message: z.string(),
            invites: ExtendedInviteSchema.array()
         })
      }
   },
   reject: {
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
