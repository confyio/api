var express = require('express')
  , nano = require('nano')
  , bodyParser = require('body-parser')
  , segment = require('analytics-node')
  , raven = require('raven')
  , redis = require('redis');

var app = express();

// Setup environment variables
require('./utils/env')(app);

if (!app.get('onpremise')) {
  // Setup Segment analytics
  app.analytics = new segment(app.get('segment'));

  // Setup Sentry
  app.sentry = new raven.Client(app.get('sentry'));

  if (app.get('env') === 'production') {
    app.sentry.patchGlobal();
  }
} else {
  app.analytics = {
    identify: function () {},
    track: function () {}
  };
}

// Setup middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Setup logger
require('./utils/logger')(app);

// Setup database handler
var db = nano(app.get('db')).use(app.get('dbname'));

// Setup redis
app.redis = redis.createClient({url: app.get('redis'), enable_offline_queue: false});

// Setup utility functions
require('./utils/auth')(app, db);
require('./utils/bulk')(app);
require('./utils/hash')(app);
require('./utils/mailer')(app);
require('./utils/cors')(app);

// Setup API
require('./api/users')(app, db);
require('./api/orgs')(app, db);
require('./api/teams')(app, db);
require('./api/projects')(app, db);
require('./api/envs')(app, db);

if (!app.get('onpremise')) {
  // Heroku addon
  require('./api/heroku')(app, db);
}

// Error handling
require('./utils/error')(app);

// Export Server
module.exports = app;

if (require.main === module) {
  app.listen(app.get('port'), function () {
    console.log('Started server');
  });
}
