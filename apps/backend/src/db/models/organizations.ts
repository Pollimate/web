import { OrganizationSchema } from '@pollimate/schemas/db';
import { Document, model, Schema } from 'mongoose';
import z from 'zod';

import { generateRawSchema } from 'zod-to-mongoose';

const mongooseSchema = new Schema(
   generateRawSchema({
      schema: OrganizationSchema
   })
);

export const organizations = model<z.infer<typeof OrganizationSchema>>(
   'organizations',
   mongooseSchema
);

export type OrganizationDoc = z.infer<typeof OrganizationSchema> & Document;
