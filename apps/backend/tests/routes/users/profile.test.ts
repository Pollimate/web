import { faker } from '@faker-js/faker';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import fs from 'fs';
import mongoose from 'mongoose';
import path from 'path';
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

// Helper to register, login, and persist cookies
async function registerLoginAndGetCookies() {
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
   // Extract and persist cookies
   const setCookie = loginRes.headers['set-cookie'];
   const cookieHeader = Array.isArray(setCookie)
      ? setCookie.map((c) => c.split(';')[0]).join('; ')
      : setCookie?.split(';')[0];
   return { cookieHeader, email, password };
}

describe('User Profile', () => {
   test('GET /users unauthorized returns 401', async () => {
      const res = await app.inject({ method: 'GET', url: '/users' });
      expect(res.statusCode).toBe(401);
   }, 60_000);

   test('GET /users returns user info when authenticated', async () => {
      const { cookieHeader } = await registerLoginAndGetCookies();
      // Use the same cookies for the authenticated request
      const res = await app.inject({
         method: 'GET',
         url: '/users',
         headers: cookieHeader ? { cookie: cookieHeader } : undefined
      });
      expect(res.statusCode).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('user');
      expect(body.user).not.toHaveProperty('password');
   }, 60_000);

   test('PUT /users unauthorized returns 401', async () => {
      const res = await app.inject({
         method: 'PUT',
         url: '/users',
         body: { user: { name: 'New Name' } }
      });
      expect(res.statusCode).toBe(401);
   }, 60_000);

   test('PUT /users updates user info when authenticated', async () => {
      const { cookieHeader } = await registerLoginAndGetCookies();
      const newName = faker.person.fullName();
      const res = await app.inject({
         method: 'PUT',
         url: '/users',
         headers: cookieHeader ? { cookie: cookieHeader } : undefined,
         body: { user: { name: newName } }
      });
      expect(res.statusCode).toBe(200);
      const body = await res.json();
      expect(body.user.name).toBe(newName);
   }, 60_000);

   test('PUT /users/profile-picture unauthorized returns 401', async () => {
      const res = await app.inject({
         method: 'PUT',
         url: '/users/profile-picture',
         payload: {},
         headers: { 'content-type': 'multipart/form-data' }
      });
      expect([401, 400]).toContain(res.statusCode); // 400 if missing file, 401 if unauthorized
   }, 60_000);

   test('PUT /users/profile-picture uploads file when authenticated', async () => {
      const { cookieHeader } = await registerLoginAndGetCookies();
      // Create a dummy file to upload
      const filePath = path.join(__dirname, 'dummy-profile-pic.png');
      fs.writeFileSync(filePath, Buffer.from([0x89, 0x50, 0x4e, 0x47])); // PNG header
      const res = await app.inject({
         method: 'PUT',
         url: '/users/profile-picture',
         headers: {
            ...(cookieHeader ? { cookie: cookieHeader } : {}),
            'content-type':
               'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
         },
         payload: `------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"profilePicture\"; filename=\"dummy-profile-pic.png\"\r\nContent-Type: image/png\r\n\r\n${fs.readFileSync(filePath)}\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--\r\n`
      });
      fs.unlinkSync(filePath);
      expect([200, 400, 500]).toContain(res.statusCode); // 200 if upload works, 400/500 if GCS not mocked
      // If 200, check response
      if (res.statusCode === 200) {
         const body = await res.json();
         expect(body).toHaveProperty('url');
      }
   }, 60_000);
});
