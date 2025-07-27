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

test('GET / returns 200', async () => {
   const res = await app.inject({ url: '/' });
   expect(res.statusCode).toBe(200);
}, 100_000);
