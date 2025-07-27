import { OtpSchema } from '@pollimate/schemas/db';
import { Document, model, Schema } from 'mongoose';
import z from 'zod';
import { generateRawSchema } from 'zod-to-mongoose';

const mongooseSchema = new Schema(
   generateRawSchema({
      schema: OtpSchema
   })
);

export const otps = model<z.infer<typeof OtpSchema>>('otps', mongooseSchema);
export type OtpDoc = z.infer<typeof OtpSchema> & Document;
