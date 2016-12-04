var assert = require('chai').assert;

module.exports = function (macro) {
  describe('Heroku', function () {

    describe('Updating config with non-heroku user', function () {
      var ret = {};

      before(macro.put('/heroku/config', {}, {user:'jsmith', pass:'secret'}, ret));

      macro.status(403, ret);

      it('should return forbidden', function () {
        assert.deepEqual(ret.body, {'message':'Forbidden action'});
      });
    });

    describe('Updating config with heroku user', function () {
      var ret = {};

      before(macro.put('/heroku/config', {
        port: null, db: 'pavan'
      }, {user:'app123', pass:'password'}, ret));

      macro.status(200, ret);

      describe('should update the env doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/app123/projects/app/envs/production', ret));

        it('should have update config', function () {
          assert.isNull(ret.body.config.port);
          assert.equal(ret.body.config.db, 'pavan');
        });

        it('should have added the new versions', function () {
          assert.equal(ret.body.versions.length, 10);
          assert.isNull(ret.body.versions[0].config.port);
          assert.equal(ret.body.versions[0].config.db, 'pavan');
        });

        it('should have removed the old versions', function () {
          assert.equal(ret.body.versions.length, 10);
          assert.equal(ret.body.versions[9].config.port, 8008);
          assert.equal(ret.body.versions[9].time, 1427633285584);
        });
      });
    });
  });
};
