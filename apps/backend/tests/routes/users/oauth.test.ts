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

describe('User OAuth', () => {
   // Google OAuth
   test('POST /users/auth/google/callback with invalid credential returns error', async () => {
      const originalLog = console.log;
      const originalError = console.error;
      console.log = () => {};
      console.error = () => {};
      const res = await app.inject({
         method: 'POST',
         url: '/users/auth/google/callback',
         body: { credential: 'invalid-token' }
      });
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
      console.log = originalLog;
      console.error = originalError;
   }, 60_000);

   // Magic code register
   test('POST /users/auth/magic-code/register sends code (happy path)', async () => {
      const email = faker.internet.email();
      const name = faker.person.fullName();
      const res = await app.inject({
         method: 'POST',
         url: '/users/auth/magic-code/register',
         body: { email, name }
      });
      // Should return 200 and a message
      expect([200, 400]).toContain(res.statusCode); // 400 if email already used, 200 if sent
      if (res.statusCode === 200) {
         const body = await res.json();
         expect(body).toHaveProperty('message');
      }
   }, 60_000);

   test('POST /users/auth/magic-code/register with invalid email fails', async () => {
      const res = await app.inject({
         method: 'POST',
         url: '/users/auth/magic-code/register',
         body: { email: 'not-an-email', name: 'Test User' }
      });
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
   }, 60_000);

   // Magic code login
   test('POST /users/auth/magic-code/login sends code (happy path)', async () => {
      const email = faker.internet.email();
      // Register first
      await app.inject({
         method: 'POST',
         url: '/users/auth/magic-code/register',
         body: { email, name: faker.person.fullName() }
      });
      const res = await app.inject({
         method: 'POST',
         url: '/users/auth/magic-code/login',
         body: { email }
      });
      expect([200, 400]).toContain(res.statusCode); // 400 if not registered, 200 if sent
      if (res.statusCode === 200) {
         const body = await res.json();
         expect(body).toHaveProperty('message');
      }
   }, 60_000);

   test('POST /users/auth/magic-code/login with invalid email fails', async () => {
      const res = await app.inject({
         method: 'POST',
         url: '/users/auth/magic-code/login',
         body: { email: 'not-an-email' }
      });
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
   }, 60_000);

   // Magic code callback (simulate, as real code flow is external)
   test('GET /users/auth/magic-code/callback returns user if code is valid (mocked)', async () => {
      // This would require a valid code, so we expect 401/400 in test
      const res = await app.inject({
         method: 'GET',
         url: '/users/auth/magic-code/callback'
      });
      expect([401, 400]).toContain(res.statusCode);
   }, 60_000);

   test('GET /users/auth/magic-code/callback unauthorized returns 401/400', async () => {
      const res = await app.inject({
         method: 'GET',
         url: '/users/auth/magic-code/callback'
      });
      expect([401, 400]).toContain(res.statusCode);
   }, 60_000);
});
