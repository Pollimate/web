import { defineConfig } from 'tsup';

export default defineConfig({
   entry: ['src/index.ts', 'src/db/index.ts', 'src/routes/index.ts'],
   format: ['esm', 'cjs'], // both ESM and CommonJS
   outDir: 'dist',
   dts: true, // generate .d.ts files
   clean: true,
   sourcemap: true,

   outExtension({ format }) {
      return {
         js: format === 'esm' ? '.mjs' : '.cjs'
      };
   }
});
