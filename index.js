var MongoClient = require('mongodb').MongoClient;

module.exports = function( options ){
  return {
    query: function( query, callback ){
      query.where   = query.where || {};
      query.options = query.options || {};

      MongoClient.connect( options.connection, function( error, db ){
        if ( error ) return callback( error );

        var cursor = db.collection( options.collecition ).find( query.where );

        // Options
        [
          'sort', 'skip'
        ].forEach( function( option ){
          if ( option in query.options ){
            cursor[ option ]( query.options[ option ] );
          }
        });

        cursor.toArray( callback );
      });
    }
  }
};