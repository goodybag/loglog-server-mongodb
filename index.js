var MongoClient = require('mongodb').MongoClient;

var hasSetup = false;

var defaults = function( a, b ){
  a = a || {};

  for ( var key in b ){
    if ( !(key in a ) ) a[ key ] = b[ key ];
  }

  return a;
};

module.exports = function( options ){
  options = options || {};
  options.collectionOptions = options.collectionOptions || {};

  defaults( options.collectionOptions, {
    capped: true
  , size: 1000 * 1000 * 1000 * 4 // 5gigs
  });

  var source = {
    check: function( callback ){
      var query = {
        where: this.lastResults.length ? { _id: { $gt: this.lastResults[0]._id } } : {}
      , options: {
          sort: [ [ '_id', -1 ] ]
        , limit: 20
        }
      };

      this.query( query, function( error, results ){
        if ( error ) return callback( error );

        if ( results.length ){
          this.lastResults = results;
        }

        // Reverse results so that events are in order
        return callback( null, results.slice().reverse() );
      }.bind( this ) );
    }

  , lastResults: []

  , query: function( query, callback ){
      query.where   = query.where || {};
      query.options = query.options || {};

      MongoClient.connect( options.connection, function( error, db ){
        if ( error ) return callback( error );

        // Attempt to create the collection with the options passed
        // if we haven't done so already
        (function( next ){
          if ( hasSetup ) return next( null, db.collection( options.collection ) );

          source.setup( db, next );
        })( function( error, collection ){
          if ( error ) return callback( error );

          var cursor = collection.find( query.where );

          // Options
          [
            'sort', 'skip', 'limit'
          ].forEach( function( option ){
            if ( option in query.options ){
              cursor[ option ]( query.options[ option ] );
            }
          });

          cursor.toArray( function( error, results ){
            db.close();
            callback( error, results );
          });
        });

      });
    }

  , setup: function( db, callback ){
      db.createCollection( options.collection, options.collectionOptions, function( error, collection ){
        if ( error ) return callback( error );

        hasSetup = true;

        return callback( null, collection );
      });
    }
  };

  return source;
};