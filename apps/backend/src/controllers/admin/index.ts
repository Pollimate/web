import { AdminSchemas } from '@pollimate/schemas/routes';
import { flattenObject } from '../../lib';
import { makeController } from '../../lib/controller-handler';
import { authorized, getUser } from '../../lib/user';

export const AdminControllers = {
   editRole: makeController(async (request, reply) => {
      void authorized(request.user, 'admin');

      const { email } = request.params;

      await getUser({
         email,
         update: flattenObject(request.body)
      });

      return {
         message: `Successfully updated ${email}'s role to ${request.body.role}.`
      };
   }, AdminSchemas.editRole)
};
