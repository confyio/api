module.exports = function (app, db) {

  var check = function (req, res) {
    app.utils.permit(req, ['team']);

    // Check for required params
    var errs = app.utils.need(req, ['team']);
    var team = req.body.team;

    if (typeof team !== 'string' || team.length < 3 || team.length > 15 || team.match(/[a-z0-9][a-z0-9-]*[a-z0-9]/i)[0] !== team) {
      errs.push({ field: 'team', code: 'invalid' });
    }

    if (errs.length > 0) {
      app.errors.validation(res, errs);
      return true;
    }

    return false;
  };

  var update = function (req, res, next) {
    db.insert(req.project, req.project._id, function (err, body) {
      if (err) return next(err);

      if (body.ok) {
        req.project.teams = Object.keys(req.project.teams);
        app.utils.shield(req.project, ['users', '_rev']);
        res.json(req.project);
      } else next();
    });
  };

  app.get('/orgs/:orgname/projects/:project/access', app.auth.project, function (req, res, next) {
    var org = app.utils.slug(req.org);

    var keys = Object.keys(req.project.teams).map(function (team) {
      return org + '/' + team;
    });

    db.view('teams', 'name', {keys: keys}, function (err, body) {
      if (err) return next(err);

      var teams = body.rows.map(function (row) {
        if (row.value.users[req.user.username] === undefined) {
          return;
        }

        app.utils.shield(row.value, ['_rev']);
        row.value.users = Object.keys(row.value.users);
        return row.value;
      });

      teams = app.utils.compact(teams);
      res.json(teams);
    });
  });

  app.delete('/orgs/:org/projects/:project/access', app.auth.owner, function (req, res, next) {
    if (check(req, res)) return;

    var org = app.utils.slug(req.org)
      , team = app.utils.idify(req.body.team);

    // If team is the default team
    if (team === 'owners') {
      return app.errors.validation(res, [{ field: 'team', code: 'forbidden'}]);
    }

    // If team does not have access
    if (req.project.teams[team] === undefined) {
      req.project.teams = Object.keys(req.project.teams);
      app.utils.shield(req.project, ['users', '_rev']);
      return res.json(req.project);
    }

    db.get('orgs/' + org + '/teams/' + team, function (err, body) {
      if (err) return next(err);

      // Update the project
      delete req.project.teams[team];

      Object.keys(body.users).forEach(function (user) {
        req.project.users[user]--;

        if (req.project.users[user] === 0) {
          delete req.project.users[user];
        }
      });

      update(req, res, next);
    });
  });

  app.post('/orgs/:org/projects/:project/access', app.auth.owner, function (req, res, next) {
    if (check(req, res)) return;

    var org = app.utils.slug(req.org)
      , team = app.utils.idify(req.body.team);

    // Check if team exists
    db.get('orgs/' + org + '/teams/' + team, function (err, body) {
      if (err) {
        if (err.message === 'missing') {
          return app.errors.validation(res, [{ field: 'team', code: 'does_not_exist' }]);
        } else return next(err);
      }

      // If team already has access
      if (req.project.teams[team] === true) {
        req.project.teams = Object.keys(req.project.teams);
        app.utils.shield(req.project, ['users', '_rev']);
        return res.json(req.project);
      }

      // Update the project
      req.project.teams[team] = true;

      Object.keys(body.users).forEach(function (user) {
        if (req.project.users[user] === undefined) {
            req.project.users[user] = 0;
        }

        req.project.users[user]++;
      });

      update(req, res, next);
    });
  });
};
