var assert = require('chai').assert;

module.exports = function (macro) {
  describe('Environment Configuration', function () {

    describe('Retrieving them with non-member', function () {
      var ret = {};

      before(macro.get('/orgs/confyio/projects/main/envs/production/config', {user: 'jsmith', pass: 'secret'}, ret));

      macro.status(404, ret);

      it('should return not found', function () {
        assert.deepEqual(ret.body, {message: 'Not found'});
      });
    });

    describe('Retrieving them with member', function () {
      var ret = {};

      before(macro.get('/orgs/confyio/projects/main/envs/production/config', {user: 'pksunkara', pass: 'password'}, ret));

      macro.status(200, ret);

      it('should return config doc', function () {
        assert.isUndefined(ret.body._id);
        assert.equal(ret.body.port, 5000);
      });
    });

    describe('Retrieving via token', function () {
      var ret = {};

      before(macro.get('/orgs/confyio/config/e3badca8afdcb3cc2603666865cd0eb66c011ee8', null, ret));

      macro.status(200, ret);

      it('should return config doc', function () {
        assert.isUndefined(ret.body._id);
        assert.deepEqual(ret.body, 'EWcdL4M3UHUsdpYZKZTnYQ==RDsiGWvifNeWqrLKz9MDRQ==')
      });
    });

    describe('Retrieving via non existent token', function () {
      var ret = {};

      before(macro.get('/orgs/confyio/config/a3badca8afdcb3cc2603666865cd0eb66c011ee8', null, ret));

      macro.status(404, ret);

      it('should return not found', function () {
        assert.deepEqual(ret.body, {message: 'Not found'});
      });
    });

    describe('Retrieving via non matching org', function () {
      var ret = {};

      before(macro.get('/orgs/fire-size/config/a3badca8afdcb3cc2603666865cd0eb66c011ee8', null, ret));

      macro.status(404, ret);

      it('should return not found', function () {
        assert.deepEqual(ret.body, {message: 'Not found'});
      });
    });
  });
};
