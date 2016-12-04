var assert = require('chai').assert
  , redis = require('redis').createClient({url: process.env.REDISCLOUD_URL || 'redis://localhost:6379'});

module.exports = function (macro) {
  describe('Users', function () {

    describe('Updating authenticated user', function () {
      var ret = {};

      before(macro.patch('/user', {
        email: 'john.smith@gmail.com',
        fullname: 'John Kay Smith',
        random: 'eu9fh7e98f', username: 'hacked'
      }, {user: 'jsmith', pass: 'secret'}, ret));

      macro.status(200, ret);

      it('should return the user', function () {
        assert.equal(ret.body._id, 'users/jsmith');
        assert.equal(ret.body.username, 'jsmith');
        assert.equal(ret.body.type, 'user');
        assert.isFalse(ret.body.verified);
      });

      it('should update the fullname', function () {
        assert.equal(ret.body.fullname, 'John Kay Smith');
      });

      it('should update the email', function () {
        assert.equal(ret.body.email, 'john.smith@gmail.com');
      });

      it('should not return the token', function () {
        assert.isUndefined(ret.body.token);
      });

      it('should not update random fields', function () {
        assert.isUndefined(ret.body.random);
      });

      it('should not retun password', function () {
        assert.isUndefined(ret.body.password);
      });

      it('should not retun verification token', function () {
        assert.isUndefined(ret.body.verification_token);
        assert.isUndefined(ret.body.verify_new_email);
      });

      describe('should update user doc and it', function () {
        var ret = {};

        before(macro.doc('users/jsmith', ret));

        it('should have updated email', function () {
          assert.equal(ret.body.email, 'john.smith@gmail.com');
        });

        it('should have updated fullname', function () {
          assert.equal(ret.body.fullname, 'John Kay Smith');
        });

        it('should have verification token', function () {
          assert.equal(ret.body.verification_token.length, 40);
          assert.isTrue(ret.body.verify_new_email);
        });
      });
    });

    describe('Updating logged in user', function () {
      var ret = {};

      before(macro.patch('/user?access_token=43fb9585328895005ca74bb33a1c46db5b835f2d', {
        fullname: 'Pavan Sunkara',
        email: 'pavan.sss1991@gmail.com'
      }, null, ret));

      macro.status(401, ret);

      it('should return bad credentials', function () {
        assert.deepEqual(ret.body, {message: 'Bad credentials'});
      });

      describe('should not update user doc and it', function () {
        var ret = {};

        before(macro.doc('users/pksunkara', ret));

        it('should have old fullname', function () {
          assert.equal(ret.body.fullname, 'Pavan Kumar Sunkara');
        });
      });
    });

    describe('Updating user with already taken email', function () {
      var ret = {};

      before(macro.patch('/user', {
        email: 'pavan.sss1991@gmail.com'
      }, {user: 'whatupdave', pass: 'password'}, ret));

      macro.status(422, ret);
      macro.validation(1, [['email', 'already_exists']], ret);

      describe('should not update user doc and it', function () {
        var ret = {};

        before(macro.doc('users/whatupdave', ret));

        it('should have old email', function () {
          assert.equal(ret.body.email, 'dave@snappyco.de');
        });
      });
    });

    describe('Updating user with invalid email', function () {
      var ret = {};

      before(macro.patch('/user', {
        email: 'invalid@email'
      }, {user: 'whatupdave', pass: 'password'}, ret));

      macro.status(422, ret);
      macro.validation(1, [['email', 'invalid']], ret);

      describe('should not update user doc and it', function () {
        var ret = {};

        before(macro.doc('users/whatupdave', ret));

        it('should have old email', function () {
          assert.equal(ret.body.email, 'dave@snappyco.de');
        });
      });
    });

    describe('Updating authenticated user excluding email', function () {
      var ret = {}, token;

      before(macro.patch('/user', {
        fullname: 'Patrick van Stee',
        email: 'patrick@vanstee.me'
      }, {user: 'vanstee', pass: 'password'}, ret, function () {
        token = ret.body.token;
      }));

      macro.status(200, ret);

      it('should return the user', function () {
        assert.equal(ret.body._id, 'users/vanstee');
        assert.equal(ret.body.username, 'vanstee');
        assert.equal(ret.body.email, 'patrick@vanstee.me');
        assert.equal(ret.body.type, 'user');
        assert.isTrue(ret.body.verified);
      });

      it('should update the fullname', function () {
        assert.equal(ret.body.fullname, 'Patrick van Stee');
      });

      it('should return the token', function () {
        assert.isString(ret.body.token);
      });

      it('should not retun password', function () {
        assert.isUndefined(ret.body.password);
      });

      it('should not return access token', function () {
        assert.isUndefined(ret.body.access_token);
      });

      describe('should update user doc and it', function () {
        var ret = {};

        before(macro.doc('users/vanstee', ret));

        it('should have updated fullname', function () {
          assert.equal(ret.body.fullname, 'Patrick van Stee');
        });

        it('should not have verification token', function () {
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
          });
        });

        it('and it should return the user', function () {
          body = JSON.parse(ret.body);

          assert.equal(body._id, 'users/vanstee');
          assert.equal(body.username, 'vanstee');
          assert.equal(body.fullname, 'Patrick van Stee');
          assert.equal(body.email, 'patrick@vanstee.me');
          assert.equal(body.type, 'user');
          assert.isTrue(body.verified);
        });
      });

      describe('and counting redis keys', macro.redis(4, 'four'));
    });
  });
};
