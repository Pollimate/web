import { OrganizationsSchemas } from '@pollimate/schemas/routes';
import { OrganizationDoc, organizations, users } from '../../db';
import { flattenObject } from '../../lib';
import { makeController } from '../../lib/controller-handler';
import { createHttpError } from '../../lib/errors';
import { createOrg, getOrganization } from '../../lib/organizations';
import { authorized } from '../../lib/user';

export * from './invites';
export * from './members';

export const OrganizationsControllers = {
   requestSeat: makeController(async (request, reply) => {
      const user = authorized(request.user);

      const { organization } = request.params;
      //const { message } = request.body;

      const org = await getOrganization({
         id: organization,
         uid: user.id,
         requireSeat: false
      });

      if (org?.members?.find(({ uid }) => uid === user.id)?.seat)
         throw createHttpError({
            error: 'Already has seat',
            message:
               'You already have a seat, and therefore cant request another one.',
            statusCode: 400
         });

      await organizations.updateOne(
         { id: org.id },
         {
            $set: flattenObject({
               'members.$[elem]': {
                  requestSeatMessage: request.body.message,
                  requestedSeat: true
               }
            })
         },
         {
            arrayFilters: [{ 'elem.uid': user.id }],
            upsert: false
         }
      );

      return { message: 'Successfully requested a seat' };
   }, OrganizationsSchemas.requestSeat),

   editSettings: makeController(async (request, reply) => {
      const user = authorized(request.user);

      const { organization } = request.params;
      const { settings } = request.body;

      let org = await getOrganization({
         id: organization,
         uid: user.id,
         roles: ['owner', 'manager']
      });

      org = (await organizations.findOneAndUpdate(
         {
            id: org.id
         },
         flattenObject({ settings })
      )) as OrganizationDoc;

      return {
         message: 'Successfully edited the organization settings.',
         organization: org
      };
   }, OrganizationsSchemas.editSettings),
   create: makeController(async (request, reply) => {
      const user = authorized(request.user);
      const org = request.body;
      if (
         await organizations.exists({
            id: org.id === 'personal' ? user.id : org.id
         })
      ) {
         throw createHttpError({
            error: 'Organization already exists',
            message: 'An organization with this ID already exists.',
            statusCode: 403
         });
      }
      const organization = await createOrg({
         id: request.body.id,
         uid: user.id,
         profile: request.body?.profile
      });
      return {
         message: 'Successfully created the organization',
         organization
      };
   }, OrganizationsSchemas.create),
   delete: makeController(async (request, reply) => {
      const user = authorized(request.user);

      const { organization } = request.params;
      const { id } = request.body;

      if (organization !== id) {
         throw createHttpError({
            error: 'Invalid confirm value',
            message: 'The confirm value did not match the campaigns name.',
            statusCode: 400
         });
      }

      await getOrganization({
         id: organization,
         uid: user.id,
         roles: ['owner'],
         delete: true
      });

      return { message: 'Successfully deleted the organization :(' };
   }, OrganizationsSchemas.delete),

   edit: makeController(async (request, reply) => {
      const user = authorized(request.user);

      const { organization } = request.params;
      const { profile } = request.body;

      const org = await getOrganization({
         id: organization,
         uid: user.id,
         roles: ['owner'],
         update: flattenObject({
            profile
         })
      });

      return {
         message: 'Successfully edited the organization',
         organization: org
      };
   }, OrganizationsSchemas.edit),

   get: makeController(async (request, reply): Promise<any> => {
      const user = authorized(request.user);

      const { organization } = request.params;

      const org = await getOrganization({
         id: organization,
         uid: user.id,
         lean: true
      });

      const ownRole =
         org.members?.find((member) => member?.uid === user.id)?.role ||
         'member';

      return {
         message: 'Successfully retrieved the organization.',
         organization: {
            ...org,
            hasSeat: org?.members.find((v) => v.uid == user.id)?.seat,
            id: org.id === user.id ? 'personal' : org.id,

            role: ownRole,
            members: await Promise.all(
               org.members.map(async (member) => {
                  return {
                     ...(await users
                        .findOne(
                           {
                              id: member.uid
                           },
                           'name email id'
                        )
                        .lean()),
                     ...member
                  };
               })
            ),
            seats: {
               used: org.members.filter((v) => v?.seat).length
            }
         }
      };
   }, OrganizationsSchemas.get),

   list: makeController(async (request, reply): Promise<any> => {
      const user = authorized(request.user);

      const orgs = await organizations
         .find({
            members: {
               $elemMatch: {
                  uid: user.id
               }
            }
         })
         .lean();

      return {
         message: 'Successfully retrieved the organizations.',
         organizations: orgs
            .map((org) => ({
               ...org,
               role: org.members.find((member) => member.uid === user.id)?.role,
               id: org.id === user.id ? 'personal' : org.id
            }))
            .sort((a, b) => {
               // Ensure owners come first
               return (
                  (b.role === 'owner' ? 1 : 0) - (a.role === 'owner' ? 1 : 0)
               ); // Descending order: `owner` first
            })
      };
   }, OrganizationsSchemas.list),
   preview: makeController(async (request, reply): Promise<any> => {
      const user = authorized(request.user);

      const { organization } = request.params;

      const org = await getOrganization({
         id: organization,
         uid: user.id,
         lean: true,
         requireSeat: false
      });

      return {
         message: 'Successfully retrieved the organization.',
         organization: {
            ...org,
            hasSeat: org?.members.find((v) => v.uid == user.id)?.seat,
            id: org.id === user.id ? 'personal' : org.id,
            members: await Promise.all(
               org.members.map(async (member) => {
                  return {
                     ...(await users
                        .findOne(
                           {
                              id: member.uid
                           },
                           'name email id'
                        )
                        .lean()),
                     ...member
                  };
               })
            ),
            seats: {
               used: org.members.filter((v) => v?.seat).length
            }
         }
      };
   }, OrganizationsSchemas.preview),
   quicklist: makeController(async (request, reply) => {
      const user = authorized(request.user);

      const rawOrgs = await organizations
         .aggregate([
            {
               $match: {
                  'members.uid': user.id
               }
            },
            {
               $project: {
                  id: 1,
                  name: '$profile.name',
                  memberAmount: { $size: '$members' },
                  role: {
                     $first: {
                        $map: {
                           input: {
                              $filter: {
                                 input: '$members',
                                 as: 'm',
                                 cond: { $eq: ['$$m.uid', user.id] }
                              }
                           },
                           as: 'm',
                           in: '$$m.role'
                        }
                     }
                  }
               }
            }
         ])
         .exec();

      const orgs = rawOrgs.map((org) => ({
         ...org,
         id: org.id === user.id ? 'personal' : org.id
      }));

      return {
         message: 'Successfully retrieved the organizations.',
         organizations: orgs
      };
   }, OrganizationsSchemas.quicklist)
};
