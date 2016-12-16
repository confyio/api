var crypto = require('crypto')
  , login = require('./login').login
  , validator = require('validator');

module.exports = function (app, db) {

  var update = function (req, res, next) {
    app.utils.merge(req.user, req.body);

    db.insert(req.user, req.user._id, function (err, body) {
      if (err) return next(err);

      if (body.ok) {
        app.analytics.track({ userId: req.user.username, event: 'Updated Profile' });

        if (req.user.verified) {
          return login(app, false, req, res, next);
        }

        app.mail.verification(req.user.email, req.user, app.errors.capture());

        app.utils.shield(req.user, [
          'password', 'access_token', 'verification_token', 'verify_new_email', '_rev'
        ]);

        res.json(req.user);
      } else next();
    });
  };

  // Update an user
  app.patch('/user', app.auth.user, function (req, res, next) {
    if (req.access_token !== undefined) {
      return app.errors.auth(res);
    }

    if (req.body.newPassword) {
      req.body.password = req.body.newPassword;
    }

    app.utils.permit(req, ['email', 'fullname', 'password']);

    var errs = [];

    if (req.body.password && (typeof req.body.password !== 'string' || req.body.password.length < 6)) {
      errs.push({ field: 'newPassword', code: 'insecure' });
    }

    if (req.body.email && !validator.isEmail(req.body.email)) {
      errs.push({ field: 'email', code: 'invalid' });
    }

    if (errs.length > 0) {
      return app.errors.validation(res, errs);
    }

    if (req.body.password) {
      req.body.password = app.bulk.cryptPass(req.body.password);
    }

    // If updating email, send verification email
    if (req.body.email && req.body.email !== req.user.email) {
      req.body.verified = false;
      req.body.verification_token = crypto.randomBytes(20).toString('hex');
      req.body.verify_new_email = true;
    } else {
      return update(req, res, next);
    }

    // Search for existing email
    db.view('users', 'email', {keys: [req.body.email]}, function (err, body) {
      if (err) return next(err);

      if (body.rows.length > 0) {
        return app.errors.validation(res, [{ field: 'email', code: 'already_exists' }]);
      }

      update(req, res, next);
    });
  });
};
