module.exports = function (app, db) {

  // List all versions of an environment
  app.get('/orgs/:orgname/projects/:project/envs/:env/versions', app.auth.project, function (req, res, next) {
    var versions = req.env.versions;

    var users = versions.map(function (version) {
      return version.user;
    });

    var userObjs = {};

    db.view('users', 'username', {keys: users}, function (err, body) {
      if (err) return next(err);

      var members = body.rows.map(function (row) {
        app.utils.shield(row.value, [
          'password', 'access_token', 'verification_token', 'verify_new_email', '_rev'
        ]);

        return row.value;
      });

      for (var i = 0; i < members.length; i++) {
        userObjs[members[i].username] = members[i];
      }

      for (var i = 0; i < versions.length; i++) {
        versions[i].user = userObjs[versions[i].user];
      }

      res.json(versions);
    });
  });
};
