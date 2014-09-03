var MongoClient = require('mongodb').MongoClient;

module.exports = function( options ){
  return {
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
        this.lastResults = results;
        return callback( null, results );
      }.bind( this ) );
    }

  , lastResults: []

  , query: function( query, callback ){
      query.where   = query.where || {};
      query.options = query.options || {};

      MongoClient.connect( options.connection, function( error, db ){
        if ( error ) return callback( error );

        var cursor = db.collection( options.collection ).find( query.where );

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
    }
  }
};