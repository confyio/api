var crypto = require('crypto');

module.exports = function (app, db) {

  // Create an user
  app.post('/user', function (req, res, next) {
    var news = req.body.news || false;

    app.utils.permit(req, ['username', 'email', 'password', 'fullname']);

    // Check for required params
    var errs = app.utils.need(req, ['username', 'email', 'password'])
      , user = req.body.username;

    if (typeof user != 'string' || user.match(/[a-z0-9]*/i)[0] != user) {
      errs.push({ field: 'username', code: 'invalid' });
    }

    if (typeof req.body.password != 'string' || req.body.password.length < 6) {
      errs.push({ field: 'password', code: 'insecure' });
    }

    // TODO: Validate email

    if (errs.length > 0) {
      return app.errors.validation(res, errs);
    }

    // Search for existing email
    db.view('users', 'email', {keys: [req.body.email]}, function (err, body) {
      if (err) return next(err);

      if (body.rows.length > 0) {
        return app.errors.validation(res, [{ field: 'email', code: 'already_exists' }]);
      }

      req.body.username = req.body.username.toLowerCase();

      // Search for existing username
      db.view('orgs', 'name', {keys: [req.body.username]}, function (err, body) {
        if (err) return next(err);

        if (body.rows.length > 0) {
          return app.errors.validation(res, [{ field: 'username', code: 'already_exists' }]);
        }

        // Encrypting password is done when inserting the document

        if (!req.body.fullname) {
          req.body.fullname = req.body.username;
        }

        req.body.verified = false;
        req.body.verification_token = crypto.randomBytes(20).toString('hex');

        // Insert user
        db.bulk(app.bulk.user(req.body), {all_or_nothing: true, new_edits: false}, function (err, body) {
          if (err) return next(err);

          app.utils.shield(req.body, ['password', 'verification_token']);
          res.status(201);
          res.json(req.body);

          // TODO: Insert into 'news' mailing list
          app.mail.verification(req.body.email, req.body, app.errors.capture());
          app.analytics.track({ userId: req.body.username, event: 'Registered' });
        });
      });
    });
  });
};
