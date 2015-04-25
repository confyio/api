var bcrypt = require('bcrypt');

var authorization = function (req) {
  var auth = '', type = '', result = {
    basic: null,
    token: null
  };

  if (typeof req.headers.authorization === 'string') {
    auth = req.headers.authorization.substr(6).trim();
    type = req.headers.authorization.substr(0, 5);
  }

  if (type.toLowerCase() === 'basic') {
    auth = new Buffer(auth, 'base64').toString();

    result.basic = {
      username: auth.substr(0, auth.indexOf(':')),
      password: auth.substr(auth.indexOf(':') + 1)
    };
  } else if (type.toLowerCase() === 'token') {
    result.token = auth;
  }

  if (typeof req.query.access_token === 'string') {
    result.token = req.query.access_token;
  }

  return result;
};

module.exports = function (app, db) {
  app.auth = {};

  app.auth.user = function (req, res, next) {
    var auth = authorization(req);

    if (auth.basic !== null) {
      // Fetching user with username
      return db.get('users/' + auth.basic.username, function (err, body) {
        if (err && err.reason !== 'missing') {
          return next(err);
        }

        if (body && !body.verified) {
          return app.errors.unverified(res);
        }

        // Comparing password
        if (body && bcrypt.compareSync(auth.basic.password, body.password)) {
          req.user = body;
          return next();
        }

        return app.errors.auth(res);
      });
    }

    if (auth.token !== null) {
      // Fetching user with access token
      return app.redis.get('confy_' + auth.token, function (err, body) {
        if (err) return next(err);

        if (body) {
          try {
            req.user = JSON.parse(body);
            req.access_token = auth.token;

            return next();
          } catch (err) {
            app.sentry.captureError(err);
          }
        }

        db.view('users', 'token', {keys: [auth.token]}, function (err, body) {
          if (err) return next(err);

          if (body.rows.length !== 1) {
            return app.errors.auth(res);
          }

          if (body.rows[0].value && !body.rows[0].value.verified) {
            return app.errors.unverified(res);
          }

          req.user = body.rows[0].value;
          req.access_token = auth.token;

          return next();
        });
      });
    }

    return app.errors.auth(res);
  };

  app.auth.owner = function (req, res, next) {
    app.auth.user(req, res, function (err) {
      if (err) return next(err);

      if (req.org.users[req.user.username] === undefined) {
        return app.errors.notfound(res);
      }

      if (req.org.owner !== req.user.username) {
        return app.errors.auth(res);
      }

      return next();
    });
  };

  app.auth.project = function (req, res, next) {
    app.auth.user(req, res, function (err) {
      if (err) return next(err);

      if (req.project.users[req.user.username] === undefined) {
        return app.errors.notfound(res);
      }

      return next();
    });
  };

  app.auth.team = function (req, res, next) {
    app.auth.user(req, res, function (err) {
      if (err) return next(err);

      if (req.team.users[req.user.username] === undefined) {
        return app.errors.notfound(res);
      }

      return next();
    });
  };

  app.auth.heroku = function (req, res, next) {
    var auth = authorization(req);

    if (auth.basic === null || auth.basic.username !== 'confy' || auth.basic.password !== app.get('addonkey')) {
      return app.errors.auth(res);
    }

    return next();
  };

  app.auth.noHeroku = function (req, res, next) {
    if (req.user.heroku !== undefined && req.user.heroku) {
        return app.errors.forbidden(res);
    }

    return next();
  };

  app.auth.configHeroku = function (req, res, next) {
    if (req.user.heroku === undefined || !req.user.heroku) {
        return app.errors.forbidden(res);
    }

    var id = 'orgs/' + req.user.username + '/projects/app/envs/production';

    db.get(id, function (err, body) {
      if (err && err.reason !== 'missing') {
        return next(err);
      }

      if (body) {
        req.env = body;
        return next();
      }

      return app.errors.notfound(res);
    });
  };
};
