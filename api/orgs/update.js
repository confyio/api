var validator = require('validator');

module.exports = function (app, db) {

  // Update an org
  app.patch('/orgs/:org', app.auth.owner, function (req, res, next) {
    app.utils.permit(req, ['email']);
    app.utils.merge(req.org, req.body);

    if (!validator.isEmail(req.body.email)) {
      return app.errors.validation(res, [{ field: 'email', code: 'invalid' }]);
    }

    db.insert(req.org, req.org._id, function (err, body) {
      if (err) return next(err);

      if (body.ok) {
        app.utils.shield(req.org, ['users', '_rev']);
        res.json(req.org);
      } else next();
    });
  });
};
