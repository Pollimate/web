import { createTransport } from 'nodemailer';
import SMTPTransport, { Options } from 'nodemailer/lib/smtp-transport';
import env from '../env';

/* 

TODO: Use sendgrid or something instead.

*/
const smtpTransport = createTransport({
   host: env.MAILER_HOST,
   auth: {
      user: env.MAILER_EMAIL,
      pass: env.MAILER_PASSWORD
   },
   port: Number(env.MAILER_PORT)
});

export const sendEmail = async (
   email: Options
): Promise<SMTPTransport.SentMessageInfo['response']> => {
   return (
      await smtpTransport.sendMail({
         from: `"pollimate.io" <${env.MAILER_EMAIL}>`,

         ...email
      })
   ).response;
};
