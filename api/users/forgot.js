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

      if (body.rows.length !== 1) {
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

  app.post('/users/:user/forgot/:token', function (req, res, next) {
    if (req.user.reset_token !== req.params.token || !req.user.reset_expire || req.user.reset_expire < new Date().getTime()) {
      res.status(400);
      return res.json({ message: 'Invalid reset password token' });
    }

    delete req.user.reset_token;
    delete req.user.reset_expire;

    req.user.password = cryptPass(req.body.password);

    db.insert(user, user._id, function (err, body) {
      if (err) return next(err);

      if (body.ok) {
        app.mail.reset_password(user.email, user, app.errors.capture());
        app.analytics.track({ userId: user.username, event: 'Reset password' });

        res.sendStatus(204);
      } else next();
    });
  });
};
