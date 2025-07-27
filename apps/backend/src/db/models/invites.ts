import { InviteSchema } from '@pollimate/schemas/db';
import { Document, model, Schema } from 'mongoose';
import z from 'zod';
import { generateRawSchema } from 'zod-to-mongoose';

const mongooseSchema = new Schema(
   generateRawSchema({
      schema: InviteSchema
   })
);

export const invites = model<z.infer<typeof InviteSchema>>(
   'invites',
   mongooseSchema
);
export type InviteDoc = z.infer<typeof InviteSchema> & Document;
