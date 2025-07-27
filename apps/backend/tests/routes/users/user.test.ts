import { faker } from '@faker-js/faker';
import { afterAll, beforeAll, expect, test } from '@jest/globals';
import mongoose from 'mongoose';
import { build } from '../../helper';

let app: Awaited<ReturnType<typeof build>>;

beforeAll(async () => {
   app = await build();
});

afterAll(async () => {
   if (app) {
      await app.close();
   }
   if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
   }
});

test('GET /users unauthorized returns 401', async () => {
   const res = await app.inject({ url: '/users' });
   expect(res.statusCode).toBe(401);
}, 10000);

test('Register and login flow works', async () => {
   const randomEmail = faker.internet.email();
   const randomPassword = faker.internet.password();
   const randomName = faker.person.fullName();
   const phoneNumber = faker.phone.number({ style: 'international' });

   // Register user
   let res = await app.inject({
      method: 'POST',
      url: '/users/auth/register',
      body: {
         email: randomEmail,
         password: randomPassword,
         name: randomName,
         phoneNumber
      }
   });
   expect(res.statusCode).toBe(200);

   // Login user
   res = await app.inject({
      method: 'POST',
      url: '/users/auth/login',
      body: {
         email: randomEmail,
         password: randomPassword
      }
   });
   expect(res.statusCode).toBe(200);
}, 100000);

test('Login with invalid credentials returns error status', async () => {
   const res = await app.inject({
      method: 'POST',
      url: '/users/auth/login',
      body: {
         email: faker.internet.email(),
         password: faker.internet.password()
      }
   });
   expect(res.statusCode).toBeGreaterThanOrEqual(400);
}, 10000);
