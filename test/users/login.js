var assert = require('chai').assert
  , redis = require('redis').createClient({url: process.env.REDIS_URL || 'redis://localhost:6379'});

module.exports = function (macro) {
  describe('Users', function () {

    describe('Retrieving authenticated user using token from redis', function () {
      var ret = {};

      before(macro.get('/user?access_token=43fb9585328895005ca74bb33a1c46db5b835f2d', null, ret));

      macro.status(200, ret);

      it('should return the user', function () {
        assert.equal(ret.body._id, 'users/pksunkara');
        assert.equal(ret.body.username, 'pksunkara');
        assert.equal(ret.body.fullname, 'Pavan Kumar Sunkara');
        assert.equal(ret.body.email, 'pavan.sss1991@gmail.com');
        assert.equal(ret.body.type, 'user');
        assert.isTrue(ret.body.verified);
      });

      it('should not retun password', function () {
        assert.isUndefined(ret.body.password);
      });

      it('should not return access token', function () {
        assert.isUndefined(ret.body.access_token);
      });

      it('should not retun verification token', function () {
        assert.isUndefined(ret.body.verification_token);
        assert.isUndefined(ret.body.verify_new_email);
      });
    });

    describe('Retrieving authenticated user using token from couchdb', function () {
      var ret = {};

      before(macro.get('/user?access_token=6b6669d493a7b9e375741e34c2b3a1fea38df3a7', null, ret));

      macro.status(200, ret);

      it('should return the user', function () {
        assert.equal(ret.body._id, 'users/whatupdave');
        assert.equal(ret.body.username, 'whatupdave');
        assert.equal(ret.body.fullname, 'Dave Newman');
        assert.equal(ret.body.email, 'dave@snappyco.de');
        assert.equal(ret.body.type, 'user');
        assert.isTrue(ret.body.verified);
      });

      it('should not retun password', function () {
        assert.isUndefined(ret.body.password);
      });

      it('should not return access token', function () {
        assert.isUndefined(ret.body.access_token);
      });

      it('should not retun verification token', function () {
        assert.isUndefined(ret.body.verification_token);
        assert.isUndefined(ret.body.verify_new_email);
      });
    });

    describe('Retrieving authenticated user with non-existent token', function () {
      var ret = {};

      before(macro.get('/user?access_token=43fb9585328895005ca71e34c2b3a1fea38df3a7', null, ret));

      macro.status(401, ret);

      it('should return bad credentials', function () {
        assert.deepEqual(ret.body, {'message':'Bad credentials'});
      });
    });

    describe('Logging in user with token', function () {
      var ret = {};

      before(macro.post('/user/login?access_token=43fb9585328895005ca74bb33a1c46db5b835f2d', {}, null, ret));

      macro.status(401, ret);

      it('should return bad credentials', function () {
        assert.deepEqual(ret.body, {'message':'Bad credentials'});
      });
    });

    describe('Logging in user', function () {
      var ret = {}, token;

      before(macro.post('/user/login', {}, {user: 'vanstee', pass: 'password'}, ret, function () {
        token = ret.body.token;
      }));

      macro.status(200, ret);

      it('should return the token', function () {
        assert.isString(ret.body.token);
      });

      it('should return the user', function () {
        assert.equal(ret.body._id, 'users/vanstee');
        assert.equal(ret.body.username, 'vanstee');
        assert.equal(ret.body.fullname, 'Patrick Van Stee');
        assert.equal(ret.body.email, 'patrick@vanstee.me');
        assert.equal(ret.body.type, 'user');
        assert.isTrue(ret.body.verified);
      });

      it('should not return password', function () {
        assert.isUndefined(ret.body.password);
      });

      it('should not return access token', function () {
        assert.isUndefined(ret.body.access_token);
      });

      describe('should have the access token in redis', function () {
        var ret = {};

        before(function (done) {
          redis.get('confy_' + token, function (err, body) {
            if (err) return done(err);

            ret.body = body;
            done();
          });
        });

        it('and it should return the user', function () {
          body = JSON.parse(ret.body);

          assert.equal(body._id, 'users/vanstee');
          assert.equal(body.username, 'vanstee');
          assert.equal(body.fullname, 'Patrick Van Stee');
          assert.equal(body.email, 'patrick@vanstee.me');
          assert.equal(body.type, 'user');
          assert.isTrue(body.verified);
        });

        describe('and counting redis keys', macro.redis(3, 'three'));
      });
    });
  });
}
