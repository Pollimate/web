import z from 'zod';

export const envSchema = z.object({
   NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),

   NAME: z.string().default('MyApp'),
   DESCRIPTION: z.string().default('This is my app.'),
   PORT: z.coerce.number().default(4000),

   MONGODB_CONNECTION_URL: z.string(),
   PRODUCTION_MONGODB_CONNECTION_URL: z.string().optional(),

   PRODUCTION_API_URL: z.url().optional(),

   CLIENT_DOMAIN: z.string(),

   COOKIE_SECRET: z.string().min(20).default('cookie_secretxxx2231321345'),

   MAGIC_CODE_SECRET: z
      .string()
      .min(20)
      .default('magic_code_secretxxx22313213455c7f932'),

   JWT_SECRET_KEY: z.string().min(20).default('jwt_secretxxx2231321345'),

   MAILER_EMAIL: z.email(),
   MAILER_PASSWORD: z.string().min(4),
   MAILER_HOST: z.string().default('smtp.mailtrap.io'),
   MAILER_PORT: z.coerce.number().default(587),

   FILE_LOCATION: z.string().default('file_uploads'), // Relative to root

   GOOGLE_CLIENT_ID: z.string(),
   GOOGLE_CLIENT_SECRET: z.string(),
   GOOGLE_PRODUCTION_CALLBACK_URL: z.url().optional(),
   GOOGLE_DEVELOPMENT_CALLBACK_URL: z.url()
});

export type Environment = z.infer<typeof envSchema>;

export default envSchema.parse(process.env);
