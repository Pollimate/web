import { OrganizationsInvitesSchemas } from '@pollimate/schemas/routes';
import { invites as _invites, users } from '../../db';
import { makeController } from '../../lib/controller-handler';
import { createHttpError } from '../../lib/errors';
import { getOrganization } from '../../lib/organizations';
import { authorized } from '../../lib/user';

export const OrganizationsInvitesControllers = {
   create: makeController(async (request, reply) => {
      const user = authorized(request.user);
      const { organization } = request.params;
      const { invites } = request.body;
      // Step 1: Fetch org and members
      const org = await getOrganization({
         id: organization,
         uid: user.id,
         roles: ['owner', 'manager'],
         personalAllowed: false,
         lean: true
      });
      // Step 2: Normalize emails
      const inviteEmails = invites.map((i) => i.email.toLowerCase());
      // Step 3: Fetch existing invites & users in bulk
      const [existingInvites, existingUsers] = await Promise.all([
         _invites
            .find({ organization: org.id, email: { $in: inviteEmails } })
            .lean(),
         users.find({ email: { $in: inviteEmails } }).lean()
      ]);
      // Step 4: Build email → userId map
      const userMap = new Map<string, string>();
      for (const userObj of existingUsers) {
         userMap.set(userObj.email, userObj.id);
      }
      const existingInviteSet = new Set(
         existingInvites.map((inv) => inv.email)
      );
      const memberIdSet = new Set(
         (org.members || []).map((m) => m?.uid).filter(Boolean)
      );
      // Step 5: Filter and validate invites
      const toInsert = [];
      for (const invite of invites) {
         const email = invite.email;
         const uid = userMap.get(email);
         if (!uid) {
            throw createHttpError({
               error: 'User not found',
               message: `User with email ${email} does not exist.`,
               statusCode: 400
            });
         }
         if (email === user.email.toLowerCase()) {
            throw createHttpError({
               error: 'Invalid invite',
               message: 'You cannot invite yourself.',
               statusCode: 400
            });
         }
         if (memberIdSet.has(uid)) {
            throw createHttpError({
               error: 'Already a member',
               message: `User with email ${email} is already in the organization.`,
               statusCode: 400
            });
         }
         if (existingInviteSet.has(email)) {
            continue; // Skip duplicate invites
         }
         toInsert.push({
            ...invite,
            organization: org.id,
            inviter: user.id
         });
      }
      // Step 6: Insert non-duplicate invites
      if (toInsert.length > 0) {
         await _invites.insertMany(toInsert, { ordered: false }); // `ordered: false` skips duplicates
      }
      return {
         message:
            'Successfully invited the specified user(s) to the organization'
      };
   }, OrganizationsInvitesSchemas.create),
   delete: makeController(async (request, reply) => {
      const user = authorized(request.user);

      const { organization, invite } = request.params;

      const org = await getOrganization({
         id: organization,
         uid: user.id,
         roles: ['owner', 'manager'],
         lean: true,
         personalAllowed: false
      });

      const deletedInvite = await _invites
         .findOneAndDelete({
            organization: org.id,
            email: invite
         })
         .lean();

      if (!deletedInvite) {
         throw createHttpError({
            error: 'Invite not found',
            message: 'The specified invite was not found.',
            statusCode: 404
         });
      }

      return {
         message: 'Successfully deleted the specified invitation.'
      };
   }, OrganizationsInvitesSchemas.delete),
   edit: makeController(async (request, reply) => {
      const user = authorized(request.user);

      const { organization, invite } = request.params;

      const { ...body } = request.body;

      const org = await getOrganization({
         id: organization,
         uid: user.id,
         roles: ['owner', 'manager'],
         lean: true,
         personalAllowed: false
      });

      const inv = await _invites
         .findOneAndUpdate(
            {
               organization: org.id,
               email: invite
            },
            {
               $set: body
            },
            {
               new: true // Set to `false` if you want the old doc instead
            }
         )
         .lean();

      if (!inv) {
         throw createHttpError({
            error: 'Invite not found',
            message: 'The specified invite was not found.',
            statusCode: 404
         });
      }

      return {
         message: 'Successfully deleted the specified invitation.',
         invite: inv
      };
   }, OrganizationsInvitesSchemas.edit),
   get: makeController(async (request, reply) => {
      const user = authorized(request.user);

      const { organization, invite } = request.params;

      const org = await getOrganization({
         id: organization,
         uid: user.id,
         roles: ['owner', 'manager'],
         lean: true,
         personalAllowed: false
      });

      const inv = await _invites
         .findOne({
            organization: org.id,
            email: invite
         })
         .lean();

      if (!inv) {
         throw createHttpError({
            error: 'Invite not found',
            message: 'The specified invite was not found.',
            statusCode: 404
         });
      }

      return {
         message: 'Successfully deleted the specified invitation.',
         invite: inv
      };
   }, OrganizationsInvitesSchemas.get),
   list: makeController(async (request, reply) => {
      const user = authorized(request.user);

      const { organization } = request.params;

      const org = await getOrganization({
         id: organization,
         uid: user.id,
         roles: ['owner', 'manager'],
         lean: true
      });

      const invites = await _invites
         .find({
            organization: org.id
         })
         .lean();

      return {
         message: 'Successfully listed all the orgs invites.',
         invites
      };
   }, OrganizationsInvitesSchemas.list)
};
