import { faker } from '@faker-js/faker';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
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

async function registerAndLogin() {
   const email = faker.internet.email();
   const password = faker.internet.password();
   const name = faker.person.fullName();
   const phoneNumber = faker.phone.number({ style: 'international' });
   await app.inject({
      method: 'POST',
      url: '/users/auth/register',
      body: { email, password, name, phoneNumber }
   });
   const loginRes = await app.inject({
      method: 'POST',
      url: '/users/auth/login',
      body: { email, password }
   });
   const setCookie = loginRes.headers['set-cookie'];
   const cookieHeader = Array.isArray(setCookie)
      ? setCookie.map((c) => c.split(';')[0]).join('; ')
      : setCookie?.split(';')[0];
   return { cookieHeader, email, password };
}

describe('User Password', () => {
   test('PUT /users/passwords updates password (happy path)', async () => {
      const { cookieHeader, password: originalPassword } =
         await registerAndLogin();
      const newPassword = faker.internet.password();
      // Update
      const res = await app.inject({
         method: 'PUT',
         url: '/users/passwords',
         headers: cookieHeader ? { cookie: cookieHeader } : undefined,
         body: {
            password: newPassword,
            confirmPassword: newPassword,
            existingPassword: originalPassword
         }
      });
      expect(res.statusCode).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('message');
   }, 60_000);

   test('PUT /users/passwords fails if passwords do not match', async () => {
      const { cookieHeader, password: originalPassword } =
         await registerAndLogin();
      // Update with mismatch
      const res = await app.inject({
         method: 'PUT',
         url: '/users/passwords',
         headers: cookieHeader ? { cookie: cookieHeader } : undefined,
         body: {
            password: 'newPassword123!',
            confirmPassword: 'differentPassword!',
            existingPassword: originalPassword
         }
      });
      expect(res.statusCode).toBe(400);
   }, 60_000);

   test('PUT /users/passwords fails if existing password is wrong', async () => {
      const { cookieHeader } = await registerAndLogin();
      // Update with wrong existing password
      const res = await app.inject({
         method: 'PUT',
         url: '/users/passwords',
         headers: cookieHeader ? { cookie: cookieHeader } : undefined,
         body: {
            password: 'newPassword123!',
            confirmPassword: 'newPassword123!',
            existingPassword: 'wrongPassword!'
         }
      });
      expect(res.statusCode).toBe(401);
   }, 60_000);

   test('PUT /users/passwords fails with invalid body (schema validation)', async () => {
      const { cookieHeader } = await registerAndLogin();
      // Missing confirmPassword
      const res = await app.inject({
         method: 'PUT',
         url: '/users/passwords',
         headers: cookieHeader ? { cookie: cookieHeader } : undefined,
         body: {
            password: 'short'
         }
      });
      expect(res.statusCode).toBe(400);
   }, 60_000);
});
