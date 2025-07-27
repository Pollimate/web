import { OrganizationsSchemas } from '@pollimate/schemas/routes';
import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { OrganizationsControllers } from '../../controllers/organizations';

const root: FastifyPluginAsyncZod = async (fastify, opts) => {
   fastify.route({
      url: '/seats/request/:organization',
      method: 'POST',
      schema: OrganizationsSchemas.requestSeat,
      handler: OrganizationsControllers.requestSeat
   });
   fastify.route({
      url: '/settings/:organization',
      method: 'PUT',
      schema: OrganizationsSchemas.editSettings,
      handler: OrganizationsControllers.editSettings
   });
   fastify.route({
      url: '/',
      method: 'POST',
      schema: OrganizationsSchemas.create,
      handler: OrganizationsControllers.create
   });
   fastify.route({
      url: '/:organization',
      method: 'DELETE',
      schema: OrganizationsSchemas.delete,
      handler: OrganizationsControllers.delete
   });
   fastify.route({
      url: '/:organization',
      method: 'PUT',
      schema: OrganizationsSchemas.edit,
      handler: OrganizationsControllers.edit
   });
   fastify.route({
      url: '/:organization',
      method: 'GET',
      schema: OrganizationsSchemas.get,
      handler: OrganizationsControllers.get
   });
   fastify.route({
      url: '/',
      method: 'GET',
      schema: OrganizationsSchemas.list,
      handler: OrganizationsControllers.list
   });
   fastify.route({
      url: '/preview/:organization',
      method: 'GET',
      schema: OrganizationsSchemas.preview,
      handler: OrganizationsControllers.preview
   });
   fastify.route({
      url: '/quicklist',
      method: 'GET',
      schema: OrganizationsSchemas.quicklist,
      handler: OrganizationsControllers.quicklist
   });
};

export default root;
