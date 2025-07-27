import { ClientSession } from 'mongoose';
import { User, UserDoc, users } from '../../db';
import { createHttpError } from '../errors';

type ReturnType<T extends boolean> = T extends true ? User : UserDoc;

type UserIdentifier = { uid: string } | { email: string };

export const getUser = async <T extends boolean = false>({
   lean,
   update,
   operators,
   upsert = false,
   arrayFilters,
   returnDocument = 'after',
   delete: _delete = false,
   session,
   ...identifier
}: {
   lean?: T;
   update?: Partial<UserDoc>;
   operators?: Record<string, any>;
   upsert?: boolean;
   arrayFilters?: Array<Record<string, unknown>>;
   returnDocument?: 'before' | 'after';
   delete?: boolean;
   session?: ClientSession;
} & UserIdentifier): Promise<ReturnType<T>> => {
   // Validate input identifier
   if (!('email' in identifier || 'uid' in identifier)) {
      throw createHttpError({
         error: 'User not found',
         message: 'This user does not exist.',
         statusCode: 404
      });
   }

   // Build query based on identifier
   const query: any = {};
   if ('email' in identifier) query.email = identifier.email;
   if ('uid' in identifier) query.id = identifier.uid;

   // Prepare options for findOneAndUpdate or findOne
   const options = {
      lean: !!lean,
      returnDocument,
      upsert: !!update && upsert,
      ...(arrayFilters ? { arrayFilters } : {}),
      session
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

   // Perform DB operation
   const user =
      update || operators
         ? await users.findOneAndUpdate(query, updateDoc, options)
         : _delete
           ? await users.findOneAndDelete(query, { lean: !!lean, session })
           : await users.findOne(query, null, { lean: !!lean, session });

   if (!user) {
      throw createHttpError({
         error: 'User not found',
         message: 'This user does not exist.',
         statusCode: 404
      });
   }

   /* @ts-ignore */
   return user as ReturnType<T>;
};
