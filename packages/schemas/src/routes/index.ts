import z from 'zod';

export const IndexSchemas = {
   get: {
      response: {
         200: z.object({
            name: z.string(),
            description: z.string(),
            version: z.string(),
            root: z.boolean()
         })
      }
   },
   example: {
      response: {
         200: z.object({
            message: z.string()
         })
      }
   }
};

export * from './admin';
export * from './join';
export * from './organizations';
export * from './users';
