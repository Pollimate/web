// In this file you can configure migrate-mongo

require('dotenv').config();

const config = {
   mongodb: {
      // TODO Change (or review) the url to your MongoDB:
      url:
         process.env.NODE_ENV === 'production'
            ? process.env.PRODUCTION_MONGODB_CONNECTION_URL
            : process.env.MONGODB_CONNECTION_URL,

      // TODO Change this to your database name:
      databaseName: 'pollimate',

      options: {
         //   connectTimeoutMS: 3600000, // increase connection timeout to 1 hour
         //   socketTimeoutMS: 3600000, // increase socket timeout to 1 hour
      }
   },

   // The migrations dir, can be an relative or absolute path. Only edit this when really necessary.
   migrationsDir: './src/db/migrations',

   // The mongodb collection where the applied changes are stored. Only edit this when really necessary.
   changelogCollectionName: 'changelog',

   // The mongodb collection where the lock will be created.
   lockCollectionName: 'changelog_lock',

   // The value in seconds for the TTL index that will be used for the lock. Value of 0 will disable the feature.
   lockTtl: 0,

   // The file extension to create migrations and search for in migration dir
   migrationFileExtension: '.js',

   // Enable the algorithm to create a checksum of the file contents and use that in the comparison to determin
   // if the file should be run.  Requires that scripts are coded to be run multiple times.
   useFileHash: false,

   // Don't change this, unless you know what you're doing
   moduleSystem: 'commonjs'
};

module.exports = config;
