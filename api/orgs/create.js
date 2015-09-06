var validator = require('validator');

module.exports = function (app, db) {

  // Create an org
  app.post('/orgs', app.auth.user, app.auth.noHeroku, function (req, res, next) {
    app.utils.permit(req, ['name', 'email']);

    // Check for required params
    var errs = app.utils.need(req, ['name', 'email']);
    var name = req.body.name;

    if (typeof name !== 'string' || name.length < 3 || name.length > 15 || (name.match(/[a-z0-9][a-z0-9\ ]*[a-z0-9]/i) || [''])[0] !== name) {
      errs.push({ field: 'name', code: 'invalid' });
    }

    if (!validator.isEmail(req.body.email)) {
      errs.push({ field: 'email', code: 'invalid' });
    }

    if (errs.length > 0) {
      return app.errors.validation(res, errs);
    }

    // Search for existing orgname
    db.view('orgs', 'name', {keys: [app.utils.idify(name)]}, function (err, body) {
      if (err) return next(err);

      if (body.rows.length > 0) {
        return app.errors.validation(res, [{ field: 'name', code: 'already_exists' }]);
      }

      // Insert org
      db.bulk(app.bulk.org(req.body, req.user), {all_or_nothing: true}, function (err, body) {
        if (err) return next(err);

        res.status(201);
        app.utils.shield(req.body, ['users']);
        res.json(req.body);
      });
    });
  });
};
