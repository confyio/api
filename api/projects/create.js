var tokenUnique = require('../envs/create').tokenUnique;

module.exports = function (app, db) {

  // Create a project
  app.post('/orgs/:org/projects', app.auth.owner, app.auth.noHeroku, function (req, res, next) {
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

    // Search for existing project name
    db.view('projects', 'name', {keys: [app.utils.slug(req.org) + '/' + app.utils.idify(name)]}, function (err, body) {
      if (err) return next(err);

      if (body.rows.length > 0) {
        return app.errors.validation(res, [{ field: 'name', code: 'already_exists' }]);
      }

      req.body.users = {};

      // Get members from 'owners' team
      db.get(req.org._id + '/teams/owners', function (err, body) {
        if (err) return next(err);

        Object.keys(body.users).forEach(function (user) {
          req.body.users[user] = 1;
        });

        tokenUnique(req.org.name, db, function (err, token) {
          if (err) return next(err);

          // Insert project
          db.bulk(app.bulk.project(req.body, req.org, token), {all_or_nothing: true}, function (err, body) {
            if (err) return next(err);

            req.body.teams = Object.keys(req.body.teams);
            delete req.body.users;

            res.status(201);
            res.json(req.body);
          });
        });
      });
    });
  });
};
