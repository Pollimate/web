import { UserSchema } from '@pollimate/schemas/db';
import { Document, model, Schema } from 'mongoose';
import z from 'zod';
import { generateRawSchema } from 'zod-to-mongoose';

const mongooseSchema = new Schema(
   generateRawSchema({
      schema: UserSchema
   })
);
export const users = model<z.infer<typeof UserSchema>>('users', mongooseSchema);

export type UserDoc = z.infer<typeof UserSchema> & Document;
