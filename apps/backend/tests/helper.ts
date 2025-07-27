// This file contains code that we reuse between our tests.

import { FastifyInstance } from 'fastify';
import helper from 'fastify-cli/helper';
import * as test from 'node:test';
import * as path from 'path';

export type TestContext = {
   after: typeof test.after;
};

const AppPath = path.join(__dirname, '..', 'src/index.ts');

// Fill in this config with all the configurations
// needed for testing the application
async function config() {
   return {};
}

// Automatically build and tear down our instance
async function build(): Promise<FastifyInstance> {
   // you can set all the options supported by the fastify CLI command
   const argv = [AppPath];

   // fastify-plugin ensures that all decorators
   // are exposed for testing purposes, this is
   // different from the production setup
   const app: FastifyInstance = await helper.build(argv, await config());

   console.log(app);
   return app;
}

export { build, config };
