import {
   adjectives,
   animals,
   colors,
   uniqueNamesGenerator
} from 'unique-names-generator';
import {
   Member,
   Organization,
   OrganizationDoc,
   OrganizationRole,
   organizations,
   User
} from '../../db';

export * from './getOrganization';

export const isOwner = (
   org: OrganizationDoc | Organization,
   user: User
): boolean =>
   (org.members.find((member) => member.uid === user.id) as Member)?.role ===
   'owner';

export const getOwnRole = (
   org: OrganizationDoc | Organization,
   user: User
): OrganizationRole =>
   (org.members.find((member) => member.uid === user.id) as Member)?.role;

export const createOrg = async ({
   id,
   uid,
   ...org
}: {
   uid: string;
   id?: string;
} & Partial<Pick<OrganizationDoc, 'profile'>> &
   Partial<Pick<OrganizationDoc, 'settings'>>) => {
   const orgName = id === 'personal' ? uid : id || generateOrgName();

   const organization = await organizations.create({
      members: [
         {
            uid: uid,
            role: 'owner',
            seat: true
         }
      ],
      createdAt: new Date(),
      ...org,
      id: orgName
   });

   return organization;
};

export const generateOrgName = () =>
   `${uniqueNamesGenerator({
      dictionaries: [colors, adjectives, animals],
      length: 2
   })}_${Math.floor(Math.random() * 10000)}`;
