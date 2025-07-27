import { z } from 'zod';

export const OtpSchema = z.object({
   code: z.string(),
   value: z.object({
      expiresIn: z.number(),
      user: z.object({
         email: z.email(),
         name: z.string().optional()
      })
   })
});

export type Otp = z.infer<typeof OtpSchema>;
