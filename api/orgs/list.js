module.exports = function (app, db) {

  // List all orgs
  app.get('/orgs', app.auth.user, function (req, res, next) {
    db.view('orgs', 'user', {keys: [req.user.username]}, function (err, body) {
      if (err) return next(err);

      var orgs = body.rows.map(function (row) {
        app.utils.shield(row.value, ['users', '_rev']);
        return row.value;
      });

      res.json(orgs);
    });
  });
};
