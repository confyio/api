var nano = require('nano')(process.env.CLOUDANT_URL || 'http://localhost:5984')

var seed = require('./seed');

var dbname = process.env.CLOUDANT_DBNAME || 'confy';

if (process.env.NODE_ENV == 'production') {
  seed.docs = seed.docs.filter(function (doc) {
    return doc._id.substr(0, 8) == '_design/';
  });
}

var seeding = function () {
  var db = nano.db.use(dbname);

  db.bulk(seed, function (err, body) {
    if (err) {
      console.log("Error seeding data");
      process.exit(1);
    }

    console.log("Successfully seeded data");
  });
};

var creating = function () {
  nano.db.create(dbname, function (err) {
    if (err) {
      console.log("Error creating database");
      process.exit(1);
    }

    return seeding();
  });
};

nano.db.get(dbname, function (err) {
  if (err && err.reason == 'no_db_file') {
    return creating();
  }

  if (process.env.NODE_ENV == 'production') {
    return seeding();
  }

  nano.db.destroy(dbname, function (err) {
    if (err) {
      console.log("Error destroying database");
      process.exit(1);
    }

    return creating();
  });
});
