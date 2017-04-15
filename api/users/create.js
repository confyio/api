var crypto = require('crypto')
  , validator = require('validator')
  , addUserInDB = require('../teams/members').addUserInDB;

module.exports = function (app, db) {

  var insertUser = function (news, docs, req, res, next) {
    db.bulk(app.bulk.user(req.body, docs), {all_or_nothing: true, new_edits: false}, function (err, body) {
      if (err) return next(err);

      if (news) {
        app.mail.list('news', req.body, app.errors.capture());
      }

      app.analytics.identify({
        userId: req.body.username,
        traits: {
          name: req.body.fullname,
          username: req.body.username,
          email: req.body.email
        }
      });

      app.mail.verification(req.body.email, req.body, app.errors.capture());
      app.analytics.track({ userId: req.body.username, event: 'Registered' });

      app.utils.shield(req.body, ['password', 'verification_token']);
      res.status(201);
      res.json(req.body);
    });
  };

  // Create an user
  app.post('/user', function (req, res, next) {
    var news = req.body.news || false;

    var missingError = function (err, docs) {
      if (err.reason !== 'missing') return next(err);

      return insertUser(news, docs, req, res, next);
    };

    app.utils.permit(req, ['username', 'email', 'password', 'fullname']);

    // Check for required params
    var errs = app.utils.need(req, ['username', 'email', 'password'])
      , user = req.body.username;

    if (typeof user !== 'string' || user.length < 3 || user.length > 15 || user.match(/[a-z0-9]*/i)[0] !== user) {
      errs.push({ field: 'username', code: 'invalid' });
    }

    if (typeof req.body.password !== 'string' || req.body.password.length < 6) {
      errs.push({ field: 'password', code: 'insecure' });
    }

    if (!req.body.email || !validator.isEmail(req.body.email)) {
      errs.push({ field: 'email', code: 'invalid' });
    }

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

        if (!app.get('onpremise')) {
          req.body.verified = false;
          req.body.verification_token = crypto.randomBytes(20).toString('hex');
        }
        else {
          req.body.verified = true;
        }

        // Check for team invitations
        db.get('invites/' + req.body.email, function (err, body) {
          if (err) return missingError(err, []);

          // Add to team
          var inviteDoc = body;
          inviteDoc._deleted = true;

          db.get(inviteDoc.org, function (err, body) {
            if (err) return missingError(err, [inviteDoc]);

            var org = body;

            db.get(inviteDoc.team, function (err, body) {
              if (err) return missingError(err, [inviteDoc]);

              var team = body;

              addUserInDB(app, db, req.body.username, org, team, function (err, docs) {
                if (err) return next(err);

                insertUser(news, docs.concat([inviteDoc, org, team]), req, res, next);
              });
            });
          });
        });
      });
    });
  });
};
