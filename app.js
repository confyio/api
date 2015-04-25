var express = require('express')
  , nano = require('nano')
  , bodyParser = require('body-parser')
  , segment = require('analytics-node')
  , raven = require('raven')
  , redis = require('redis')
  , url = require('url');

var app = express();

// Setup environment variables
require('./utils/env')(app);

// Setup Segment analytics
app.analytics = new segment(app.get('segment'));

// Setup Sentry
app.sentry = new raven.Client(app.get('sentry'));

if (app.get('env') === 'production') {
  app.sentry.patchGlobal();
}

// Setup middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Setup logger
require('./utils/logger')(app);

// Setup database handler
var db = nano(app.get('db')).use(app.get('dbname'));

// Setup redis
var redisUrl = url.parse(app.get('redis'));

app.redis = redis.createClient(redisUrl.port, redisUrl.hostname, {enable_offline_queue: false});

if (redisUrl.auth) {
  app.redis.auth(redisUrl.auth.split(':')[1]);
}

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

// Heroku addon
require('./api/heroku')(app, db);

// Error handling
require('./utils/error')(app);

// Start Server
var server = app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
