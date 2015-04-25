var crypto = require('crypto');
var bcrypt = require('bcrypt');

var cryptPass = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

module.exports = function (app, db) {

  // Reuqest reset password
  app.get('/user/forgot/:email', function (req, res, next) {

    // Search for existing user with associated mail
    db.view('users', 'email', {keys: [req.params.email]}, function (err, body) {
      if (err) return next(err);

      if (body.rows.length != 1) {
        return app.errors.notfound(res);
      }

      // Update the user
      var user = body.rows[0].value;

      user.reset_token = crypto.randomBytes(20).toString('hex');
      user.reset_expire = new Date().getTime() + 3600*1000;

      // Update the database
      db.insert(user, user._id, function (err, body) {
        if (err) return next(err);

        if (body.ok) {
          app.analytics.track({ userId: user.username, event: 'Forgot password' });
          app.mail.forgot_password(user.email, user, app.errors.capture());

          res.sendStatus(204);
        } else next();
      });
    });
  });

  app.post('/user/forgot', function (req, res, next) {

    // Search for existing user with associated reset token
    db.view('users', 'reset_token', {keys: [req.body.reset_token]}, function (err, body) {
      if (err) return next(err);

      if (body.rows.length != 1) {
        return app.errors.notfound(res);
      }

      var user = body.rows[0].value;

      if (!user.reset_expire || user.reset_expire < new Date().getTime()) {
        return app.errors.forbidden(res);
      }

      // Update the user
      delete user.reset_token;
      delete user.reset_expire;

      user.password = cryptPass(req.body.password);

      // Update the database
      db.insert(user, user._id, function (err, body) {
        if (err) return next(err);

        if (body.ok) {
          app.analytics.track({ userId: user.username, event: 'Reset password' });
          app.mail.reset_password(user.email, user, app.errors.capture());

          res.sendStatus(204);
        } else next();
      });
    });
  });
};
