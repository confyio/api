var crypto = require('crypto');

module.exports = function (app, db) {

  // Update an user
  app.patch('/user', app.auth.user, function (req, res, next) {
    app.utils.permit(req, ['email']);

    // If updating email, send verification email
    if (req.body.email) {
      // TODO: Send verification email
      req.body.verified = false;
      req.body.verification_token = crypto.randomBytes(20).toString('hex');
    }

    app.utils.merge(req.user, req.body);

    db.insert(req.user, req.user._id, function (err, body) {
      if (err) return next(err);

      if (body.ok) {
        app.utils.shield(req.user, ['password', 'verification_token', '_rev']);
        res.json(req.user);
      } else next();
    });
  });
};
