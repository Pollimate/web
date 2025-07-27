import { afterAll, beforeAll, expect, test } from '@jest/globals';
import mongoose from 'mongoose';
import { build } from '../helper';

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

test('GET /example returns 401 Unauthorized', async () => {
   const res = await app.inject({ url: '/example' });
   expect(res.statusCode).toBe(401);
}, 10_000);
