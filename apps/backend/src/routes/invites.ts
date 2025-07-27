// INFO
import { InvitesSchemas } from '@pollimate/schemas/routes';
import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import z from 'zod';
import { InvitesControllers } from '../controllers/invites';
import { InviteSchema, OrganizationProfileSchema } from '../db';

const ExtendedInviteSchema = InviteSchema.extend({
   inviterEmail: z.email(),
   inviterName: z.string(),
   orgProfile: OrganizationProfileSchema,
   memberAmount: z.number()
});

export const GetSchema = {
   params: z.object({
      organization: z.string()
   }),
   response: {
      200: z.object({
         message: z.string(),
         invite: ExtendedInviteSchema
      })
   }
};

/* 
    Gets all invites
*/
const root: FastifyPluginAsyncZod = async (fastify, opts) => {
   fastify.route({
      url: '/invites/:organization',
      method: 'GET',
      schema: InvitesSchemas.get,
      handler: InvitesControllers.get
   });

   fastify.route({
      url: '/invites/:organization',
      method: 'PUT',
      schema: InvitesSchemas.join,
      handler: InvitesControllers.join
   });

   fastify.route({
      url: '/invites/overview',
      method: 'GET',
      schema: InvitesSchemas.overview,
      handler: InvitesControllers.overview
   });

   fastify.route({
      url: '/invites/:organization',
      method: 'DELETE',
      schema: InvitesSchemas.reject,
      handler: InvitesControllers.reject
   });
};

export default root;
