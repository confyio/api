var update = function (app, db) {
  return function (req, res, next) {
    app.utils.forbid(req, ['_id']);

    if (req.body._encrypted) {
      req.body = req.body._encrypted;
    }

    // Update data
    req.env.config = req.body;

    // Update versions
    req.env.versions.push({
      config: req.body, time: Date.now()
    });

    if (req.env.versions.length > 10) {
      req.env.versions.shift();
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

  app.get('/orgs/:orgname/projects/:project/envs/:env/config', app.auth.project, function (req, res, next) {
    res.json(req.env.config);
  });

  app.put('/orgs/:orgname/projects/:project/envs/:env/config', app.auth.project, update(app, db));
};

module.exports.update = update;
