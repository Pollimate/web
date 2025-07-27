import { InvitesSchemas } from '@pollimate/schemas/routes';
import {
   ExtendedInviteSchema,
   invites as _invites,
   organizations,
   users
} from '../db';
import { makeController } from '../lib/controller-handler';
import { createHttpError } from '../lib/errors';
import { getOrganization } from '../lib/organizations';
import { authorized } from '../lib/user';

export const InvitesControllers = {
   get: makeController(async (request, reply): Promise<any> => {
      const user = authorized(request.user);

      const { organization } = request.params;

      let [org, invite] = await Promise.all([
         await getOrganization({
            id: organization
         }),
         _invites
            .findOne({
               organization,
               email: user.email
            })
            .lean()
      ]);

      if (!invite) {
         throw createHttpError({
            error: 'Invite not found',
            message: 'The specified invite was not found.',
            statusCode: 404
         });
      }

      const inviter = await users.findOne({ id: invite.inviter }).lean();

      return {
         message: 'Successfully retrieved the invite.',
         invite: {
            ...invite,
            inviterEmail: (inviter?.email as string) || '',
            inviterName: (inviter?.name as string) || '',
            orgProfile: org?.profile,
            memberAmount: org.members.length
         }
      };
   }, InvitesSchemas.get),
   join: makeController(async (request, reply) => {
      const user = authorized(request.user);
      const { organization } = request.params;
      let [org, invite] = await Promise.all([
         await getOrganization({
            id: organization
         }),
         _invites.findOne({
            organization,
            email: user.email
         })
      ]);
      if (!invite)
         throw createHttpError({
            error: 'Invite not found',
            message:
               'The invite either does not exist or has already been accepted/denied.',
            statusCode: 404
         });
      await org
         .updateOne({
            $push: {
               members: {
                  uid: user.id,
                  role: invite.role
               }
            }
         })
         .lean();
      await invite.deleteOne().lean();
      return {
         message: 'Successfully joined the organization.'
      };
   }, InvitesSchemas.join),
   overview: makeController(async (request, reply): Promise<any> => {
      const user = authorized(request.user);

      const invites = (
         await Promise.all(
            (
               await _invites
                  .find({
                     email: user.email
                  })
                  .lean()
            ).map(async (item) => {
               const [organization, inviter] = await Promise.all([
                  organizations
                     .findOne({
                        id: item.organization
                     })
                     .lean(),
                  users.findOne({ id: item.inviter }).lean()
               ]);

               const res = ExtendedInviteSchema.safeParse({
                  ...item,
                  inviterEmail: inviter?.email as string,
                  inviterName: inviter?.name as string,
                  orgProfile: organization?.profile,
                  memberAmount: organization?.members?.length
               });

               if (typeof res.data === 'undefined')
                  await _invites.deleteOne({
                     email: user.email
                  });

               return typeof res.data !== 'undefined' ? res.data : undefined;
            })
         )
      ).filter((v) => v);

      return {
         message: 'Successfully listed all invites.',
         invites
      };
   }, InvitesSchemas.overview),
   reject: makeController(async (request, reply): Promise<any> => {
      const user = authorized(request.user);

      const { organization } = request.params;

      let [_, invite] = await Promise.all([
         await getOrganization({
            id: organization
         }),
         _invites.findOne({
            organization,
            email: user.email
         })
      ]);

      if (!invite) {
         throw createHttpError({
            error: 'Invite not found',
            message: 'The specified invite was not found.',
            statusCode: 404
         });
      }

      await invite.deleteOne().lean();

      // Notify org maybe??

      return {
         message: 'Successfully deleted the invitation.'
      };
   }, InvitesSchemas.reject)
};
