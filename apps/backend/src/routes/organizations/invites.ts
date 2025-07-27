import { OrganizationsInvitesSchemas } from '@pollimate/schemas/routes';
import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { OrganizationsInvitesControllers } from '../../controllers/organizations';

const root: FastifyPluginAsyncZod = async (fastify, opts) => {
   fastify.route({
      url: '/invites/:organization',
      method: 'GET',
      schema: OrganizationsInvitesSchemas.list,
      handler: OrganizationsInvitesControllers.list
   });
   fastify.route({
      url: '/invites/:organization/:invite',
      method: 'GET',
      schema: OrganizationsInvitesSchemas.get,
      handler: OrganizationsInvitesControllers.get
   });
   fastify.route({
      url: '/invites/:organization/:invite',
      method: 'PUT',
      schema: OrganizationsInvitesSchemas.edit,
      handler: OrganizationsInvitesControllers.edit
   });
   fastify.route({
      url: '/invites/:organization/:invite',
      method: 'DELETE',
      schema: OrganizationsInvitesSchemas.delete,
      handler: OrganizationsInvitesControllers.delete
   });
   fastify.route({
      url: '/invites/:organization',
      method: 'POST',
      schema: OrganizationsInvitesSchemas.create,
      handler: OrganizationsInvitesControllers.create
   });
};

export default root;
