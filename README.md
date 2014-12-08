# Loglog Server MongoDB Data Source

MongoDB data source for a [loglog server](https://github.com/goodybag/loglog-server). This package is bundled with the [loglog server](https://github.com/goodybag/loglog-server) module.

__Install:__

```
npm install loglog-server-mongodb
```

__Usage:__

```javascript
var server = require('loglog-server');

server.set( 'source', require('loglog-server-mongodb')({
  connection: 'mongodb://host:port/db'
, collection: 'collection_that_stores_logs'
  // See all options for db.createCollection()
  // http://mongodb.github.io/node-mongodb-native/2.0/api-docs
, collectionOptions: {
    capped: true // (default)
  , size:   1000 * 1000 * 1000 * 4 // (default) 4gigs
  }
}));

server.listen();
```