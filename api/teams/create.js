module.exports = function (app, db) {

  // Create a team
  app.post('/orgs/:org/teams', app.auth.owner, app.auth.noHeroku, function (req, res, next) {
    app.utils.permit(req, ['name', 'description']);

    // Check for required params
    var errs = app.utils.need(req, ['name', 'description']);
    var name = req.body.name;

    if (typeof name !== 'string' || name.length < 3 || name.length > 15 || name.match(/[a-z0-9][a-z0-9\ ]*[a-z0-9]/i)[0] !== name) {
      errs.push({ field: 'name', code: 'invalid' });
    }

    if (errs.length > 0) {
      return app.errors.validation(res, errs);
    }

    var org = app.utils.slug(req.org)
      , team = app.utils.idify(name);

    // Search for existing team name
    db.view('teams', 'name', {keys: [org + '/' + team]}, function (err, body) {
      if (err) return next(err);

      if (body.rows.length > 0) {
        return app.errors.validation(res, [{ field: 'name', code: 'already_exists' }]);
      }

      req.body.type = 'team';
      req.body.users = {};
      req.body.users[req.org.owner] = true;
      req.body.org = org;
      req.body._id = 'orgs/' + org + '/teams/' + team;

      req.org.users[req.org.owner]++;

      // Insert team
      db.bulk({docs: [req.body, req.org]}, {all_or_nothing: true}, function (err, body) {
        if (err) return next(err);

        req.body.users = Object.keys(req.body.users);

        res.status(201);
        res.json(req.body);
      });
    });
  });
};
