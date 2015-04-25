module.exports = function (app, db) {

  app.param('user', function (req, res, next, user) {
    db.get('users/' + user, function (err, body) {
      if (err && err.reason !== 'missing') {
        return next(err);
      }

      if (body) {
        req.user = body;
        return next();
      }

      return app.errors.notfound(res);
    });
  });

  require('./retrieve')(app, db);
  require('./update')(app, db);
  require('./create')(app, db);

  require('./verify')(app, db);
  require('./login')(app, db);
  require('./forgot')(app, db);
};
