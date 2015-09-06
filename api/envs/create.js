module.exports = function (app, db) {

  // Create an environment
  app.post('/orgs/:orgname/projects/:project/envs', app.auth.project, function (req, res, next) {
    app.utils.permit(req, ['name', 'description']);

    // Check for required params
    var errs = app.utils.need(req, ['name', 'description']);
    var name = req.body.name;

    if (typeof name !== 'string' || name.length < 3 || name.length > 15 || (name.match(/[a-z0-9][a-z0-9\ ]*[a-z0-9]/i) || [''])[0] !== name) {
      errs.push({ field: 'name', code: 'invalid' });
    }

    if (errs.length > 0) {
      return app.errors.validation(res, errs);
    }

    var org = app.utils.slug(req.org)
      , project = app.utils.idify(req.project.name)
      , env = app.utils.idify(name);

    // Search for existing environment name
    db.view('envs', 'name', {keys: [org + '/' + project + '/' + env]}, function (err, body) {
      if (err) return next(err);

      if (body.rows.length > 0) {
        return app.errors.validation(res, [{ field: 'name', code: 'already_exists' }]);
      }

      req.body.type = 'env';
      req.body.project = project;
      req.body.org = org;
      req.body._id = 'orgs/' + org + '/projects/' + project + '/envs/' + env;
      req.body.config = {};

      // Insert environment
      db.bulk(app.bulk.env(req.body, req.project), {all_or_nothing: true, new_edits: false}, function (err, body) {
        if (err) return next(err);

        res.status(201);
        app.utils.shield(req.body, ['config', 'versions']);
        res.json(req.body);
      });
    });
  });
};
