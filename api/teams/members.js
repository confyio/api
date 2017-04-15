var validator = require('validator');

module.exports = function (app, db) {

  var sendResponse = function (req, res) {
    req.team.users = Object.keys(req.team.users);
    app.utils.shield(req.team, ['_rev']);
    res.json(req.team);
  };

  var check = function (req, res, checkForEmail) {
    app.utils.permit(req, ['user']);

    // Check for required params
    var errs = app.utils.need(req, ['user']);
    var user = req.body.user;

    if (typeof user !== 'string' || user.length < 3 || user.length > 15 || user.match(/[a-z0-9]*/i)[0] !== user) {
      if (typeof user === 'string' && checkForEmail && validator.isEmail(user)) {
        return false;
      }

      errs.push({ field: 'user', code: 'invalid' });
    }

    if (errs.length > 0) {
      app.errors.validation(res, errs);
      return true;
    }

    return false;
  };

  var update = function (docs, req, res, next) {
    docs.push(req.team);
    docs.push(req.org);

    db.bulk({docs: docs}, {all_or_nothing: true}, function (err, body) {
      if (err) return next(err);

      sendResponse(req, res);
    });
  };

  var addUser = function (user, req, res, next) {
    // If user is already a member
    if (req.team.users[user] === true) {
      return sendResponse(req, res);
    }

    module.exports.addUserInDB(app, db, user, req.org, req.team, function (err, docs) {
      if (err) return next(err);

      update(docs, req, res, next);
    });
  };

  app.get('/orgs/:orgname/teams/:team/member', app.auth.team, function (req, res, next) {
    db.view('users', 'username', {keys: Object.keys(req.team.users)}, function (err, body) {
      if (err) return next(err);

      var members = body.rows.map(function (row) {
        app.utils.shield(row.value, [
          'password', 'access_token', 'verification_token', 'verify_new_email', '_rev'
        ]);

        return row.value;
      });

      res.json(members);
    });
  });

  app.delete('/orgs/:org/teams/:team/member', app.auth.owner, function (req, res, next) {
    if (check(req, res)) return;

    var org = app.utils.slug(req.org)
      , team = app.utils.idify(req.team.name)
      , user = req.body.user.toLowerCase();

    // If user is the default user
    if (req.org.owner == user) {
      return app.errors.validation(res, [{ field: 'user', code: 'forbidden' }]);
    }

    // If user is not a member
    if (req.team.users[user] === undefined) {
      return sendResponse(req, res);
    }

    db.view('projects', 'team', {keys:[org + '/' + team]}, function (err, body) {
      if (err) return next(err);

      var docs = body.rows.map(function (row) {
        row.value.users[user]--;

        if (row.value.users[user] === 0) {
          delete row.value.users[user];
        }

        return row.value;
      });

      // Update the data
      delete req.team.users[user];
      req.org.users[user]--;

      if (req.org.users[user] === 0) {
        delete req.org.users[user];
      }

      update(docs, req, res, next);
    });
  });

  app.post('/orgs/:org/teams/:team/member', app.auth.owner, function (req, res, next) {
    if (check(req, res, true)) return;

    var org = app.utils.slug(req.org)
      , team = app.utils.idify(req.team.name)
      , user = req.body.user.toLowerCase();

    if (!validator.isEmail(user)) {
      // Check if user exists
      db.get('users/' + user, function (err, body) {
        if (err) {
          if (err.message === 'missing') {
            return app.errors.validation(res, [{ field: 'user', code: 'does_not_exist' }]);
          } else return next(err);
        }

        addUser(user, req, res, next);
      });
    } else {
      db.view('users', 'email', {keys: [user]}, function (err, body) {
        if (err) return next(err);

        if (body.rows.length === 0) {
          // Send invitation
          return db.insert({
            _id: 'invites/' + user,
            org: req.org._id,
            team: req.team._id,
            type: 'invite'
          }, function (err, body) {
            if (err) {
              // Already invited
              if (err.error === 'conflict') {
                return sendResponse(req, res);
              }

              return next(err);
            }

            app.analytics.track({ userId: user, event: 'Invited' });
            app.mail.invitation(user, {email: user, org: req.org, team: req.team, user: req.user}, app.errors.capture());

            sendResponse(req, res);
          });
        }
        
        addUser(body.rows[0].value.username, req, res, next);
      });
    }
  });
};

module.exports.addUserInDB = function (app, db, user, org, team, callback) {
  // Update projects
  db.view('projects', 'team', {
    keys:[app.utils.slug(org) + '/' + app.utils.idify(team.name)]
  }, function (err, body) {
    if (err) return callback(err);

    var docs = body.rows.map(function (row) {
      if (row.value.users[user] === undefined) {
        row.value.users[user] = 0;
      }

      row.value.users[user]++;

      return row.value;
    });

    // Update the data
    team.users[user] = true;

    if (org.users[user] === undefined) {
      org.users[user] = 0;
    }

    org.users[user]++;

    if (callback) callback(null, docs);
  });
};
