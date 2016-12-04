var assert = require('chai').assert;

module.exports = function (macro) {
  describe('Environment Configuration', function () {

    describe('Updating them with non-member', function () {
      var ret = {};

      before(macro.put('/orgs/confyio/projects/main/envs/production/config', {}, {user: 'jsmith', pass: 'secret'}, ret));

      macro.status(404, ret);

      it('should return not found', function () {
        assert.deepEqual(ret.body, {message: 'Not found'});
      });
    });

    describe('Updating them with member', function () {
      var ret = {};

      before(macro.put('/orgs/confyio/projects/main/envs/production/config', {
        _deleted: true, _id: 'hacked', name: null,
        port: 3000, database: { port: 6984 }
      }, {user: 'pksunkara', pass: 'password'}, ret));

      macro.status(200, ret);

      it('should return updated config', function () {
        assert.equal(ret.body._deleted, true);
        assert.equal(ret.body.port, 3000);
        assert.isNull(ret.body.name);
      });

      it('should not have _id', function () {
        assert.isUndefined(ret.body._id);
      });

      it('should not recursively update', function () {
        assert.equal(ret.body.database.port, 6984);
        assert.isUndefined(ret.body.database.pass);
      });

      describe('should update the environment doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/confyio/projects/main/envs/production', ret));

        it('should be replaced', function () {
          assert.equal(ret.body.config._deleted, true);
          assert.equal(ret.body.config.port, 3000);
          assert.isNull(ret.body.config.name);
          assert.equal(ret.body.config.database.port, 6984);
          assert.isUndefined(ret.body.config.database.pass);
          assert.isUndefined(ret.body.config._id);
        });

        it('should have editor in versions', function () {
          assert.equal(ret.body.versions[0].user, 'pksunkara');
        });
      });
    });
  });
};
