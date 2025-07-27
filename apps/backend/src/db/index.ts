import mongoose from 'mongoose';
import { log } from '../index';
import env from '../lib/env';

export const createConnection = async (CONNECTION_URL: string) => {
   await new Promise<void>(async (resolve, reject) => {
      /* Only log in production and development mode, not test */
      mongoose.connection.once('error', (error: Error) => {
         if (env.NODE_ENV !== 'test') log.error(error);
      });

      mongoose.connection.once('open', async (_err: Error) => {
         if (env.NODE_ENV !== 'test')
            log.info(`Connection established with MongoDB.`);

         resolve();
      });

      return await mongoose.connect(CONNECTION_URL, {
         socketTimeoutMS: 100000,
         connectTimeoutMS: 100000
      });
   });
};

export * from '@pollimate/schemas/db';

export * from './models/invites';
export * from './models/organizations';
export * from './models/otps';
export * from './models/users';
