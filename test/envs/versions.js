var assert = require('chai').assert;

module.exports = function (macro) {
  describe('Environment Versions', function () {

    describe('Listing them with no access', function () {
      var ret = {};

      before(macro.get('/orgs/confyio/projects/main/envs/production/versions', {user: 'vanstee', pass: 'password'}, ret));

      macro.status(404, ret);

      it('should return not found', function () {
        assert.deepEqual(ret.body, {'message':'Not found'});
      });
    });

    describe('Listing them with member', function () {
      var ret = {};

      before(macro.get('/orgs/confyio/projects/knowledge-base/envs/production/versions', {user:'vanstee', pass:'password'}, ret));

      macro.status(200, ret);

      it('should return array of versions', function () {
        assert.lengthOf(ret.body, 2);
      });

      it('should return versions from the database', function () {
        assert.equal(ret.body[0].config, "EWcdL4M3UHUsdpYZKZTnYQ==RDsiGWvifNeWqrLKz9MDRQ==");
        assert.equal(ret.body[0].user.username, "pksunkara");
        assert.equal(ret.body[0].user.fullname, "Pavan Kumar Sunkara");
        assert.equal(ret.body[0].time, 1427638419608);
        assert.equal(ret.body[1].config.database.url, "http://db.confy.io");
        assert.equal(ret.body[1].user.username, "vanstee");
        assert.equal(ret.body[1].user.fullname, "Patrick van Stee");
        assert.equal(ret.body[1].time, 1427633285584);
      });
    });
  });
};
