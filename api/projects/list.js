module.exports = function (app, db) {

  // List all projects the user has access to
  app.get('/orgs/:org/projects', app.auth.user, function (req, res, next) {
    db.view('projects', 'user', {keys: [app.utils.slug(req.org) + '/' + req.user.username]}, function (err, body) {
      if (err) return next(err);

      if (body.rows) {
        body = body.rows.map(function (row) {
          app.utils.shield(row.value, ['users', '_rev']);
          row.value.teams = Object.keys(row.value.teams);
          return row.value;
        });

        res.json(body);
      } else next();
    });
  });
};
