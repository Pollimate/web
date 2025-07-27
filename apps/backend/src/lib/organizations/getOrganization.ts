import { ClientSession } from 'mongoose';
import { Organization, OrganizationRole, organizations } from '../../db';
import { OrganizationDoc } from '../../db/models/organizations';
import { createHttpError } from '../errors';

type ReturnType<T extends boolean> = T extends true
   ? Organization
   : OrganizationDoc;

export const getOrganization = async <T extends boolean = false>({
   id,
   uid,
   roles,
   lean,
   skipAuth,
   personalAllowed = true,
   requireSeat = true,
   update,
   operators,
   upsert = false,
   returnDocument = 'after',
   arrayFilters,
   delete: _delete = false,
   session
}: {
   id: string;
   uid?: string;
   roles?: OrganizationRole | OrganizationRole[];
   lean?: T;
   skipAuth?: boolean;
   requireSeat?: boolean;
   personalAllowed?: boolean;
   update?: Partial<OrganizationDoc>;
   operators?: Record<string, any>; // arbitrary operators like $unset, $push etc.
   upsert?: boolean;
   arrayFilters?: Array<Record<string, unknown>>;
   returnDocument?: 'before' | 'after';
   delete?: boolean; // if true, will delete the organization instead of returning it
   session?: ClientSession;
}): Promise<ReturnType<T>> => {
   if (!id)
      throw createHttpError({
         error: 'Organization not found',
         message:
            'This organization does not exist, or you are not allowed to access this route.',
         statusCode: 404
      });

   const isPersonal = id === 'personal' || id === uid;

   if (isPersonal && !personalAllowed) {
      throw createHttpError({
         error: 'Personal organizations not allowed',
         message: 'This feature is not supported by personal organizations',
         statusCode: 400
      });
   }

   const query: any = {
      id: isPersonal ? uid : id
   };

   if (!skipAuth) {
      query.members = {
         $elemMatch: {
            ...(uid ? { uid } : {}),
            ...(roles?.length
               ? { role: { $in: Array.isArray(roles) ? roles : [roles] } }
               : {})
         }
      };
   }

   const options = {
      lean: !!lean,
      returnDocument,
      upsert: !!update && upsert,
      ...(arrayFilters ? { arrayFilters } : {})
   };

   let updateDoc = {};

   if (update || operators) {
      updateDoc = {
         $set: {
            updatedAt: new Date(),
            ...(update ?? {})
         },
         ...(operators ?? {})
      };
   }

   const organization =
      update || operators
         ? await organizations.findOneAndUpdate(query, updateDoc, options)
         : _delete
           ? await organizations.findOneAndDelete(query, {
                new: false,
                lean: !!lean
             })
           : await organizations.findOne(query, null, {
                lean: !!lean,
                session
             });

   if (!organization) {
      throw createHttpError({
         error: 'Organization not found',
         message:
            'This organization does not exist, or you are not allowed to access this route.',
         statusCode: 404
      });
   }

   if (
      uid &&
      !organization?.members.find((v: any) => v.uid === uid)?.seat &&
      !skipAuth &&
      requireSeat
   ) {
      throw createHttpError({
         error: 'You dont have any seat',
         message:
            'You do not have any seat, and can therefore not access this organization. Contact the owner to get a seat.',
         statusCode: 403
      });
   }

   /* @ts-ignore */
   return organization as ReturnType<T>;
};
