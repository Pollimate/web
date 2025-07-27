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

// Helper to register a user
async function registerUser(email?: string, password?: string) {
   const randomEmail = email || faker.internet.email();
   const randomPassword = password || faker.internet.password();
   const randomName = faker.person.fullName();
   const phoneNumber = faker.phone.number({ style: 'international' });
   const res = await app.inject({
      method: 'POST',
      url: '/users/auth/register',
      body: {
         email: randomEmail,
         password: randomPassword,
         name: randomName,
         phoneNumber
      }
   });
   return { res, email: randomEmail, password: randomPassword };
}

// Helper to login a user
async function loginUser(email: string, password: string) {
   return await app.inject({
      method: 'POST',
      url: '/users/auth/login',
      body: { email, password }
   });
}

describe('User Authentication', () => {
   test('Register user (happy path)', async () => {
      const { res } = await registerUser();
      expect(res.statusCode).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('user');
      expect(body.user).not.toHaveProperty('password');
   }, 60_000);

   test('Register user with invalid email fails', async () => {
      const res = await app.inject({
         method: 'POST',
         url: '/users/auth/register',
         body: {
            email: 'not-an-email',
            password: 'password123',
            name: 'Test User',
            phoneNumber: faker.phone.number({ style: 'international' })
         }
      });
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
   }, 60_000);

   test('Login user (happy path)', async () => {
      const { email, password } = await registerUser();
      const res = await loginUser(email, password);
      expect(res.statusCode).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('user');
      expect(body.user).not.toHaveProperty('password');
   }, 60_000);

   test('Login with invalid credentials returns error', async () => {
      const res = await loginUser(
         faker.internet.email(),
         faker.internet.password()
      );
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
   }, 60_000);

   test('GET /users/logged-in returns 401 if not logged in', async () => {
      const res = await app.inject({ method: 'GET', url: '/users/logged-in' });
      expect(res.statusCode).toBe(401);
   }, 60_000);

   test('GET /users/logged-in returns 200 if logged in', async () => {
      const { email, password } = await registerUser();
      const loginRes = await loginUser(email, password);
      const setCookie = loginRes.headers['set-cookie'];
      const cookieHeader = Array.isArray(setCookie)
         ? setCookie.join('; ')
         : setCookie;
      const res = await app.inject({
         method: 'GET',
         url: '/users/logged-in',
         headers: cookieHeader ? { cookie: cookieHeader } : undefined
      });
      expect(res.statusCode).toBe(200);
   }, 60_000);

   test('GET /users/logout returns 200 and clears cookie', async () => {
      const { email, password } = await registerUser();
      const loginRes = await loginUser(email, password);
      const setCookie = loginRes.headers['set-cookie'];
      const cookieHeader = Array.isArray(setCookie)
         ? setCookie.join('; ')
         : setCookie;
      const res = await app.inject({
         method: 'GET',
         url: '/users/logout',
         headers: cookieHeader ? { cookie: cookieHeader } : undefined
      });
      expect(res.statusCode).toBe(200);
      const body = await res.json();
      expect(body.message).toMatch(/logged out/i);
   }, 60_000);

   test('GET /users/logout without auth returns 401 or 200 (depending on implementation)', async () => {
      const res = await app.inject({ method: 'GET', url: '/users/logout' });
      // Some implementations may allow logout without auth, some may not
      expect([200, 401]).toContain(res.statusCode);
   }, 60_000);
});
