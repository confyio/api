module.exports = function (app, db) {

  app.utils.deleteOrg = function (docs, org, next) {
    var orgname = app.utils.idify(org.name);

    // Delete projects
    db.view('projects', 'org', {keys:[orgname]}, function (err, body) {
      if (err) return next(err);

      body.rows.map(function (row) {
        row.value._deleted = true;
        docs.push(row.value);
      });

      // Delete teams
      db.view('teams', 'org', {keys:[orgname]}, function (err, body) {
        if (err) return next(err);

        body.rows.forEach(function (row) {
          row.value._deleted = true;
          docs.push(row.value);
        });

        // Delete environments
        db.view('envs', 'org', {keys:[orgname]}, function (err, body) {
          if (err) return next(err);

          body.rows.forEach(function (row) {
            row.value._deleted = true;
            docs.push(row.value);
          });

          // Update data
          org._deleted = true;

          docs.push(org);

          db.bulk({docs: docs}, {all_or_nothing: true}, function (err, body) {
            return next(err);
          });
        });
      });
    });
  };

  // Delete an org
  app.delete('/orgs/:org', app.auth.owner, app.auth.noHeroku, function (req, res, next) {
    // If team is the default team
    if (app.utils.slug(req.org) === req.user.username) {
      return app.errors.validation(res, [{ field: 'org', code: 'forbidden' }]);
    }

    app.utils.deleteOrg([], req.org, function (err) {
      if (err) return next(err);

      res.sendStatus(204);
    });
  });
};
