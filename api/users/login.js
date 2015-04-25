var crypto = require('crypto');

var login = function (app, remember, req, res, next, callback) {

  var expire = (remember ? 14 : 1)*24*3600
    , access_token = crypto.randomBytes(20).toString('hex');

  app.utils.shield(req.user, [
    'password', 'access_token', 'verification_token', 'verify_new_email', '_rev'
  ]);

  app.redis.setex('confy_' + access_token, expire, JSON.stringify(req.user), function (err, body) {
    if (err) return next(err);

    if (body === 'OK') {
      app.utils.merge(req.user, {token: access_token});

      res.status(200);
      res.json(req.user);

      if (callback) return callback();
    } else next();
  });
};

module.exports = function (app, db) {

  // Login a user
  app.post('/user/login', app.auth.user, function (req, res, next) {
    if (req.access_token !== undefined) {
      return app.errors.auth(res);
    }

    login(app, req.body.remember, req, res, next, function () {
      app.analytics.track({ userId: req.user.username, event: 'Logged on Backend' });
    });
  });

  // Logout a user
  app.get('/user/logout', app.auth.user, function (req, res, next) {
    if (req.access_token === undefined) {
      return res.sendStatus(204);
    }

    app.redis.del('confy_' + req.access_token, function (err, body) {
      if (err) return next(err);

      if (body) {
        res.sendStatus(204);
        app.analytics.track({ userId: req.user.username, event: 'Logged out' });
      } else next();
    });
  });

  // SSO a user
  app.post('/user/sso', function (req, res, next) {
    var token = req.body.id + ':' + app.get('addonsso') + ':' + req.body.timestamp
      , hash = crypto.createHash('sha1').update(token).digest('hex');

    if (req.body.token !== hash || (Date.now()/1000 - 300) > parseInt(req.body.timestamp)) {
      return app.errors.forbidden(res);
    }

    db.get('users/' + req.body.id, function (err, user) {
      if (err) return next(err);

      user.access_token = crypto.randomBytes(20).toString('hex');

      // TODO: Use redis
      db.insert(user, user._id, function (err, body) {
        if (err) return next(err);

        if (body.ok) {
          res.status(201);
          res.json({
            heroku: req.body['nav-data'],
            token: user.access_token
          });
        } else next();
      });
    });
  });
};

module.exports.login = login;
