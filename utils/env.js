module.exports = function (app) {

  app.set('env', process.env.NODE_ENV || 'development');
  app.set('port', process.env.PORT || 5000);

  app.set('db', process.env.CLOUDANT_URL || 'http://localhost:5984');
  app.set('dbname', process.env.CLOUDANT_DBNAME || 'confy');

  app.set('ssl', process.env.SSL || 0);

  app.set('baseurl', process.env.BASE_URL || 'http://localhost:' + app.get('port'));
  app.set('weburl', process.env.WEB_URL || 'http://localhost:8000');

  app.set('addonkey', process.env.ADDON_KEY || 'thisisasampleherokuaddonpassword');
  app.set('addonsso', process.env.ADDON_SSO || 'thisisasampleherokuaddonsso_salt');

  app.set('mailgun-key', process.env.MAILGUN_API_KEY);
  app.set('mailgun-domain', process.env.MAILGUN_DOMAIN);

  app.set('redis', process.env.REDISCLOUD_URL || 'redis://localhost:6379');

  app.set('sentry', process.env.SENTRY_URL || false);
  app.set('segment', process.env.SEGMENT_KEY || 'V9kSmRvA2aBD2azy4t8SKMdXACKBYtak');

  app.set('stripe', process.env.STRIPE_SECRET_KEY || 'sk_test_MAO8DoOXNpzdBm44T0G8qK9b');
};
