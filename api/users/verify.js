var crypto = require('crypto')
  , login = require('./login').login;

module.exports = function (app, db) {

  // Verify a user
  app.get('/users/:user/verify/:token', function (req, res, next) {
    if (req.user.verification_token !== req.params.token) {
      res.status(400);
      return res.json({ message: 'Invalid verification token' });
    }

    req.user.verified = true;
    delete req.user.verification_token;

    var mail_template = 'welcome';

    if (req.user.verify_new_email) {
      delete req.user.verify_new_email;
      mail_template = 'new_email';
    }

    db.insert(req.user, req.user._id, function (err, body) {
      if (err) return next(err);

      if (body.ok) {
        login(app, false, req, res, next, function () {
          app.mail[mail_template](req.user.email, req.user, app.errors.capture());
          app.analytics.track({ userId: req.user.username, event: 'Verified Email' });
        });
      } else next();
    });
  });
};
