import { OrganizationsMembersSchemas } from '@pollimate/schemas/routes';
import { OrganizationDoc, organizations, User, users } from '../../db';
import { isDefined } from '../../lib';
import { makeController } from '../../lib/controller-handler';
import { createHttpError } from '../../lib/errors';
import { flattenObject } from '../../lib/index';
import { getOrganization } from '../../lib/organizations';
import { authorized } from '../../lib/user';

export const OrganizationsMembersControllers = {
   list: makeController(async (request, reply) => {
      const user = authorized(request.user);
      const { organization } = request.params;
      const org = await getOrganization({
         id: organization,
         uid: user.id,
         lean: true
      });

      const members = await Promise.all(
         org.members.map(async (member) => {
            return (
               OrganizationsMembersSchemas.list.response[200].shape.members.element.safeParse(
                  {
                     ...((await users
                        .findOne({ id: member.uid })
                        .lean()) as User),
                     ...(member || {})
                  }
               )?.data ?? undefined
            );
         })
      );

      return {
         message: 'Successfully retrieved all members.',
         members: members.filter(isDefined)
      };
   }, OrganizationsMembersSchemas.list),
   leave: makeController(async (request, reply) => {
      const user = authorized(request.user);
      const { organization } = request.params;

      const org = await getOrganization({
         id: organization,
         uid: user.id,
         personalAllowed: false
      });

      const member = org.members.find((member) => member.uid === user.id);

      if (member?.role === 'owner') {
         throw createHttpError({
            error: 'Forbidden',
            message:
               'You are the owner of this organization, you cannot leave it.',
            statusCode: 403
         });
      }

      await organizations.updateOne(
         { id: org.id },
         {
            $pull: {
               members: {
                  uid: user.id,
                  role: { $nin: ['owner'] }
               }
            }
         },
         {
            upsert: false
         }
      );

      return {
         message: 'Successfully left the organization.'
      };
   }, OrganizationsMembersSchemas.leave),
   get: makeController(async (request, reply): Promise<any> => {
      const user = authorized(request.user);

      const { organization, user: memberEmail } = request.params;

      const org = await getOrganization({
         id: organization,
         uid: user.id,
         roles: ['owner', 'manager']
      });

      const member = await users
         .findOne({
            email: memberEmail
         })
         ?.lean();

      if (!member) {
         throw createHttpError({
            error: 'Member not found',
            message: 'The specified member was not found.',
            statusCode: 404
         });
      }

      const orgMember = org.members.find(
         (member) => member.uid === member?.uid
      );

      if (!(orgMember && member)) {
         throw {
            error: 'Member not found',
            message:
               'This member does not exist, or you are not allowed to access this route.',
            statusCode: 404
         };
      }

      return {
         message: 'Successfully retrieved the member.',
         member: {
            ...member,
            ...orgMember
         }
      };
   }, OrganizationsMembersSchemas.get),
   editSettings: makeController(async (request, reply) => {
      const user = authorized(request.user);

      const { organization } = request.params;
      const { settings } = request.body;

      const org = await getOrganization({
         id: organization,
         uid: user.id,
         update: flattenObject({
            'members.$[elem].settings': settings
         }),
         arrayFilters: [{ 'elem.uid': user.id }]
      });

      return {
         message: 'Successfully edited your settings.',
         organization: org
      };
   }, OrganizationsMembersSchemas.editSettings),
   edit: makeController(async (request, reply): Promise<any> => {
      const user = authorized(request.user);

      const { organization, user: memberID } = request.params;

      let org = await getOrganization({
         id: organization,
         uid: user.id,
         roles: ['owner', 'manager'],
         personalAllowed: false
      });

      let member = org.members.find((member) => member.uid === memberID);

      if (!member) {
         throw createHttpError({
            error: 'Member not found',
            message:
               'This member does not exist, or you are not allowed to access this route.',
            statusCode: 404
         });
      }

      if (
         member.role === 'owner' &&
         request.body?.role &&
         request.body?.role !== 'owner'
      )
         throw createHttpError({
            error: 'Forbidden',
            message:
               'You are the owner of this organization, you cannot change your role.',
            statusCode: 403
         });

      if (member.role === 'owner' && typeof request.body?.seat !== 'undefined')
         throw createHttpError({
            error: 'Forbidden',
            message:
               'You are the owner of this organization, you cannot assign or unassign your seat.',
            statusCode: 403
         });

      if (request.body?.role === 'owner')
         throw createHttpError({
            error: 'Forbidden',
            message: 'You can not assign the owner role to someone else.',
            statusCode: 403
         });

      org = (await organizations.findOneAndUpdate(
         { id: org.id },
         {
            $set: flattenObject({
               'members.$[elem]': request.body
            })
         },
         {
            arrayFilters: [{ 'elem.uid': member.uid }],
            upsert: false
         }
      )) as OrganizationDoc;

      return {
         message: 'Successfully edited the member.',
         organization: org
      };
   }, OrganizationsMembersSchemas.edit),
   delete: makeController(async (request, reply): Promise<any> => {
      const user = authorized(request.user);

      const { organization, user: memberEmail } = request.params;

      const memberID = (await users.findOne({ email: memberEmail }).lean())?.id;

      const org = await getOrganization({
         id: organization,
         uid: user.id,
         roles: ['owner', 'manager'],
         personalAllowed: false,
         operators: {
            $pull: {
               members: {
                  uid: memberID,
                  role: { $nin: ['owner'] }
               }
            }
         }
      });

      const member = org.members.find((m) => m.uid === memberID);

      if (!member) {
         throw createHttpError({
            error: 'Member not found',
            message:
               'This member does not exist, or you are not allowed to access this route.',
            statusCode: 404
         });
      }

      if (member.role === 'owner')
         throw createHttpError({
            error: 'Forbidden',
            message:
               'You are the owner of this organization, you cannot leave it.',
            statusCode: 403
         });

      return {
         message: 'Successfully deleted the member.'
      };
   }, OrganizationsMembersSchemas.delete)
};
