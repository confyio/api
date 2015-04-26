module.exports = function (app, db) {

  // List all environments of a project
  app.get('/orgs/:orgname/projects/:project/envs', app.auth.project, function (req, res, next) {
    db.view('envs', 'project', {keys: [app.utils.slug(req.org) + '/' + app.utils.idify(req.project.name)]}, function (err, body) {
      if (err) return next(err);

      var envs = body.rows.map(function (row) {
        app.utils.shield(row.value, ['config', 'versions', '_rev']);
        return row.value;
      });

      res.json(envs);
    });
  });
};
