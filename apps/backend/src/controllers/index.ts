export * from './users';

import { IndexSchemas } from '@pollimate/schemas/routes';
import { version } from '../../package.json';
import { makeController } from '../lib/controller-handler';
import env from '../lib/env';
import { authorized } from '../lib/user';

export const IndexController = {
   get: makeController((request, reply) => {
      return {
         name: env.NAME,
         description: env.DESCRIPTION,
         version: version,
         root: true
      };
   }, IndexSchemas.get),

   example: makeController((request, reply) => {
      void authorized(request.user, 'admin');
      return { message: 'Example route' };
   }, IndexSchemas.example)
};
