module.exports = function (app, db) {

  // Delete a project
  app.delete('/orgs/:org/projects/:project', app.auth.owner, app.auth.noHeroku, function (req, res, next) {
    var org = app.utils.slug(req.org)
      , project = app.utils.idify(req.project.name);

    db.view('envs', 'project', {keys:[org + '/' + project]}, function (err, body) {
      var docs = body.rows.map(function (row) {
        row.value._deleted = true;
        return row.value;
      });

      // Update data
      req.project._deleted = true;

      docs.push(req.project);

      db.bulk({docs: docs}, {all_or_nothing: true}, function (err, body) {
        if (err) return next(err);

        res.sendStatus(204);
      });
    });
  });
};
