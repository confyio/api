var tokenUnique = require('./create').tokenUnique;

module.exports = function (app, db) {

  // Reset environment's read-only token
  app.post('/orgs/:orgname/projects/:project/envs/:env/token', app.auth.project, function (req, res, next) {

    // Get unique token
    tokenUnique(req.org.name, db, function (err, token) {
      if (err) return next(err);

      req.env.token = token;

      db.bulk({docs: [req.env]}, {all_or_nothing: true}, function (err, body) {
        if (err) return next(err);

        res.status(201);
        app.utils.shield(req.env, ['config', 'versions', '_rev']);
        res.json(req.env);
      });
    });
  });
};
