module.exports = function (app, db) {

  // Project param
  app.param('project', function (req, res, next, project) {
    var id = 'orgs/' + app.utils.slug(req.org) + '/projects/' + project;

    db.get(id, function (err, body) {
      if (err && err.reason !== 'missing' && err.reason !== 'deleted') {
        return next(err);
      }

      if (body) {
        req.project = body;
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

  require('./access')(app, db);
};
