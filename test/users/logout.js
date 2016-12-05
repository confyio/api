var assert = require('chai').assert
  , redis = require('redis').createClient({url: process.env.REDISCLOUD_URL || 'redis://localhost:6379'});

module.exports = function (macro) {
  describe('Users', function () {

    describe('Logging out user without access token', function () {
      var ret = {};

      before(macro.get('/user/logout', {user: 'pksunkara', pass: 'password'}, ret));

      macro.status(204, ret);

      it('should not return anything', function () {
        assert.isUndefined(ret.body);
      });

      describe('and reading the access token from redis', function () {
        var ret = {};

        before(macro.redisget('confy_43fb9585328895005ca74bb33a1c46db5b835f2d', ret));

        it('should return something', function () {
          assert.isDefined(ret.body);
        });

        describe('and counting redis keys', macro.redis(3, 'three'));
      });
    });

    describe('Logging out user', function () {
      var ret = {};

      before(macro.get('/user/logout?access_token=fad47f775369e976bcee4cdd1a6b263c3b7d1ade', null, ret));

      macro.status(204, ret);

      it('should not return anything', function () {
        assert.isUndefined(ret.body);
      });

      describe('and reading the access token from redis', function () {
        var ret = {};

        before(macro.redisget('confy_fad47f775369e976bcee4cdd1a6b263c3b7d1ade', ret));

        it('should return null', function () {
          assert.isNull(ret.body);
        });

        describe('and counting redis keys', macro.redis(2, 'two'));
      });
    });
  });
}
