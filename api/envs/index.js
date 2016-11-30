module.exports = function (app, db) {

  // Environment param
  app.param('env', function (req, res, next, env) {
    var id = 'orgs/' + app.utils.slug(req.org) + '/projects/' + app.utils.idify(req.project.name) + '/envs/' + env;

    db.get(id, function (err, body) {
      if (err && err.reason !== 'missing' && err.reason !== 'deleted') {
        return next(err);
      }

      if (body) {
        req.env = body;
        return next();
      }

      return app.errors.notfound(res);
    });
  });

  require('./list')(app, db);
  require('./create')(app, db);

  require('./retrieve')(app, db);
  require('./update')(app, db);
  require('./delete')(app, db);

  require('./config')(app, db);
  require('./versions')(app, db);

  require('./reset')(app, db);
};
