import { OrganizationsMembersSchemas } from '@pollimate/schemas/routes';
import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { OrganizationsMembersControllers } from '../../controllers/organizations';

const root: FastifyPluginAsyncZod = async (fastify, opts) => {
   fastify.route({
      url: '/members/:organization',
      method: 'GET',
      schema: OrganizationsMembersSchemas.list,
      handler: OrganizationsMembersControllers.list
   });
   fastify.route({
      url: '/members/leave/:organization',
      method: 'DELETE',
      schema: OrganizationsMembersSchemas.leave,
      handler: OrganizationsMembersControllers.leave
   });
   fastify.route({
      url: '/members/:organization/:user',
      method: 'GET',
      schema: OrganizationsMembersSchemas.get,
      handler: OrganizationsMembersControllers.get
   });
   fastify.route({
      url: '/members/settings/:organization',
      method: 'PUT',
      schema: OrganizationsMembersSchemas.editSettings,
      handler: OrganizationsMembersControllers.editSettings
   });
   fastify.route({
      url: '/members/:organization/:user',
      method: 'PUT',
      schema: OrganizationsMembersSchemas.edit,
      handler: OrganizationsMembersControllers.edit
   });
   fastify.route({
      url: '/members/:organization/:user',
      method: 'DELETE',
      schema: OrganizationsMembersSchemas.delete,
      handler: OrganizationsMembersControllers.delete
   });
};

export default root;
