module.exports = function (app, db) {

  // Delete a team
  app.delete('/orgs/:org/teams/:team', app.auth.owner, app.auth.noHeroku, function (req, res, next) {
    var org = app.utils.slug(req.org)
      , team = app.utils.idify(req.team.name);

    // If team is the default team
    if (team === 'owners') {
      return app.errors.validation(res, [{ field: 'team', code: 'forbidden' }]);
    }

    // Update projects
    db.view('projects', 'team', {keys:[org + '/' + team]}, function (err, body) {
      if (err) return next(err);

      var docs = body.rows.map(function (row) {
        delete row.value.teams[team];

        Object.keys(req.team.users).forEach(function (user) {
          row.value.users[user]--;

          if (row.value.users[user] === 0) {
            delete row.value.users[user];
          }
        });

        return row.value;
      });

      // Update data
      req.team._deleted = true;

      Object.keys(req.team.users).forEach(function (user) {
        req.org.users[user]--;

        if (req.org.users[user] === 0) {
          delete req.org.users[user];
        }
      });

      docs.push(req.org);
      docs.push(req.team);

      db.bulk({docs: docs}, {all_or_nothing: true}, function (err, body) {
        if (err) return next(err);

        res.sendStatus(204);
      });
    });
  });
};
