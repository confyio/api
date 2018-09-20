var express = require('express')
  , nano = require('nano')
  , bodyParser = require('body-parser')
  , segment = require('analytics-node')
  , sentry = require('@sentry/node')
  , redis = require('redis');

var app = express();

// Setup environment variables
require('./utils/env')(app);

if (!app.get('onpremise')) {
  // Setup Segment analytics
  app.analytics = new segment(app.get('segment'));

  // Setup Sentry
  sentry.init({ dsn: app.get('sentry') });
  app.use(sentry.Handlers.requestHandler());
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

// Catch 404
app.use(function (req, res, next) {
  app.errors.notfound(res);
});

// Development error handler will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

if (!app.get('onpremise')) {
  app.use(sentry.Handlers.errorHandler());
}

// Production error handler no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
  });
});

// Export Server
module.exports = app;

if (require.main === module) {
  app.listen(app.get('port'), function () {
    console.log('Started server');
  });
}
