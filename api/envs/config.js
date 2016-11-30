var update = function (app, db) {
  return function (req, res, next) {
    app.utils.forbid(req, ['_id']);

    if (req.body._encrypted) {
      req.body = req.body._encrypted;
    }

    // Update data
    req.env.config = req.body;

    // Update versions
    req.env.versions.unshift({
      config: req.body,
      user: req.user.username,
      time: Date.now()
    });

    if (req.env.versions.length > 10) {
      req.env.versions.pop();
    }

    db.insert(req.env, req.env._id, function (err, body) {
      if (err) return next(err);

      if (body.ok) {
        res.json(req.env.config);
      } else return next();
    });
  };
};

module.exports = function (app, db) {

  app.get('/orgs/:orgname/config/:token', function (req, res, next) {
    db.view('envs', 'token', {keys: [req.params.token]}, function (err, body) {
      if (err || body.rows.length != 1) return next(err);

      if (body.rows[0].value.org != req.org.name) {
        return next();
      }

      res.json(body.rows[0].value.config);
    });
  });

  app.get('/orgs/:orgname/projects/:project/envs/:env/config', app.auth.project, function (req, res, next) {
    res.json(req.env.config);
  });

  app.put('/orgs/:orgname/projects/:project/envs/:env/config', app.auth.project, update(app, db));
};

module.exports.update = update;
