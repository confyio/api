module.exports = function (app, db) {

  var check = function (req, res) {
    app.utils.permit(req, ['user']);

    // Check for required params
    var errs = app.utils.need(req, ['user']);
    var user = req.body.user;

    if (typeof user !== 'string' || user.match(/[a-z0-9]*/i)[0] !== user) {
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

      req.team.users = Object.keys(req.team.users);
      app.utils.shield(req.team, ['_rev']);
      res.json(req.team);
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
      req.team.users = Object.keys(req.team.users);
      app.utils.shield(req.team, ['_rev']);
      return res.json(req.team);
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
    if (check(req, res)) return;

    var org = app.utils.slug(req.org)
      , team = app.utils.idify(req.team.name)
      , user = req.body.user.toLowerCase();

    // Check if user exists
    db.get('users/' + user, function (err, body) {
      if (err) {
        if (err.message === 'missing') {
          return app.errors.validation(res, [{ field: 'user', code: 'does_not_exist' }]);
        } else return next(err);
      }

      // If user is already a member
      if (req.team.users[user] === true) {
        req.team.users = Object.keys(req.team.users);
        app.utils.shield(req.team, ['_rev']);
        return res.json(req.team);
      }

      // Update projects
      db.view('projects', 'team', {keys:[org + '/' + team]}, function (err, body) {
        if (err) return next(err);

        var docs = body.rows.map(function (row) {
          if (row.value.users[user] === undefined) {
            row.value.users[user] = 0;
          }

          row.value.users[user]++;

          return row.value;
        });

        // Update the data
        req.team.users[user] = true;

        if (req.org.users[user] === undefined) {
          req.org.users[user] = 0;
        }

        req.org.users[user]++;

        update(docs, req, res, next);
      });
    });
  });

};
