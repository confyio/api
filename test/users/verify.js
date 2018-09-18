var assert = require('chai').assert
  , redis = require('redis').createClient({url: process.env.REDIS_URL || 'redis://localhost:6379'})
  , request = require('request');

module.exports = function (macro) {
  describe('Users', function () {
    var ret = {}, vtoken;

    before(macro.doc('users/jsmith', ret, function () {
      vtoken = ret.body.verification_token;
    }));

    describe('Verifying them', function () {
      var ret = {}, token;

      before(function (done) {
        request({
          url: 'http://localhost:5000/users/jsmith/verify/' + vtoken,
          method: 'GET',
          json: true
        }, function (err, res, body) {
          if (err) return done(err);

          ret.res = res;
          ret.body = body;
          token = body.token;
          done();
        });
      });

      macro.status(200, ret);

      it('should return the token', function () {
        assert.isString(ret.body.token);
      });

      it('should return the user', function () {
        assert.equal(ret.body._id, 'users/jsmith');
        assert.equal(ret.body.username, 'jsmith');
        assert.equal(ret.body.type, 'user');
        assert.isTrue(ret.body.verified);
      });

      it('should not return password', function () {
        assert.isUndefined(ret.body.password);
      });

      it('should not return access token', function () {
        assert.isUndefined(ret.body.access_token);
      });

      describe('should update user doc and it', function () {
        var ret = {};

        before(macro.doc('users/jsmith', ret));

        it('should have verified', function () {
          assert.isTrue(ret.body.verified);
        });

        it('should have no verification token', function () {
          assert.isUndefined(ret.body.verification_token);
          assert.isUndefined(ret.body.verify_new_email);
        });
      });

      describe('should have the access token in redis', function () {
        var ret = {};

        before(function (done) {
          redis.get('confy_' + token, function (err, body) {
            if (err) return done(err);

            ret.body = body;
            done();
          })
        });

        it('and it should return the user', function () {
          body = JSON.parse(ret.body);

          assert.equal(body._id, 'users/jsmith');
          assert.equal(body.username, 'jsmith');
          assert.equal(body.type, 'user');
          assert.isTrue(body.verified);
        });
      });
    });

    describe('Verifying non-existent user', function () {
      var ret = {};

      before(macro.get('/users/god/verify/abcdefabcdefabcdefabcdefabcdef1234567890', null, ret));

      macro.status(404, ret);

      it('should return not found', function () {
        assert.deepEqual(ret.body, {message: 'Not found'});
      });
    });
  });
};
